import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getContactEmailCopy,
  getPasswordResetEmailCopy,
  normalizeEmailLocale,
} from "@/lib/email-i18n";

test("email locale normalization accepts supported locales", () => {
  assert.equal(normalizeEmailLocale("fr"), "fr");
  assert.equal(normalizeEmailLocale("ru"), "ru");
});

test("email locale normalization falls back to English", () => {
  assert.equal(normalizeEmailLocale("pt"), "en");
  assert.equal(normalizeEmailLocale(undefined), "en");
});

test("password reset copy follows locale with English fallback", () => {
  assert.equal(
    getPasswordResetEmailCopy("fr").subject,
    "Reinitialisez votre mot de passe Glamping Boat"
  );
  assert.equal(
    getPasswordResetEmailCopy("unknown").subject,
    "Reset your Glamping Boat password"
  );
});

test("contact copy follows locale", () => {
  const copy = getContactEmailCopy("de");

  assert.equal(copy.fields.message, "Nachricht");
  assert.equal(copy.subject, "Neue Kontaktanfrage - Glamping Boat");
});
