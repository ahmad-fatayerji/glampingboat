import assert from "node:assert/strict";
import { test } from "node:test";
import {
  emailsShareMailbox,
  normalizeEmailAddress,
} from "@/lib/email-identity";

test("consumer Gmail canonicalization ignores dots, case, plus tags, and googlemail", () => {
  assert.equal(
    normalizeEmailAddress(" Ahmad.Fatayerji2004+booking@GoogleMail.com ")
      ?.canonicalEmail,
    "ahmadfatayerji2004@gmail.com"
  );
  assert.equal(
    emailsShareMailbox(
      "ahmad.fatayerji2004@gmail.com",
      "ahmadfatayerji2004@gmail.com"
    ),
    true
  );
});

test("dots and plus signs remain significant outside consumer Gmail", () => {
  assert.equal(
    emailsShareMailbox("first.last@example.com", "firstlast@example.com"),
    false
  );
  assert.equal(
    normalizeEmailAddress("person+booking@example.com")?.canonicalEmail,
    "person+booking@example.com"
  );
});

test("invalid email shapes are rejected", () => {
  assert.equal(normalizeEmailAddress("not-an-email"), null);
  assert.equal(normalizeEmailAddress("a@@example.com"), null);
  assert.equal(normalizeEmailAddress("@example.com"), null);
});
