'use client';

// SM-001 — shared accessible dropdown primitive (closed <-> open).
// Used by the language switcher, account menu, notification panel and quick-action widget
// so every header/widget dropdown gets the same toggle / click-outside / Enter / Space / Esc
// behaviour from one place (TC ID-30 - ID-35).

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

export interface DropdownTriggerProps {
  id: string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  'aria-expanded': boolean;
  'aria-haspopup': 'menu';
  /**
   * How the Escape handler below finds the trigger to restore focus to. It ships as part of
   * the trigger props rather than being added by each caller: a consumer that forgot it
   * would lose Escape-refocus silently — `?.focus()` on nothing is not an error.
   */
  'data-dropdown-trigger': 'true';
}

interface DropdownMenuProps {
  /** Render prop so callers can style the trigger element freely (button, div, etc). */
  trigger: (props: DropdownTriggerProps, open: boolean) => ReactNode;
  /** Render prop for the menu content; receives `close` to dismiss on item select. */
  children: (props: { close: () => void }) => ReactNode;
  align?: 'left' | 'right';
  menuLabel?: string;
  className?: string;
  /**
   * Substitutes the panel's chrome classes (background/border/radius/padding/spacing)
   * outright — it does not concatenate. Omit it and the rendered class string is
   * byte-for-byte the default below. See language-switcher.tsx for the one caller
   * that supplies a design-specific chrome (mm:525:11713).
   */
  menuClassName?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = 'left',
  menuLabel,
  className,
  menuClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();

  const close = () => setOpen(false);
  const toggle = () => setOpen((value) => !value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        rootRef.current
          ?.querySelector<HTMLElement>('[data-dropdown-trigger="true"]')
          ?.focus();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  }

  return (
    <div ref={rootRef} className={`relative inline-block ${className ?? ''}`}>
      {trigger(
        {
          id: triggerId,
          onClick: toggle,
          onKeyDown: handleTriggerKeyDown,
          'aria-expanded': open,
          'aria-haspopup': 'menu',
          'data-dropdown-trigger': 'true',
        },
        open,
      )}
      {open && (
        <div
          role="menu"
          aria-labelledby={triggerId}
          aria-label={menuLabel}
          className={`absolute z-50 ${
            menuClassName ??
            'mt-2 min-w-[10rem] rounded-md border border-border-accent bg-header-bg py-1 saa-glow'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}
