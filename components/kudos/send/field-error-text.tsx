// D14 — shared inline error renderer. Every required field (recipient, title, message,
// hashtag, nickname) shows the SAME copy in the SAME visual shape next to the offending
// field (dom-contract.md D14: "Several may show at once"). One component, not five copies
// (DRY) — reuses the app's existing danger-text convention (components/login/login-error-alert.tsx).

interface FieldErrorTextProps {
  text: string;
}

export function FieldErrorText({ text }: FieldErrorTextProps) {
  // mm: no dedicated node — dom-contract.md D14 is a test-asserted requirement with no frame
  // backing of its own; styled to match the app's one existing error-text precedent.
  return (
    <p role="alert" className="text-sm font-bold text-badge-danger">
      {text}
    </p>
  );
}

/** Shared border class for a field wrapper: red when invalid, the frame's own accent otherwise. */
export function fieldBorderClass(hasError: boolean): string {
  return hasError ? 'border-badge-danger' : 'border-border-accent';
}
