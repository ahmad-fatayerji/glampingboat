"use client";

import { useCallback } from "react";
import { useLanguage } from "./LanguageContext";
import { dictionaries, type TranslationKey } from "./dictionaries";

export type { TranslationKey } from "./dictionaries";

export function useT() {
  const { locale } = useLanguage();
  const dict = dictionaries[locale] ?? dictionaries.en;

  return useCallback(
    (key: TranslationKey) => dict[key] ?? dictionaries.en[key] ?? key,
    [dict]
  );
}
