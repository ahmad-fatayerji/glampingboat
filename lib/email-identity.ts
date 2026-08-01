const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

export type NormalizedEmail = {
  email: string;
  canonicalEmail: string;
  isGmailConsumer: boolean;
};

export function normalizeEmailAddress(input: string): NormalizedEmail | null {
  const email = input.trim().toLowerCase();
  const at = email.lastIndexOf("@");

  if (
    !email ||
    at <= 0 ||
    at !== email.indexOf("@") ||
    at === email.length - 1 ||
    /\s/.test(email)
  ) {
    return null;
  }

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const isGmailConsumer = GMAIL_DOMAINS.has(domain);

  if (!isGmailConsumer) {
    return { email, canonicalEmail: email, isGmailConsumer: false };
  }

  const canonicalLocal = local.split("+", 1)[0].replace(/\./g, "");
  if (!canonicalLocal) {
    return null;
  }

  return {
    email,
    canonicalEmail: `${canonicalLocal}@gmail.com`,
    isGmailConsumer: true,
  };
}

export function emailsShareMailbox(left: string, right: string) {
  const normalizedLeft = normalizeEmailAddress(left);
  const normalizedRight = normalizeEmailAddress(right);

  return Boolean(
    normalizedLeft &&
      normalizedRight &&
      normalizedLeft.canonicalEmail === normalizedRight.canonicalEmail
  );
}
