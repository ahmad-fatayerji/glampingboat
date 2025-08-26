"use client";
import React, { useEffect, useState } from "react";

interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobile?: string;
  birthDate?: string;
  addressNumber?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  email?: string;
}

export default function ProfileForm() {
  const [data, setData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/account/profile")
      .then(async (r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        const text = await r.text();
        if (!text) return {};
        try {
          return JSON.parse(text);
        } catch {
          return {};
        }
      })
      .then((json) => {
        if (!active) return;
        if (json.user) {
          const u = json.user;
          setData({
            firstName: u.firstName || "",
            lastName: u.lastName || "",
            phone: u.phone || "",
            mobile: u.mobile || "",
            birthDate: u.birthDate ? u.birthDate.substring(0, 10) : "",
            addressNumber: u.addressNumber || "",
            addressStreet: u.addressStreet || "",
            addressCity: u.addressCity || "",
            addressState: u.addressState || "",
            email: u.email,
          });
        }
      })
      .catch(() => {
        /* swallow */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = (field: keyof ProfileData, value: string) =>
    setData((d) => ({ ...d, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload: any = { ...data };
      if (payload.birthDate) payload.birthDate = payload.birthDate;
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setMessage("Profile saved");
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="w-full bg-white rounded-2xl p-6 shadow border border-[var(--color-blue)]/10 text-sm text-[var(--color-blue)]">
        Loading profile…
      </div>
    );

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
          value={data.firstName || ""}
          onChange={(v) => update("firstName", v)}
        />
        <Field
          label="Last Name"
          value={data.lastName || ""}
          onChange={(v) => update("lastName", v)}
        />
        <Field
          label="Phone"
          value={data.phone || ""}
          onChange={(v) => update("phone", v)}
        />
        <Field
          label="Mobile"
          value={data.mobile || ""}
          onChange={(v) => update("mobile", v)}
        />
        <Field
          label="Birth Date"
          type="date"
          value={data.birthDate || ""}
          onChange={(v) => update("birthDate", v)}
        />
        <div className="hidden sm:block" />
        <Field
          label="Address Number"
          value={data.addressNumber || ""}
          onChange={(v) => update("addressNumber", v)}
        />
        <Field
          label="Street"
          value={data.addressStreet || ""}
          onChange={(v) => update("addressStreet", v)}
        />
        <Field
          label="City"
          value={data.addressCity || ""}
          onChange={(v) => update("addressCity", v)}
        />
        <Field
          label="State"
          value={data.addressState || ""}
          onChange={(v) => update("addressState", v)}
        />
        <Field label="Email" value={data.email || ""} disabled />
      </div>
      <div className="pt-2">
        <button
          disabled={saving}
          className="rounded-md bg-[var(--color-blue)] text-[var(--color-beige)] font-semibold text-sm px-5 py-2 shadow hover:bg-[#042c49] focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/40 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Profile"}
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
  onChange?: (v: string) => void;
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
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-full rounded-md bg-[var(--color-beige)]/35 border border-[var(--color-blue)]/15 focus:border-[var(--color-blue)] focus:ring-2 focus:ring-[var(--color-blue)]/25 px-3 py-2 text-sm placeholder-gray-500 outline-none disabled:opacity-60 transition"
      />
    </label>
  );
}
