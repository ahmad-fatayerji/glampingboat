"use client";

import { useEffect, useState } from "react";
import { readJsonResponse, getErrorMessage } from "@/lib/http";
import {
  createEmptyProfileFormData,
  toProfileFormData,
  toProfileUpdatePayload,
} from "@/lib/profile";
import type { ProfileFormData, ProfileResponse } from "@/lib/types";

export default function ProfileForm() {
  const [data, setData] = useState<ProfileFormData>(createEmptyProfileFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/account/profile");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await readJsonResponse<ProfileResponse>(response, { user: null });
        if (active) {
          setData(toProfileFormData(json.user));
        }
      } catch {
        if (active) {
          setData(createEmptyProfileFormData());
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toProfileUpdatePayload(data)),
      });
      if (!response.ok) {
        throw new Error("Failed");
      }

      const json = await readJsonResponse<ProfileResponse & { ok?: boolean }>(
        response,
        { user: null }
      );
      setData(toProfileFormData(json.user));
      setMessage("Profile saved");
    } catch (submissionError) {
      setError(getErrorMessage(submissionError, "Error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full border border-white/15 bg-[#3f5666]/82 p-6 text-sm lowercase tracking-wide text-[var(--color-beige)]/80 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        loading profile...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-6 border border-white/15 bg-[#3f5666]/82 p-6 md:p-8 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#173c59] pb-2">
        <h2 className="text-[1.05rem] lowercase tracking-wide text-[var(--color-beige)]">
          profile information
        </h2>
        {message && (
          <span className="text-xs lowercase text-[#c7e8c7]">{message}</span>
        )}
        {error && (
          <span className="text-xs lowercase text-[#ffd9d9]">{error}</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="first name"
          value={data.firstName}
          onChange={(value) => update("firstName", value)}
        />
        <Field
          label="last name"
          value={data.lastName}
          onChange={(value) => update("lastName", value)}
        />
        <Field
          label="phone"
          value={data.phone}
          onChange={(value) => update("phone", value)}
        />
        <Field
          label="mobile"
          value={data.mobile}
          onChange={(value) => update("mobile", value)}
        />
        <Field
          label="birth date"
          type="date"
          value={data.birthDate}
          onChange={(value) => update("birthDate", value)}
        />
        <div className="hidden sm:block" />
        <Field
          label="address number"
          value={data.addressNumber}
          onChange={(value) => update("addressNumber", value)}
        />
        <Field
          label="street"
          value={data.addressStreet}
          onChange={(value) => update("addressStreet", value)}
        />
        <Field
          label="city"
          value={data.addressCity}
          onChange={(value) => update("addressCity", value)}
        />
        <Field
          label="state"
          value={data.addressState}
          onChange={(value) => update("addressState", value)}
        />
        <Field label="email" value={data.email} disabled />
      </div>
      <div className="pt-2">
        <button
          disabled={saving}
          className="group inline-flex items-center gap-3 rounded-xl bg-[#0d3350] px-6 py-2 text-base lowercase tracking-wide text-[var(--color-beige)] transition hover:bg-[#123f61] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{saving ? "saving..." : "save profile"}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm lowercase text-[var(--color-beige)]/90">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69] disabled:opacity-60"
      />
    </label>
  );
}
