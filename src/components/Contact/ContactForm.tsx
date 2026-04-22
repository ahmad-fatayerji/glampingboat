"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useT } from "@/components/Language/useT";
import type { AddressField, ContactFormData } from "@/lib/types";
import { ADDRESS_FIELDS, NAME_FIELDS, PHONE_FIELDS } from "@/lib/types";

type ContactField =
  | "firstName"
  | "lastName"
  | "phone"
  | "mobile"
  | "email"
  | "message";

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

function fieldLabel(value: string) {
  return value.toLowerCase();
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

  const updateField = <K extends ContactField>(
    field: K,
    value: ContactFormData[K]
  ) => {
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

  const statusLabel =
    status === "sending"
      ? t("sending")
      : status === "success"
        ? t("sent")
        : status === "error"
          ? t("retry")
          : t("send");

  const inputClassName =
    "h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]";

  const renderLabeledField = (
    field: "firstName" | "lastName" | "phone" | "mobile" | "email",
    type: "text" | "tel" | "email" = "text"
  ) => (
    <div
      key={field}
      className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[10.5rem_minmax(0,1fr)]"
    >
      <label
        htmlFor={field}
        className="text-[1.15rem] leading-none text-[var(--color-beige)]"
      >
        {fieldLabel(t(field))}
      </label>
      <input
        id={field}
        name={field}
        type={type}
        value={form[field]}
        onChange={handleChange}
        className={inputClassName}
        required={field === "firstName" || field === "lastName" || field === "email"}
      />
    </div>
  );

  return (
    <div className="min-h-full p-3 sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col border border-white/15 bg-[#3f5666]/82 px-5 py-4 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:min-h-[calc(100vh-3rem)] sm:px-10 sm:py-7"
      >
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-end gap-4 border-b border-[#173c59] pb-2">
          <h2 className="text-[1.05rem] tracking-wide text-[var(--color-beige)]">
            {fieldLabel(t("contact"))}
          </h2>
          <div />
          <h2 className="justify-self-start text-[1.05rem] tracking-wide text-[var(--color-beige)]">
            {fieldLabel(t("message"))}
          </h2>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)]">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {NAME_FIELDS.map((field) => renderLabeledField(field))}
            </div>

            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[10.5rem_minmax(0,1fr)]">
              <div className="pt-1 text-[1.15rem] leading-none text-[var(--color-beige)]">
                {fieldLabel(t("address"))}
              </div>
              <div className="space-y-2">
                {ADDRESS_FIELDS.map((field) => (
                  <div
                    key={field}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-[7rem_minmax(0,1fr)]"
                  >
                    <label
                      htmlFor={field}
                      className="text-[1rem] leading-none text-[var(--color-beige)]/90 sm:justify-self-end sm:pt-2"
                    >
                      {fieldLabel(t(field))}
                    </label>
                    <input
                      id={field}
                      type="text"
                      name={field}
                      value={form.address[field]}
                      onChange={handleChange}
                      className={inputClassName}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {PHONE_FIELDS.map((field) =>
              renderLabeledField(field, "tel")
            )}

            {renderLabeledField("email", "email")}
          </div>

          <div className="flex min-h-[28rem] flex-col">
            <div className="min-h-[22rem] flex-1 overflow-hidden rounded-[2.8rem] border-[3px] border-[#0d3350] bg-[var(--color-beige)] transition focus-within:border-[#234d69]">
              <div className="h-full px-5 py-5 pr-3">
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t("messagePlaceholder")}
                  className="contact-message-scrollbar h-full w-full resize-none overflow-y-auto bg-transparent pr-3 text-[var(--color-blue)] outline-none placeholder:text-[var(--color-blue)]/45"
                  required
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              {status === "error" ? (
                <p className="max-w-xs text-sm text-[#ffd9d9]">
                  {t("errorTooManyRequests")}
                </p>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-3 rounded-xl bg-[#0d3350] px-6 py-2 text-2xl text-[var(--color-beige)] transition hover:bg-[#123f61] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{fieldLabel(statusLabel)}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 10H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 5L15 10L10 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
