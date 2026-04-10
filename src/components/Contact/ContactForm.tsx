"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useT } from "@/components/Language/useT";
import type { AddressField, ContactFormData } from "@/lib/types";
import { ADDRESS_FIELDS, NAME_FIELDS, PHONE_FIELDS } from "@/lib/types";

type ContactField = "firstName" | "lastName" | "phone" | "mobile" | "email" | "message";

const INITIAL_FORM: ContactFormData = {
  firstName: "",
  lastName: "",
  address: { number: "", street: "", city: "", state: "" },
  phone: "",
  mobile: "",
  email: "",
  message: "",
};

function isAddressField(name: string): name is AddressField {
  return (ADDRESS_FIELDS as readonly string[]).includes(name);
}

function isContactField(name: string): name is ContactField {
  return (
    ["firstName", "lastName", "phone", "mobile", "email", "message"] as const
  ).includes(name as ContactField);
}

export default function ContactForm() {
  const t = useT();
  const [form, setForm] = useState<ContactFormData>(INITIAL_FORM);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  const updateAddressField = (field: AddressField, value: string) => {
    setForm((current) => ({
      ...current,
      address: { ...current.address, [field]: value },
    }));
  };

  const updateField = <K extends ContactField>(field: K, value: ContactFormData[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (isAddressField(name)) {
      updateAddressField(name, value);
      return;
    }

    if (isContactField(name)) {
      updateField(name, value);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Failed to send");
      }

      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="p-4 md:p-8 text-gray-100 w-full">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        <div className="md:col-span-7">
          <h2 className="text-xl font-semibold mb-4">{t("contact")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {NAME_FIELDS.map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm capitalize">
                  {t(field)}
                </label>
                <input
                  id={field}
                  name={field}
                  type="text"
                  value={form[field]}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>
            ))}
          </div>

          <label className="block text-sm mb-2">{t("address")}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {ADDRESS_FIELDS.map((field) => (
              <input
                key={field}
                type="text"
                placeholder={t(field)}
                name={field}
                value={form.address[field]}
                onChange={handleChange}
                className="w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
                required
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {PHONE_FIELDS.map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm capitalize">
                  {t(field)}
                </label>
                <input
                  id={field}
                  type="tel"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
                />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm">
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
              required
            />
          </div>
        </div>

        <div className="md:col-span-5 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4">{t("message")}</h2>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder={t("messagePlaceholder")}
            className="w-full h-48 p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400 text-gray-100"
            required
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="group relative mt-4 self-end inline-flex items-center gap-2 rounded-full px-6 py-2 font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-700 to-indigo-600 shadow-lg shadow-indigo-900/30 hover:from-indigo-500 hover:via-blue-600 hover:to-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>
              {status === "sending"
                ? t("sending")
                : status === "success"
                  ? t("sent")
                  : status === "error"
                    ? t("retry")
                    : t("send")}
            </span>
            <span className="transition-transform group-hover:translate-x-1">
              âžœ
            </span>
            <span className="absolute inset-0 rounded-full ring-1 ring-white/10 pointer-events-none" />
          </button>

          {status === "error" && (
            <p className="mt-2 text-red-400">{t("errorTooManyRequests")}</p>
          )}
        </div>
      </form>
    </div>
  );
}
