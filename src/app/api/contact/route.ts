// src/app/api/contact/route.ts
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {
            firstName,
            lastName,
            address,
            phone,
            mobile,
            email,
            message,
        } = await req.json();

        // create Gmail transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        // build email body
        const html = `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Address:</strong><br/>
         ${address.number} ${address.street}<br/>
         ${address.city}, ${address.state}
      </p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

        // send mail
        await transporter.sendMail({
            from: `"Website Contact" <${process.env.GMAIL_USER}>`,
            to: process.env.CONTACT_EMAIL,
            subject: "📝 New Contact Form Submission",
            text: html.replace(/<[^>]+>/g, ""), // fallback text
            html,
        });

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("❌ contact-send error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
