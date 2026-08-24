// ALG-001_ApDungDinhDangMarkdownVaoVungChon — pure selection-wrapping transforms for the
// message toolbar (clarifications decision 5: markdown-lite, plain text stored, no HTML
// generated so there is no sanitisation surface). Split out of validation.ts per phase-03's
// pre-authorised split to keep both files under the 200-line ceiling.
//
// Note on `strike`: technical-spec.md records that MoMorph spec row C.3 mislabels this
// button "others/decorative"; ID-29 and the row's own description both confirm it is a real
// strikethrough toggle, so it is implemented as one here (design defect, not re-litigated).

export type MarkdownKind = 'bold' | 'italic' | 'strike' | 'numberedList' | 'link' | 'quote';

interface MarkdownResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

function wrapSelection(
  before: string,
  selected: string,
  after: string,
  prefix: string,
  suffix: string
): MarkdownResult {
  const selectionStart = before.length + prefix.length;
  return {
    value: `${before}${prefix}${selected}${suffix}${after}`,
    selectionStart,
    selectionEnd: selectionStart + selected.length,
  };
}

function prefixSelection(
  before: string,
  selected: string,
  after: string,
  prefix: string
): MarkdownResult {
  const selectionStart = before.length + prefix.length;
  return {
    value: `${before}${prefix}${selected}${after}`,
    selectionStart,
    selectionEnd: selectionStart + selected.length,
  };
}

/**
 * Wraps the `[start, end)` selection of `text` in the markdown syntax for `kind`. With an
 * empty selection (`start === end`), the marker pair is inserted at the caret instead, and
 * the returned selection collapses to the point between the two markers (bold/italic/
 * strike/link) or right after the inserted prefix (numberedList/quote).
 */
export function applyMarkdown(
  kind: MarkdownKind,
  text: string,
  start: number,
  end: number
): MarkdownResult {
  const selected = text.slice(start, end);
  const before = text.slice(0, start);
  const after = text.slice(end);

  switch (kind) {
    case 'bold':
      return wrapSelection(before, selected, after, '**', '**');
    case 'italic':
      return wrapSelection(before, selected, after, '*', '*');
    case 'strike':
      return wrapSelection(before, selected, after, '~~', '~~');
    case 'numberedList':
      return prefixSelection(before, selected, after, '1. ');
    case 'link':
      return wrapSelection(before, selected, after, '[', '](url)');
    case 'quote':
      return prefixSelection(before, selected, after, '> ');
  }
}
