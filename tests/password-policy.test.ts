import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePasswordPolicy } from "@/lib/password-policy";

test("password policy accepts a balanced password", () => {
  const result = validatePasswordPolicy("Correct1!");

  assert.equal(result.valid, true);
  assert.equal(result.minLength, true);
  assert.equal(result.hasUppercase, true);
  assert.equal(result.hasLowercase, true);
  assert.equal(result.hasNumber, true);
  assert.equal(result.hasSymbol, true);
});

test("password policy rejects short passwords", () => {
  const result = validatePasswordPolicy("Aa1!");

  assert.equal(result.valid, false);
  assert.equal(result.minLength, false);
});

test("password policy rejects missing uppercase", () => {
  const result = validatePasswordPolicy("correct1!");

  assert.equal(result.valid, false);
  assert.equal(result.hasUppercase, false);
});

test("password policy rejects missing lowercase", () => {
  const result = validatePasswordPolicy("CORRECT1!");

  assert.equal(result.valid, false);
  assert.equal(result.hasLowercase, false);
});

test("password policy rejects missing number", () => {
  const result = validatePasswordPolicy("Correct!");

  assert.equal(result.valid, false);
  assert.equal(result.hasNumber, false);
});

test("password policy rejects missing symbol", () => {
  const result = validatePasswordPolicy("Correct1");

  assert.equal(result.valid, false);
  assert.equal(result.hasSymbol, false);
});

