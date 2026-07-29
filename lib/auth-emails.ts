import {
  buildBrandedEmail,
  createGmailTransporter,
  escapeHtml,
  getMailerAddress,
} from "@/lib/mailer";

async function sendAccountEmail({
  to,
  subject,
  title,
  preview,
  bodyHtml,
  action,
  text,
}: {
  to: string;
  subject: string;
  title: string;
  preview: string;
  bodyHtml: string;
  action?: { href: string; label: string };
  text: string;
}) {
  const html = buildBrandedEmail({
    title,
    eyebrow: "Account security",
    preview,
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

export function sendVerificationEmail(email: string, verificationUrl: string) {
  return sendAccountEmail({
    to: email,
    subject: "Verify your Glamping Boat email",
    title: "Verify your email",
    preview: "Confirm your email to activate your Glamping Boat account.",
    bodyHtml:
      "<p>Confirm that this email belongs to you before signing in, creating reservations, or making payments.</p><p>This secure link expires in 30 minutes.</p>",
    action: { href: verificationUrl, label: "Verify email" },
    text: `Verify your Glamping Boat email:\n${verificationUrl}\n\nThis link expires in 30 minutes.`,
  });
}

export function sendLoginCodeEmail(email: string, code: string) {
  return sendAccountEmail({
    to: email,
    subject: "Your Glamping Boat sign-in code",
    title: "Confirm your sign-in",
    preview: "Use this one-time code to finish signing in.",
    bodyHtml: `<p>Enter this one-time code to finish signing in:</p><p style="font-size: 30px; letter-spacing: 0.18em; font-weight: 700;">${escapeHtml(code)}</p><p>The code expires in 10 minutes and can only be used once.</p>`,
    text: `Your Glamping Boat sign-in code is ${code}. It expires in 10 minutes.`,
  });
}

export function sendGoogleLinkedEmail(email: string) {
  return sendAccountEmail({
    to: email,
    subject: "Google was linked to your Glamping Boat account",
    title: "Google account linked",
    preview: "A Google sign-in method was added to your account.",
    bodyHtml:
      "<p>Your Google account was linked successfully. You can now use either Google or your password to sign in.</p><p>If you did not do this, reset your password and contact us immediately.</p>",
    text:
      "Google was linked to your Glamping Boat account. If you did not do this, reset your password and contact us immediately.",
  });
}

export function sendSecuritySettingEmail(
  email: string,
  enabled: boolean
) {
  const state = enabled ? "enabled" : "disabled";
  return sendAccountEmail({
    to: email,
    subject: `Email sign-in codes ${state}`,
    title: `Email sign-in codes ${state}`,
    preview: `Email sign-in codes were ${state} for your account.`,
    bodyHtml: `<p>Email sign-in codes were <strong>${state}</strong> for your Glamping Boat account.</p><p>If you did not make this change, reset your password and contact us immediately.</p>`,
    text: `Email sign-in codes were ${state} for your Glamping Boat account. If you did not make this change, reset your password and contact us immediately.`,
  });
}
