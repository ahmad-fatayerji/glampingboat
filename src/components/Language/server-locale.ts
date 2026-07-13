import { cookies } from "next/headers";
import {
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/components/Language/dictionaries";
import { normalizeLocale } from "@/components/admin/admin-i18n";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_STORAGE_KEY)?.value);
}
