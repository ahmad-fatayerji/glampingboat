import nodemailer from "nodemailer";

const BRAND = {
  beige: "#e4dbce",
  blue: "#002038",
  blueMuted: "#3f5666",
  page: "#f5f0e8",
  white: "#ffffff",
};

export function createGmailTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export function getMailerAddress(label: string) {
  return `"${label}" <${process.env.GMAIL_USER}>`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatMultilineHtml(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

type EmailAction = {
  href: string;
  label: string;
};

type BrandedEmailOptions = {
  title: string;
  eyebrow: string;
  preview: string;
  bodyHtml: string;
  action?: EmailAction;
  footer?: string;
};

export function buildBrandedEmail({
  title,
  eyebrow,
  preview,
  bodyHtml,
  action,
  footer,
}: BrandedEmailOptions) {
  const escapedTitle = escapeHtml(title);
  const escapedEyebrow = escapeHtml(eyebrow);
  const escapedPreview = escapeHtml(preview);

  const actionHtml = action
    ? `
      <tr>
        <td style="padding: 4px 30px 30px;">
          <a href="${escapeHtml(action.href)}" style="display: inline-block; background: ${BRAND.blue}; color: ${BRAND.beige}; font-size: 16px; font-weight: 700; line-height: 1; text-decoration: none; padding: 15px 22px; border-radius: 6px;">
            ${escapeHtml(action.label)}
          </a>
        </td>
      </tr>`
    : "";

  const footerHtml = footer
    ? `
      <tr>
        <td style="padding: 0 30px 32px; color: rgba(0,32,56,0.68); font-size: 13px; line-height: 1.5;">
          ${formatMultilineHtml(footer)}
        </td>
      </tr>`
    : "";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapedTitle}</title>
      </head>
      <body style="margin: 0; padding: 0; background: ${BRAND.page}; font-family: Arial, Helvetica, sans-serif; color: ${BRAND.blue};">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          ${escapedPreview}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: ${BRAND.page};">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; border-collapse: collapse; overflow: hidden; border: 1px solid rgba(0,32,56,0.16); background: ${BRAND.beige};">
                <tr>
                  <td style="background: ${BRAND.blue}; padding: 30px 32px 26px;">
                    <div style="font-family: Georgia, 'Times New Roman', serif; color: ${BRAND.beige}; font-size: 34px; line-height: 1; font-weight: 400;">
                      glampingboat
                    </div>
                    <div style="margin-top: 16px; color: rgba(228,219,206,0.78); font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase;">
                      ${escapedEyebrow}
                    </div>
                    <h1 style="margin: 10px 0 0; color: ${BRAND.white}; font-size: 26px; line-height: 1.25; font-weight: 700;">
                      ${escapedTitle}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px 30px 22px; color: ${BRAND.blue}; font-size: 17px; line-height: 1.65;">
                    ${bodyHtml}
                  </td>
                </tr>
                ${actionHtml}
                ${footerHtml}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}
