import { NextResponse } from "next/server";
import {
  buildBrandedEmail,
  createGmailTransporter,
  formatMultilineHtml,
  getMailerAddress,
} from "@/lib/mailer";
import { getErrorMessage } from "@/lib/http";
import { sanitizePhoneNumber } from "@/lib/input";
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
    phone: sanitizePhoneNumber(getString(payload, "phone") ?? ""),
    mobile: sanitizePhoneNumber(getString(payload, "mobile") ?? ""),
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

  const html = buildBrandedEmail({
    title: "New contact form submission",
    eyebrow: "Website contact",
    preview: `New message from ${fullName || parsed.email || "the website contact form"}.`,
    bodyHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: rgba(255,255,255,0.32); border: 1px solid rgba(0,32,56,0.12);">
        ${rowsHtml}
      </table>
      <div style="margin-top: 18px; border-left: 5px solid #3f5666; background: rgba(255,255,255,0.38); padding: 20px 22px;">
        <div style="margin-bottom: 10px; color: #3f5666; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
          Message
        </div>
        <div style="color: #002038; font-size: 17px; line-height: 1.65;">
          ${parsed.message ? formatMultilineHtml(parsed.message) : "-"}
        </div>
      </div>
    `,
  });

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
