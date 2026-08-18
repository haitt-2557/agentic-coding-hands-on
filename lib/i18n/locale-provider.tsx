'use client';

// FR-002 + BR-006 — hand-rolled VN/EN locale switching. No new runtime dependency
// (next-intl was considered and deferred per clarifications.md — YAGNI until a third
// locale is needed).

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { vi, type DictionaryKey } from './dictionaries/vi';
import { en } from './dictionaries/en';

export type Locale = 'vi' | 'en';

export interface I18nState {
  t: (key: string) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LOCALE_STORAGE_KEY = 'saa.locale';
const DEFAULT_LOCALE: Locale = 'vi';

const DICTIONARIES: Record<Locale, Record<DictionaryKey, string>> = { vi, en };

function isLocale(value: string | null): value is Locale {
  return value === 'vi' || value === 'en';
}

/** Reads the persisted choice. Only called from `useEffect` — never during render. */
function resolvePersistedLocale(): Locale {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : DEFAULT_LOCALE;
}

function translate(locale: Locale, key: string): string {
  const dictionary = DICTIONARIES[locale] as Record<string, string>;
  return dictionary[key] ?? key;
}

const DEFAULT_I18N_STATE: I18nState = {
  t: (key) => translate(DEFAULT_LOCALE, key),
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
};

const I18nContext = createContext<I18nState>(DEFAULT_I18N_STATE);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // SSR/first-paint default is 'vi' so server and client markup match; the persisted
  // choice is reconciled after mount to avoid a hydration mismatch (localStorage does
  // not exist on the server).
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    // Deliberate: this is the SSR-default -> client-reconcile hydration pattern the phase
    // spec requires. A lazy `useState` initializer would run during the hydration render
    // itself and could read a different value than the server (e.g. locale 'en' already
    // in localStorage while the server rendered 'vi'), which is the actual hydration
    // mismatch this codebase must avoid — so the reconcile has to happen post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(resolvePersistedLocale());
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  };

  const value: I18nState = {
    t: (key) => translate(locale, key),
    locale,
    setLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nState {
  return useContext(I18nContext);
}
