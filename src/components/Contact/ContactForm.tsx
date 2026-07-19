"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import DrawerSurface from "@/components/Drawer/DrawerSurface";
import { useLanguage } from "@/components/Language/LanguageContext";
import { useT } from "@/components/Language/useT";
import { isPhoneField, sanitizePhoneNumber } from "@/lib/input";
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

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="button-arrow-icon h-4 w-4 shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10H15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M10 5L15 10L10 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function ContactForm() {
  const t = useT();
  const { locale } = useLanguage();
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
    const nextValue =
      typeof value === "string" && isPhoneField(field)
        ? sanitizePhoneNumber(value)
        : value;

    setForm((current) => ({ ...current, [field]: nextValue }));
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
        body: JSON.stringify({ ...form, locale }),
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
    "h-11 w-full rounded-md border border-[var(--color-beige)]/18 bg-[rgba(13,51,80,0.34)] px-3 text-[var(--color-beige)] outline-none transition placeholder:text-[var(--color-beige)]/42 focus:border-[var(--color-beige)]/55 focus:bg-[rgba(13,51,80,0.48)]";

  const renderLabeledField = (
    field: "firstName" | "lastName" | "phone" | "mobile" | "email",
    type: "text" | "tel" | "email" = "text"
  ) => (
    <div
      key={field}
      className="grid grid-cols-1 gap-2"
    >
      <label
        htmlFor={field}
        className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-beige)]/62"
      >
        {t(field)}
      </label>
      <input
        id={field}
        name={field}
        type={type}
        value={form[field]}
        onChange={handleChange}
        inputMode={type === "tel" ? "tel" : undefined}
        className={inputClassName}
        required={field === "firstName" || field === "lastName" || field === "email"}
      />
    </div>
  );

  return (
    <DrawerSurface className="gap-8 overflow-hidden !bg-transparent !shadow-none !backdrop-blur-0">
      <header className="border-b border-white/15 pb-6">
        <section className="relative flex flex-col justify-between gap-8 overflow-hidden bg-[#2f4858]/78 p-5 text-[var(--color-beige)] shadow-[inset_0_0_0_1px_rgba(228,219,206,0.14)] sm:p-7">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[var(--color-beige)]/18"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full border border-[var(--color-beige)]/14"
            aria-hidden="true"
          />
          <div className="relative space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-beige)]/62">
                {t("contact")}
              </p>
              <h2 className="mt-2 text-4xl font-semibold leading-[1.02] text-[var(--color-beige)] sm:text-5xl">
                {t("contactUs")}
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--color-beige)]/88">
                {t("buyAdventureBody")}
              </p>
            </div>

            <dl className="grid max-w-3xl gap-3 sm:grid-cols-2">
              <div className="border border-[var(--color-beige)]/14 bg-[rgba(13,51,80,0.2)] p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-beige)]/58">
                  {t("email")}
                </dt>
                <dd className="mt-2 text-lg font-semibold leading-snug text-[var(--color-beige)]">
                  contact@glampingboat.fr
                </dd>
              </div>
              <div className="border border-[var(--color-beige)]/14 bg-[rgba(13,51,80,0.2)] p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-[var(--color-beige)]/58">
                  Glamping Boat
                </dt>
                <dd className="mt-2 text-lg font-semibold leading-snug text-[var(--color-beige)]">
                  Lot Valley, France
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative flex flex-wrap gap-3">
            <a
              href="mailto:contact@glampingboat.fr"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-[var(--color-blue)] px-4 py-2 font-semibold text-[var(--color-beige)] shadow-[0_10px_28px_rgba(0,32,56,0.32)] transition hover:bg-[#0b314b]"
            >
              <span>{t("email")}</span>
              <ArrowIcon />
            </a>
            <a
              href="#contact-message"
              className="inline-flex w-fit items-center gap-2 rounded-md border border-[var(--color-beige)]/28 px-4 py-2 font-semibold text-[var(--color-beige)] transition hover:bg-white/8"
            >
              <span>{t("message")}</span>
              <ArrowIcon />
            </a>
          </div>
        </section>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)]"
      >
        <section className="bg-[#2f4858]/78 p-5 shadow-[inset_0_0_0_1px_rgba(228,219,206,0.14)] sm:p-7">
          <div className="mb-6 border-b border-[var(--color-beige)]/18 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-beige)]/62">
              {t("contact")}
            </p>
            <h3 className="mt-2 text-3xl font-semibold leading-tight text-[var(--color-beige)]">
              {t("contactDetails")}
            </h3>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {NAME_FIELDS.map((field) => renderLabeledField(field))}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-beige)]/62">
                {t("address")}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {ADDRESS_FIELDS.map((field) => (
                  <div
                    key={field}
                    className={
                      field === "street" ? "grid gap-2 md:col-span-2" : "grid gap-2"
                    }
                  >
                    <label
                      htmlFor={field}
                      className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-beige)]/50"
                    >
                      {t(field)}
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {PHONE_FIELDS.map((field) => renderLabeledField(field, "tel"))}
            </div>

            {renderLabeledField("email", "email")}
          </div>
        </section>

        <section
          id="contact-message"
          className="flex min-h-[30rem] scroll-mt-6 flex-col bg-[#2f4858]/78 p-5 text-[var(--color-beige)] shadow-[inset_0_0_0_1px_rgba(228,219,206,0.14)] sm:p-7"
        >
          <div className="mb-5 border-b border-[var(--color-beige)]/18 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-beige)]/62">
              {t("message")}
            </p>
            <h3 className="mt-2 text-3xl font-semibold leading-tight">
              {fieldLabel(t("messagePlaceholder")).replace("...", "")}
            </h3>
          </div>

          <div className="min-h-[22rem] flex-1 overflow-hidden rounded-lg border border-[var(--color-beige)]/18 bg-[rgba(13,51,80,0.28)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition focus-within:border-[var(--color-beige)]/55 focus-within:bg-[rgba(13,51,80,0.4)]">
            <div className="h-full px-5 py-5 pr-3">
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t("messagePlaceholder")}
                className="contact-message-scrollbar h-full min-h-[21rem] w-full resize-none overflow-y-auto bg-transparent pr-3 text-lg leading-relaxed text-[var(--color-beige)] outline-none placeholder:text-[var(--color-beige)]/45"
                required
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5">
              {status === "error" ? (
                <p className="max-w-xs text-sm font-semibold text-[#ffd9d9]">
                  {t("errorTooManyRequests")}
                </p>
              ) : status === "success" ? (
                <p className="max-w-xs text-sm font-semibold text-[var(--color-beige)]/72">
                  {t("sent")}
                </p>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex w-fit items-center gap-2 rounded-md bg-[var(--color-blue)] px-5 py-2 font-semibold text-[var(--color-beige)] shadow-[0_10px_28px_rgba(0,32,56,0.28)] transition hover:bg-[#0b314b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{fieldLabel(statusLabel)}</span>
              <ArrowIcon />
            </button>
          </div>
        </section>
      </form>
    </DrawerSurface>
  );
}
