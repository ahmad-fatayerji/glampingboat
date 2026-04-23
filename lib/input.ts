import { PHONE_FIELDS, type PhoneField } from "@/lib/types";

export function isPhoneField(value: string): value is PhoneField {
  return (PHONE_FIELDS as readonly string[]).includes(value);
}

export function sanitizePhoneNumber(value: string) {
  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D+/g, "");

  return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
}
