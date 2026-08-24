import { test, expect } from '@playwright/test';
import { applyMarkdown } from './markdown';

// ALG-001 — split out of validation.test.ts (2026-08-24 review pass) so each test file
// co-locates with the module it exercises and both stay under the 200-line ceiling.

test.describe('applyMarkdown (ALG-001)', () => {
  test('bold wraps the selection in **', () => {
    const result = applyMarkdown('bold', 'hello world', 6, 11);
    expect(result.value).toBe('hello **world**');
  });

  test('italic wraps the selection in *', () => {
    expect(applyMarkdown('italic', 'hello world', 6, 11).value).toBe('hello *world*');
  });

  test('strike wraps the selection in ~~ (spec C.3 mistype, real toggle per ID-29)', () => {
    expect(applyMarkdown('strike', 'hello world', 6, 11).value).toBe('hello ~~world~~');
  });

  test('numberedList prefixes the selection with "1. "', () => {
    expect(applyMarkdown('numberedList', 'hello world', 6, 11).value).toBe('hello 1. world');
  });

  test('link wraps the selection as [text](url)', () => {
    expect(applyMarkdown('link', 'hello world', 6, 11).value).toBe('hello [world](url)');
  });

  test('quote prefixes the selection with "> "', () => {
    expect(applyMarkdown('quote', 'hello world', 6, 11).value).toBe('hello > world');
  });

  test('with an empty selection, inserts the marker pair at the caret', () => {
    const result = applyMarkdown('bold', 'hello ', 6, 6);
    expect(result.value).toBe('hello ****');
    expect(result.selectionStart).toBe(8);
    expect(result.selectionEnd).toBe(8);
  });
});
