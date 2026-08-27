# Regression E2E Test — Homepage i18n Content Gap

## GREEN Evidence (After Implementation Fix)

**Status:** ALL TESTS PASS

The implementation fix correctly translates all three body content blocks on language switch. Exit code: `0`

```
✓  1 › Root Further theme paragraphs translate VI→EN and back (754ms)
✓  4 › Award card descriptions translate VI→EN and back (770ms)
✓  3 › Root Further blockquote gloss translates VI→EN and back (783ms)
✓  2 › Kudos section heading and promo translate VI→EN and back (802ms)

4 passed (12.2s)
```

### Spec Fixes Applied

1. **Quote style brittleness** — Changed assertion from literal straight-quote string to regex pattern `/A tree with deep roots fears no storm/` to match curly quotes in actual rendered output.
2. **Locator re-resolution** — Fixed switch-back-to-VI steps in all four tests. Changed from reusing original `langButton` (which resolves to "VN" initially) to re-querying with `/EN/i` matcher (current state after language change), preventing timeout failures.
3. **Strengthened test 1** — Added EN-specific assertion for gloss `(English proverb)` visible after EN switch and gone after VI switch, replacing untestable tautology (English proverb is English-side in both locales).

---

## RED Evidence (Original Bug)

**redTestFiles:**
- `e2e/homepage-language-content.spec.ts`

**redCommand:**
```
npx playwright test --project=homepage-with-open-gate e2e/homepage-language-content.spec.ts
```

**redExitCode:**
```
1
```

**redFailure (from test output):**

All four tests failed with the same root cause — Vietnamese body content remains visible (count: 1) after language switch to EN, when the assertion expects it to be gone (count: 0).

**Test 1 failure:**
```
Error: expect(locator).toHaveCount(expected) failed
Locator: getByText('(Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)')
Expected: 0
Received: 1
```
Location: `e2e/homepage-language-content.spec.ts:25:7`

**Test 2 failure:**
```
Error: expect(locator).toHaveCount(expected) failed
Locator: getByText(/Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI/)
Expected: 0
Received: 1
```
Location: `e2e/homepage-language-content.spec.ts:61:7`

**Test 3 failure:**
```
Error: expect(locator).toHaveCount(expected) failed
Locator: getByText('ĐIỂM MỚI CỦA SAA 2025')
Expected: 0
Received: 1
```
Location: `e2e/homepage-language-content.spec.ts:94:59`

**Test 4 failure:**
```
Error: expect(locator).toHaveCount(expected) failed
Locator: getByText('Vinh danh top cá nhân xuất sắc trên mọi phương diện')
Expected: 0
Received: 1
```
Location: `e2e/homepage-language-content.spec.ts:134:7`

## Summary

The regression spec confirms the reported bug: three body content blocks remain in Vietnamese after language switch to EN.

1. **Root Further blockquote gloss** — Vietnamese gloss text `(Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)` is not replaced with English on EN switch.
2. **Root Further theme paragraphs** — Opening phrase `Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI` remains visible in Vietnamese.
3. **Kudos section heading and promo body** — Title `ĐIỂM MỚI CỦA SAA 2025` and promo paragraph opening remain in Vietnamese.
4. **Award card descriptions** — Award description `Vinh danh top cá nhân xuất sắc trên mọi phương diện` stays Vietnamese on EN switch.

All four tests fail on the post-switch `.toHaveCount(0)` assertion, proving the Vietnamese content is present when it should have been translated to English.

## Test Structure

Each test follows the both-directions pattern:
- PRECONDITION: Assert Vietnamese string is visible (VI mode)
- ACTION: Switch language to EN via dropdown
- ASSERTION: Vietnamese string is gone (count 0)
- ACTION: Switch back to VI
- ASSERTION: Vietnamese string returns

This prevents false positives from pages that merely render without language support.
