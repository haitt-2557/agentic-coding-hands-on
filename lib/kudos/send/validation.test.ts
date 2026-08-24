import { test, expect } from '@playwright/test';
import {
  TITLE_MAX,
  MESSAGE_MAX,
  HASHTAG_MAX,
  IMAGE_MAX,
  IMAGE_MAX_BYTES,
  REQUIRED_FIELD_ERROR,
  canSubmit,
  validateDraft,
  validateField,
  isAcceptedImage,
  isValidImageCount,
  dedupeHashtagIds,
  filterProfiles,
} from './validation';
import type { KudosDraft, ProfileOption } from './types';

// BR-002..BR-007, DEC-001, ALG-001 — pure contract shared by the client form and the
// server action (architecture.md §4: client validation always defeatable via DevTools).

function baseDraft(overrides: Partial<KudosDraft> = {}): KudosDraft {
  return {
    recipientId: 'le-kieu-trang',
    title: 'Người truyền động lực',
    message: 'Cảm ơn bạn rất nhiều',
    hashtagIds: ['#GO FAST'],
    isAnonymous: false,
    nickname: '',
    ...overrides,
  };
}

const PROFILES: ProfileOption[] = [
  { id: 'le-kieu-trang', displayName: 'Lê Kiều Trang', department: 'CEVC10' },
  { id: 'nguyen-ba-chuc', displayName: 'Nguyễn Bá Chức', department: 'CEVC10' },
];

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

test.describe('canSubmit (DEC-001)', () => {
  test('true only when every required field is present', () => {
    expect(canSubmit(baseDraft())).toBe(true);
  });

  test('false for every single-field-missing permutation', () => {
    expect(canSubmit(baseDraft({ recipientId: null }))).toBe(false);
    expect(canSubmit(baseDraft({ title: '   ' }))).toBe(false);
    expect(canSubmit(baseDraft({ message: '' }))).toBe(false);
    expect(canSubmit(baseDraft({ hashtagIds: [] }))).toBe(false);
  });

  test('nickname required iff anonymous, both directions (BR-006)', () => {
    expect(canSubmit(baseDraft({ isAnonymous: true, nickname: '' }))).toBe(false);
    expect(canSubmit(baseDraft({ isAnonymous: true, nickname: 'Ẩn danh' }))).toBe(true);
    expect(canSubmit(baseDraft({ isAnonymous: false, nickname: '' }))).toBe(true);
  });
});

test.describe('validateField / validateDraft', () => {
  test('returns the exact required-field copy for an empty required field', () => {
    expect(validateField('recipientId', baseDraft({ recipientId: null }))).toBe(
      REQUIRED_FIELD_ERROR
    );
    expect(validateField('title', baseDraft({ title: ' ' }))).toBe(REQUIRED_FIELD_ERROR);
    expect(validateField('message', baseDraft({ message: '' }))).toBe(REQUIRED_FIELD_ERROR);
    expect(validateField('hashtagIds', baseDraft({ hashtagIds: [] }))).toBe(
      REQUIRED_FIELD_ERROR
    );
  });

  test('title over 100 chars fails even when non-empty', () => {
    const overlong = 'a'.repeat(TITLE_MAX + 1);
    expect(validateField('title', baseDraft({ title: overlong }))).toBeTruthy();
  });

  test('message over 1000 chars fails even when non-empty', () => {
    const overlong = 'a'.repeat(MESSAGE_MAX + 1);
    expect(validateField('message', baseDraft({ message: overlong }))).toBeTruthy();
  });

  test('hashtags over the 5 max fails', () => {
    const tooMany = ['#a', '#b', '#c', '#d', '#e', '#f'];
    expect(tooMany.length).toBeGreaterThan(HASHTAG_MAX);
    expect(validateField('hashtagIds', baseDraft({ hashtagIds: tooMany }))).toBeTruthy();
  });

  test('nickname required only when anonymous', () => {
    expect(validateField('nickname', baseDraft({ isAnonymous: true, nickname: '' }))).toBe(
      REQUIRED_FIELD_ERROR
    );
    expect(
      validateField('nickname', baseDraft({ isAnonymous: false, nickname: '' }))
    ).toBeUndefined();
  });

  test('validateDraft collects only the fields that actually fail', () => {
    const errors = validateDraft(baseDraft({ recipientId: null, hashtagIds: [] }));
    expect(errors.recipientId).toBe(REQUIRED_FIELD_ERROR);
    expect(errors.hashtagIds).toBe(REQUIRED_FIELD_ERROR);
    expect(errors.title).toBeUndefined();
    expect(errors.message).toBeUndefined();
  });
});

