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
      <div className="w-full bg-white rounded-2xl p-6 shadow border border-[var(--color-blue)]/10 text-sm text-[var(--color-blue)]">
        Loading profileâ€¦
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[var(--color-blue)]/10 text-[var(--color-blue)] space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide">
          Profile Information
        </h2>
        {message && <span className="text-xs text-green-600">{message}</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="First Name"
          value={data.firstName}
          onChange={(value) => update("firstName", value)}
        />
        <Field
          label="Last Name"
          value={data.lastName}
          onChange={(value) => update("lastName", value)}
        />
        <Field
          label="Phone"
          value={data.phone}
          onChange={(value) => update("phone", value)}
        />
        <Field
          label="Mobile"
          value={data.mobile}
          onChange={(value) => update("mobile", value)}
        />
        <Field
          label="Birth Date"
          type="date"
          value={data.birthDate}
          onChange={(value) => update("birthDate", value)}
        />
        <div className="hidden sm:block" />
        <Field
          label="Address Number"
          value={data.addressNumber}
          onChange={(value) => update("addressNumber", value)}
        />
        <Field
          label="Street"
          value={data.addressStreet}
          onChange={(value) => update("addressStreet", value)}
        />
        <Field
          label="City"
          value={data.addressCity}
          onChange={(value) => update("addressCity", value)}
        />
        <Field
          label="State"
          value={data.addressState}
          onChange={(value) => update("addressState", value)}
        />
        <Field label="Email" value={data.email} disabled />
      </div>
      <div className="pt-2">
        <button
          disabled={saving}
          className="rounded-md bg-[var(--color-blue)] text-[var(--color-beige)] font-semibold text-sm px-5 py-2 shadow hover:bg-[#042c49] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/40 disabled:opacity-50"
        >
          {saving ? "Savingâ€¦" : "Save Profile"}
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
    <label className="space-y-1 text-xs font-medium tracking-wide text-[var(--color-blue)]/80">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full rounded-md bg-[var(--color-beige)]/35 border border-[var(--color-blue)]/15 focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[var(--color-blue)]/25 px-3 py-2 text-sm placeholder-gray-500 outline-none disabled:opacity-60 transition"
      />
    </label>
  );
}
