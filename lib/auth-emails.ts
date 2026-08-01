import {
  buildBrandedEmail,
  createGmailTransporter,
  escapeHtml,
  getMailerAddress,
} from "@/lib/mailer";
import { getAuthEmailCopy } from "@/lib/auth-email-i18n";

async function sendAccountEmail({
  to,
  subject,
  title,
  preview,
  bodyHtml,
  action,
  text,
  eyebrow,
  locale,
}: {
  to: string;
  subject: string;
  title: string;
  preview: string;
  bodyHtml: string;
  action?: { href: string; label: string };
  text: string;
  eyebrow: string;
  locale: string;
}) {
  const html = buildBrandedEmail({
    title,
    eyebrow,
    preview,
    locale,
    bodyHtml,
    action,
  });

  await createGmailTransporter().sendMail({
    from: getMailerAddress("Glamping Boat"),
    to,
    subject,
    text,
    html,
  });
}

export function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  locale = "en",
  existingPendingAccount = false
) {
  const copy = getAuthEmailCopy(locale);
  return sendAccountEmail({
    to: email,
    subject: copy.verifySubject,
    title: copy.verifyTitle,
    preview: copy.verifyPreview,
    bodyHtml: existingPendingAccount
      ? copy.pendingVerifyBody
      : copy.verifyBody,
    action: { href: verificationUrl, label: copy.verifyAction },
    text: existingPendingAccount
      ? copy.pendingVerifyText(verificationUrl)
      : copy.verifyText(verificationUrl),
    eyebrow: copy.eyebrow,
    locale,
  });
}

export function sendLoginCodeEmail(email: string, code: string, locale = "en") {
  const copy = getAuthEmailCopy(locale);
  return sendAccountEmail({
    to: email,
    subject: copy.codeSubject,
    title: copy.codeTitle,
    preview: copy.codePreview,
    bodyHtml: `<p>${copy.codeIntro}</p><p style="font-size: 30px; letter-spacing: 0.18em; font-weight: 700;">${escapeHtml(code)}</p><p>${copy.codeExpiry}</p>`,
    text: copy.codeText(code),
    eyebrow: copy.eyebrow,
    locale,
  });
}

export function sendGoogleLinkedEmail(email: string, locale = "en") {
  const copy = getAuthEmailCopy(locale);
  return sendAccountEmail({
    to: email,
    subject: copy.linkedSubject,
    title: copy.linkedTitle,
    preview: copy.linkedPreview,
    bodyHtml: copy.linkedBody,
    text: copy.linkedText,
    eyebrow: copy.eyebrow,
    locale,
  });
}

export function sendSecuritySettingEmail(
  email: string,
  enabled: boolean,
  locale = "en"
) {
  const copy = getAuthEmailCopy(locale);
  return sendAccountEmail({
    to: email,
    subject: copy.settingSubject(enabled),
    title: copy.settingSubject(enabled),
    preview: copy.settingPreview(enabled),
    bodyHtml: copy.settingBody(enabled),
    text: copy.settingText(enabled),
    eyebrow: copy.eyebrow,
    locale,
  });
}