test.describe('isAcceptedImage (BR-005)', () => {
  test('accepts jpg and png under the byte cap', () => {
    expect(isAcceptedImage(makeFile('a.jpg', 'image/jpeg', 1024))).toBe(true);
    expect(isAcceptedImage(makeFile('a.png', 'image/png', 1024))).toBe(true);
  });

  test('rejects pdf, mp4 and txt', () => {
    expect(isAcceptedImage(makeFile('a.pdf', 'application/pdf', 1024))).toBe(false);
    expect(isAcceptedImage(makeFile('a.mp4', 'video/mp4', 1024))).toBe(false);
    expect(isAcceptedImage(makeFile('a.txt', 'text/plain', 1024))).toBe(false);
  });

  test('rejects a jpg over the byte cap', () => {
    expect(isAcceptedImage(makeFile('big.jpg', 'image/jpeg', IMAGE_MAX_BYTES + 1))).toBe(
      false
    );
  });
});

// Server-side hardening (review findings, 2026-08-24): a Server Action is a public trust
// boundary — a caller who never touches the UI can post more files than the add button
// ever allowed, or duplicate hashtag ids that would violate kudos_hashtags' primary key
// after the parent kudos row is already written.
test.describe('isValidImageCount (server-side re-check of the 5-image cap)', () => {
  test('accepts 0 through IMAGE_MAX images', () => {
    expect(isValidImageCount(0)).toBe(true);
    expect(isValidImageCount(IMAGE_MAX)).toBe(true);
  });

  test('rejects a count over IMAGE_MAX', () => {
    expect(isValidImageCount(IMAGE_MAX + 1)).toBe(false);
    expect(isValidImageCount(50)).toBe(false);
  });
});

test.describe('dedupeHashtagIds (prevents an orphaned kudos row on duplicate ids)', () => {
  test('removes duplicates while preserving first-seen order', () => {
    expect(dedupeHashtagIds(['#GO FAST', '#WASSHOI', '#GO FAST'])).toEqual([
      '#GO FAST',
      '#WASSHOI',
    ]);
  });

  test('leaves an already-distinct list unchanged', () => {
    expect(dedupeHashtagIds(['#GO FAST', '#WASSHOI'])).toEqual(['#GO FAST', '#WASSHOI']);
  });

  test('handles an empty list', () => {
    expect(dedupeHashtagIds([])).toEqual([]);
  });

  test('a duplicate-inflated list still fails the max-5 check once deduped', () => {
    const inflated = ['#GO FAST', '#GO FAST', '#GO FAST', '#GO FAST', '#GO FAST', '#GO FAST'];
    // Before dedup this looks like 6 entries (already over HASHTAG_MAX); the point of
    // dedupe is that it never UNDER-counts a real violation into looking valid.
    expect(dedupeHashtagIds(inflated)).toEqual(['#GO FAST']);
    expect(dedupeHashtagIds(inflated).length).toBeLessThanOrEqual(HASHTAG_MAX);
  });
});

test.describe('filterProfiles (S5, ID-10)', () => {
  test('trims the query before matching, case-insensitively', () => {
    expect(filterProfiles(PROFILES, '  trang  ')).toEqual([
      { id: 'le-kieu-trang', displayName: 'Lê Kiều Trang', department: 'CEVC10' },
    ]);
  });

  test('returns empty array for an empty (or all-whitespace) query', () => {
    expect(filterProfiles(PROFILES, '')).toEqual([]);
    expect(filterProfiles(PROFILES, '   ')).toEqual([]);
  });

  test('matches as a substring, not just a prefix', () => {
    expect(filterProfiles(PROFILES, 'Chức')).toEqual([
      { id: 'nguyen-ba-chuc', displayName: 'Nguyễn Bá Chức', department: 'CEVC10' },
    ]);
  });
});

// applyMarkdown (ALG-001) tests live in markdown.test.ts, colocated with markdown.ts.
