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
    const html = `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${parsed.firstName} ${parsed.lastName}</p>
      <p><strong>Email:</strong> ${parsed.email}</p>
      <p><strong>Phone:</strong> ${parsed.phone} / ${parsed.mobile}</p>
      <p><strong>Address:</strong><br/>
         ${parsed.address.number} ${parsed.address.street}<br/>
         ${parsed.address.city}, ${parsed.address.state}
      </p>
      <h3>Message:</h3>
      <p>${parsed.message.replace(/\n/g, "<br/>")}</p>
    `;

    await transporter.sendMail({
      from: getMailerAddress("Website Contact"),
      to: process.env.CONTACT_EMAIL,
      subject: "ðŸ“ New Contact Form Submission",
      text: html.replace(/<[^>]+>/g, ""),
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
