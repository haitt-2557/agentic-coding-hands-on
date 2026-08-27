# RED Evidence — Phase 01 (E2E Design Contract)

## Execution Details

**redTestFiles:** `e2e/homepage-language-dropdown.spec.ts`

**redCommand:** `npm run test:e2e -- e2e/homepage-language-dropdown.spec.ts`

**redExitCode:** `1`

## Failure Details

**redFailure:** Assertion on panel background-color design value failed

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  getByRole('menu')
Expected: "rgb(0, 7, 12)"
Received: "rgba(16, 20, 23, 0.8)"
Timeout:  5000ms

Call log:
  - Expect "toHaveCSS" with timeout 5000ms
  - waiting for getByRole('menu')
    14 × locator resolved to <div role="menu" aria-label="Language" aria-labelledby="_R_1havb_" class="absolute z-50 mt-2 min-w-[10rem] rounded-md border border-border-accent bg-header-bg py-1 saa-glow right-0">…</div>
       - unexpected value "rgba(16, 20, 23, 0.8)"

  23 |
  24 |     // Background color: rgb(0, 7, 12)
> 25 |     await expect(menu).toHaveCSS('background-color', 'rgb(0, 7, 12)');
     |                        ^
  26 |
  27 |     // Border radius: 8px
  28 |     await expect(menu).toHaveCSS('border-radius', '8px');
```

## Test Outcome

- **Status:** VALID RED ✓
- **Assertion Group:** Panel chrome (`background-color`, `border-radius`, `padding`, `border-width`, `border-color`)
- **Failure Type:** Design value mismatch — background-color on the language dropdown panel
- **Location:** Line 25 of `e2e/homepage-language-dropdown.spec.ts`

The language-dropdown component does not yet exist (phase 02 implementation). The current dropdown menu uses inherited styles from the shared `DropdownMenu` primitive, which renders with `rgba(16, 20, 23, 0.8)` background. The test correctly asserts the design value `rgb(0, 7, 12)` per the MoMorph spec, and fails when the value is not present.

## Test Command

Full raw output:

```
> my-app@0.1.0 test:e2e
> playwright test e2e/homepage-language-dropdown.spec.ts

Running 1 test using 1 worker

  ✘  1 [homepage-with-open-gate] › e2e/homepage-language-dropdown.spec.ts:7:7 › Homepage Language Dropdown — Design Contract (F005) › Design contract: panel chrome, row styling, flags, selected state, trigger update, and locale swap (5.3s)


  1) [homepage-with-open-gate] › e2e/homepage-language-dropdown.spec.ts:7:7 › Homepage Language Dropdown — Design Contract (F005) › Design contract: panel chrome, row styling, flags, selected state, trigger update, and locale swap 

    Error: expect(locator).toHaveCSS(expected) failed

    Locator:  getByRole('menu')
    Expected: "rgb(0, 7, 12)"
    Received: "rgba(16, 20, 23, 0.8)"
    Timeout:  5000ms

    Call log:
      - Expect "toHaveCSS" with timeout 5000ms
      - waiting for getByRole('menu')
        14 × locator resolved to <div role="menu" aria-label="Language" aria-labelledby="_R_1havb_" class="absolute z-50 mt-2 min-w-[10rem] rounded-md border border-border-accent bg-header-bg py-1 saa-glow right-0">…</div>
           - unexpected value "rgba(16, 20, 23, 0.8)"

      23 |
      24 |     // Background color: rgb(0, 7, 12)
    > 25 |     await expect(menu).toHaveCSS('background-color', 'rgb(0, 7, 12)');
         |                        ^
      26 |
      27 |     // Border radius: 8px
      28 |     await expect(menu).toHaveCSS('border-radius', '8px');

  1 failed
    [homepage-with-open-gate] › e2e/homepage-language-dropdown.spec.ts:7:7 › Homepage Language Dropdown — Design Contract (F005) › Design contract: panel chrome, row styling, flags, selected state, trigger update, and locale swap

Test Files  1 failed   1 total (1 failed)
Tests       1 failed   1 total (1 failed)
```

## Gate Status

The RED gate is **CLEAR** — phase 02 (momorph-ui-implementer) may now proceed with implementation.
