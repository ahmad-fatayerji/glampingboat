// src/components/Contact/ContactForm.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useT } from "@/components/Language/useT";

interface Address {
  number: string;
  street: string;
  city: string;
  state: string;
}

interface ContactState {
  firstName: string;
  lastName: string;
  address: Address;
  phone: string;
  mobile: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const t = useT();
  const [form, setForm] = useState<ContactState>({
    firstName: "",
    lastName: "",
    address: { number: "", street: "", city: "", state: "" },
    phone: "",
    mobile: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (["number", "street", "city", "state"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value } as ContactState));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      setStatus("success");
      // Optionally clear form:
      // setForm({ firstName: "", lastName: "", address: { number: "", street: "", city: "", state: "" }, phone: "", mobile: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    // Wrapper: make background transparent so it blends with drawer (#002038) instead of a different blue panel
    <div className="p-4 md:p-8 text-gray-100 w-full">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Left / Contact details */}
        <div className="md:col-span-7">
          <h2 className="text-xl font-semibold mb-4">{t("contact")}</h2>

          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {["firstName", "lastName"].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm capitalize">
                  {t(field as any)}
                </label>
                <input
                  id={field}
                  name={field}
                  type="text"
                  value={(form as any)[field]}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>
            ))}
          </div>

          {/* Address */}
          <label className="block text-sm mb-2">{t("address")}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {["number", "street", "city", "state"].map((item) => (
              <input
                key={item}
                type="text"
                placeholder={t(item as any)}
                name={item}
                value={form.address[item as keyof Address]}
                onChange={handleChange}
                className="w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
                required
              />
            ))}
          </div>

          {/* Phone & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {["phone", "mobile"].map((item) => (
              <div key={item}>
                <label htmlFor={item} className="block text-sm capitalize">
                  {t(item as any)}
                </label>
                <input
                  id={item}
                  type="tel"
                  name={item}
                  value={(form as any)[item]}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
                />
              </div>
            ))}
          </div>

          {/* Email */}
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

        {/* Right / Message */}
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
              ➜
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
