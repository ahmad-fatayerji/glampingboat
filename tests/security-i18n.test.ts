import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dictionaries,
  LOCALES,
  type TranslationKey,
} from "@/components/Language/dictionaries";

const securityKeys = [
  "securityMenu",
  "securityTitle",
  "securityDescription",
  "securityLoading",
  "securityLoadError",
  "securityUpdateError",
  "securityGoogleStartError",
  "securityGoogleMismatch",
  "securityGoogleAlreadyLinked",
  "securityEmailVerification",
  "securityVerified",
  "securityNotVerified",
  "securityEmailCodes",
  "securityEmailCodesDescription",
  "securityStatus",
  "securityEnabled",
  "securityDisabled",
  "securityAdminRequired",
  "securityCurrentPassword",
  "securityPasswordTitle",
  "securityPasswordDescription",
  "securityPasswordUnavailable",
  "securityChangePassword",
  "securityPasswordUpdateError",
  "securityChangePasswordDialogTitle",
  "securitySavePassword",
  "securityPasswordUnchanged",
  "securityDisableCodes",
  "securityEnableCodes",
  "securityEnableCodesDialogTitle",
  "securityDisableCodesDialogTitle",
  "securityConfirmPasswordDescription",
  "securityInvalidSetting",
  "securityVerifyEmailRequired",
  "securityCodesPasswordOnly",
  "securityTooManyAttempts",
  "securityPasswordRequired",
  "securityAdminRequiredError",
  "securityGoogleSignIn",
  "securityGoogleLinkedPermanent",
  "securityGoogleNotLinked",
  "securityLinkGoogle",
  "securityGoogleUnavailable",
] as const satisfies readonly TranslationKey[];

test("the complete security page is translated in every supported locale", () => {
  for (const locale of LOCALES) {
    for (const key of securityKeys) {
      assert.ok(
        dictionaries[locale][key]?.trim(),
        `Missing ${key} translation for ${locale}`
      );
    }
  }
});
