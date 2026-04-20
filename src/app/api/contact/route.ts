import { NextResponse } from "next/server";
import { createGmailTransporter, getMailerAddress } from "@/lib/mailer";
import { getErrorMessage } from "@/lib/http";
import { getString, isRecord } from "@/lib/type-guards";

const lastSubmissions = new Map<string, number>();
const WINDOW_MS = 60 * 1000;

function parseContactPayload(payload: unknown) {
  if (!isRecord(payload) || !isRecord(payload.address)) {
    return null;
  }

  return {
    firstName: getString(payload, "firstName") ?? "",
    lastName: getString(payload, "lastName") ?? "",
    phone: getString(payload, "phone") ?? "",
    mobile: getString(payload, "mobile") ?? "",
    email: getString(payload, "email") ?? "",
    message: getString(payload, "message") ?? "",
    address: {
      number: getString(payload.address, "number") ?? "",
      street: getString(payload.address, "street") ?? "",
      city: getString(payload.address, "city") ?? "",
      state: getString(payload.address, "state") ?? "",
    },
  };
}

type ContactPayload = NonNullable<ReturnType<typeof parseContactPayload>>;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMultilineHtml(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function buildContactEmail(parsed: ContactPayload) {
  const fullName = `${parsed.firstName} ${parsed.lastName}`.trim();
  const phone = [parsed.phone, parsed.mobile].filter(Boolean).join(" / ");
  const addressLine = [
    `${parsed.address.number} ${parsed.address.street}`.trim(),
    [parsed.address.city, parsed.address.state].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join("\n");

  const fields = [
    ["Name", fullName],
    ["Email", parsed.email],
    ["Phone", phone],
    ["Address", addressLine],
  ] as const;

  const rowsHtml = fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 14px 18px; border-bottom: 1px solid rgba(0,32,56,0.12); color: #3f5666; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; width: 120px;">
            ${label}
          </td>
          <td style="padding: 14px 18px; border-bottom: 1px solid rgba(0,32,56,0.12); color: #002038; font-size: 16px; line-height: 1.55;">
            ${value ? formatMultilineHtml(value) : "-"}
          </td>
        </tr>`
    )
    .join("");

  const text = [
    "New Contact Form Submission",
    "",
    `Name: ${fullName || "-"}`,
    `Email: ${parsed.email || "-"}`,
    `Phone: ${phone || "-"}`,
    "Address:",
    addressLine || "-",
    "",
    "Message:",
    parsed.message || "-",
  ].join("\n");

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>New Contact Form Submission</title>
      </head>
      <body style="margin: 0; padding: 0; background: #f5f0e8; font-family: Arial, Helvetica, sans-serif; color: #002038;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          New message from ${escapeHtml(fullName || parsed.email || "the website contact form")}.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #f5f0e8;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; border-collapse: collapse; overflow: hidden; border: 1px solid rgba(0,32,56,0.16); background: #e4dbce;">
                <tr>
                  <td style="background: #002038; padding: 30px 32px 26px;">
                    <div style="font-family: Georgia, 'Times New Roman', serif; color: #e4dbce; font-size: 34px; line-height: 1; font-weight: 400;">
                      glampingboat
                    </div>
                    <div style="margin-top: 16px; color: rgba(228,219,206,0.78); font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase;">
                      Website contact
                    </div>
                    <h1 style="margin: 10px 0 0; color: #ffffff; font-size: 26px; line-height: 1.25; font-weight: 700;">
                      New contact form submission
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 26px 30px 8px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: rgba(255,255,255,0.32); border: 1px solid rgba(0,32,56,0.12);">
                      ${rowsHtml}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 30px 34px;">
                    <div style="border-left: 5px solid #3f5666; background: rgba(255,255,255,0.38); padding: 20px 22px;">
                      <div style="margin-bottom: 10px; color: #3f5666; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                        Message
                      </div>
                      <div style="color: #002038; font-size: 17px; line-height: 1.65;">
                        ${parsed.message ? formatMultilineHtml(parsed.message) : "-"}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return { html, text };
}

export async function POST(req: Request) {
  try {
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0] || req.headers.get("x-real-ip") || "";

    const now = Date.now();
    const last = lastSubmissions.get(ip) ?? 0;
    if (now - last < WINDOW_MS) {
      return NextResponse.json(
        { error: "Too many submissions - please wait a minute before retrying." },
        { status: 429 }
      );
    }
    lastSubmissions.set(ip, now);

    const parsed = parseContactPayload(await req.json());
    if (!parsed) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const transporter = createGmailTransporter();
    const { html, text } = buildContactEmail(parsed);

    await transporter.sendMail({
      from: getMailerAddress("Website Contact"),
      to: process.env.CONTACT_EMAIL,
      replyTo: parsed.email,
      subject: "New Contact Form Submission - Glamping Boat",
      text,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Server error") },
      { status: 500 }
    );
  }
}
