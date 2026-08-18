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
