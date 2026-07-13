"use client";

import { useLanguage } from "@/components/Language/LanguageContext";
import { tAdmin } from "./admin-i18n";

export function useAdminT() {
  const { locale } = useLanguage();
  return (key: Parameters<typeof tAdmin>[1], replacements?: Parameters<typeof tAdmin>[2]) =>
    tAdmin(locale, key, replacements);
}
