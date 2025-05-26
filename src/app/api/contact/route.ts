// src/app/api/contact/route.ts
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// ────────────────────────────────────────────────────────────────────────────────
// 1) Simple in‐memory rate‐limit store
// ────────────────────────────────────────────────────────────────────────────────
const lastSubmissions = new Map<string, number>();
const WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(req: Request) {
    try {
        // 1. extract client IP
        const forwarded = req.headers.get("x-forwarded-for") || "";
        const ip = forwarded.split(",")[0] || req.headers.get("x-real-ip") || "";

        // 2. check rate‐limit
        const now = Date.now();
        const last = lastSubmissions.get(ip) ?? 0;
        if (now - last < WINDOW_MS) {
            return NextResponse.json(
                { error: "Too many submissions - please wait a minute before retrying." },
                { status: 429 }
            );
        }
        lastSubmissions.set(ip, now);

        // 3. parse body
        const {
            firstName,
            lastName,
            address,
            phone,
            mobile,
            email,
            message,
        } = await req.json();

        // 4. configure Gmail transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // 5. build email HTML
        const html = `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone} / ${mobile}</p>
      <p><strong>Address:</strong><br/>
         ${address.number} ${address.street}<br/>
         ${address.city}, ${address.state}
      </p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

        // 6. send email
        await transporter.sendMail({
            from: `"Website Contact" <${process.env.GMAIL_USER}>`,
            to: process.env.CONTACT_EMAIL,
            subject: "📝 New Contact Form Submission",
            text: html.replace(/<[^>]+>/g, ""), // plain‐text fallback
            html,
        });

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Contact API error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
