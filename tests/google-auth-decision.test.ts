import assert from "node:assert/strict";
import { test } from "node:test";
import {
  existingGoogleIdentityDecision,
  googleCandidateDecision,
  googleLinkIntentMatches,
} from "@/lib/google-auth-decision";

test("a signed-in linking intent refuses a different Google mailbox", () => {
  assert.equal(
    googleLinkIntentMatches("other@gmail.com", "customer@gmail.com"),
    false
  );
  assert.equal(
    googleLinkIntentMatches("customer@gmail.com", "customer@gmail.com"),
    true
  );
});

test("a Google identity cannot be moved to the signed-in user", () => {
  assert.equal(
    existingGoogleIdentityDecision("identity-owner", "signed-in-user"),
    "ALREADY_LINKED"
  );
  assert.equal(
    existingGoogleIdentityDecision("identity-owner", "identity-owner"),
    "SIGN_IN"
  );
});

test("Google candidate counts select create, confirmation, or merge review", () => {
  assert.equal(googleCandidateDecision(0), "CREATE_ACCOUNT");
  assert.equal(googleCandidateDecision(1), "CONFIRM_LINK");
  assert.equal(googleCandidateDecision(2), "MERGE_REQUIRED");
});
