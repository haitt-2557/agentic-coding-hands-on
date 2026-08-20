import { test, expect } from '@playwright/test';
import { AWARDS, EXPECTED_AWARD_SLUGS, awardHref } from './awards';

// FR-013/014 + BR-005 — award data + slug -> href derivation.

test.describe('AWARDS', () => {
  test('has exactly six entries', () => {
    expect(AWARDS).toHaveLength(6);
  });

  test('carries the exact frozen slug list, in order', () => {
    expect(AWARDS.map((award) => award.slug)).toEqual([
      'top-talent',
      'top-project',
      'top-project-leader',
      'best-manager',
      'signature-2025-creator',
      'mvp',
    ]);
    expect(EXPECTED_AWARD_SLUGS).toEqual([
      'top-talent',
      'top-project',
      'top-project-leader',
      'best-manager',
      'signature-2025-creator',
      'mvp',
    ]);
  });

  test('every slug is unique', () => {
    const slugs = AWARDS.map((award) => award.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('every entry has a non-empty title, description, and image', () => {
    for (const award of AWARDS) {
      expect(award.title.trim().length).toBeGreaterThan(0);
      expect(award.description.trim().length).toBeGreaterThan(0);
      expect(award.image.trim().length).toBeGreaterThan(0);
    }
  });
});

test.describe('Award — awards-page fields (longDescription, quantity, prizeLines)', () => {
  test('every entry has at least one non-empty longDescription paragraph', () => {
    for (const award of AWARDS) {
      expect(award.longDescription.length).toBeGreaterThan(0);
      for (const paragraph of award.longDescription) {
        expect(paragraph.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('every entry has a non-empty quantity value and unit', () => {
    for (const award of AWARDS) {
      expect(award.quantity.value.trim().length).toBeGreaterThan(0);
      expect(award.quantity.unit.trim().length).toBeGreaterThan(0);
    }
  });

  test('every entry has 1 or 2 prize lines, each with a non-empty amount', () => {
    for (const award of AWARDS) {
      expect(award.prizeLines.length).toBeGreaterThanOrEqual(1);
      expect(award.prizeLines.length).toBeLessThanOrEqual(2);
      for (const line of award.prizeLines) {
        expect(line.amount.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('signature-2025-creator carries exactly two prize lines (individual or team)', () => {
    const signature = AWARDS.find((award) => award.slug === 'signature-2025-creator');
    expect(signature?.prizeLines).toHaveLength(2);
  });

  test('best-manager and mvp carry exactly one prize line with no note', () => {
    const bestManager = AWARDS.find((award) => award.slug === 'best-manager');
    const mvp = AWARDS.find((award) => award.slug === 'mvp');
    expect(bestManager?.prizeLines).toHaveLength(1);
    expect(bestManager?.prizeLines?.[0]?.note).toBeUndefined();
    expect(mvp?.prizeLines).toHaveLength(1);
    expect(mvp?.prizeLines?.[0]?.note).toBeUndefined();
  });

  test('top-talent quantity is pinned to 10 Cá nhân (frame wins over spec CSV defect #3)', () => {
    const topTalent = AWARDS.find((award) => award.slug === 'top-talent');
    expect(topTalent?.quantity).toEqual({ value: '10', unit: 'Cá nhân' });
  });
});

test.describe('awardHref', () => {
  test('links to /awards#<slug> when a slug is present (ID-47..52)', () => {
    expect(awardHref('top-talent')).toBe('/awards#top-talent');
    expect(awardHref('mvp')).toBe('/awards#mvp');
  });

  test('falls back to /awards with no hash when the slug is missing (BR-005, ID-62)', () => {
    expect(awardHref(undefined)).toBe('/awards');
    expect(awardHref('')).toBe('/awards');
  });
});
