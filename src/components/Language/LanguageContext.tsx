"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "en" | "fr" | "de" | "nl" | "ru" | "es" | "it";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);
const STORAGE_KEY = "site-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved) setLocale(saved);
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
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
