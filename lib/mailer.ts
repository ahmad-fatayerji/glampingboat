import nodemailer from "nodemailer";

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
