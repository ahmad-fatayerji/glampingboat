"use client";

import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LOCALES, type Locale } from "./dictionaries";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const FALLBACK_LANGUAGE_CONTEXT: LanguageContextValue = {
  locale: "en",
  setLocale: () => {
    // No-op fallback to avoid hard render failures when provider isn't mounted yet.
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);
const STORAGE_KEY = "site-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && LOCALES.includes(saved)) {
        startTransition(() => {
          setLocale(saved);
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {}
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return ctx ?? FALLBACK_LANGUAGE_CONTEXT;
}
