"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSession } from "next-auth/react";
import { useT } from "@/components/Language/useT";
import {
  getMissingProfileFields,
  getProfileFieldValue,
  PROFILE_REQUIRED_FIELDS,
  toProfileUpdatePayload,
} from "@/lib/profile";
import { calculateReservationPricingSummary } from "@/lib/reservations";
import { getErrorMessage, readJsonResponse } from "@/lib/http";
import type {
  AddressField,
  ApiErrorResponse,
  BookingFormState,
  OptionRecord,
  ProfileResponse,
  ReservationCreatePayload,
} from "@/lib/types";
import { ADDRESS_FIELDS, NAME_FIELDS, PHONE_FIELDS } from "@/lib/types";

interface BookingFormProps {
  arrivalDate: Date;
  departureDate: Date;
}

type BookingTextField =
  | "firstName"
  | "lastName"
  | "phone"
  | "mobile"
  | "email"
  | "birthDate"
  | "comments"
  | "discountCode";

type BookingCheckboxField =
  | "specialOffers"
  | "cancellation"
  | "acceptTerms"
  | "payFullNow";

type BookingInputEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

const INITIAL_FORM: BookingFormState = {
  firstName: "",
  lastName: "",
  address: { number: "", street: "", city: "", state: "" },
  phone: "",
  mobile: "",
  email: "",
  birthDate: "",
  comments: "",
  discountCode: "",
  specialOffers: false,
  cancellation: false,
  acceptTerms: false,
  payFullNow: false,
  adults: 2,
  children: 0,
  options: {},
};

const BOOKING_OPTION_PREFIX = "opt_";
const TEXT_FIELDS: readonly BookingTextField[] = [
  "firstName",
  "lastName",
  "phone",
  "mobile",
  "email",
  "birthDate",
  "comments",
  "discountCode",
];
const CHECKBOX_FIELDS: readonly BookingCheckboxField[] = [
  "specialOffers",
  "cancellation",
  "acceptTerms",
  "payFullNow",
];

function isAddressField(name: string): name is AddressField {
  return (ADDRESS_FIELDS as readonly string[]).includes(name);
}

function isBookingTextField(name: string): name is BookingTextField {
  return (TEXT_FIELDS as readonly string[]).includes(name);
}

function isBookingCheckboxField(name: string): name is BookingCheckboxField {
  return (CHECKBOX_FIELDS as readonly string[]).includes(name);
}

export default function BookingForm({
  arrivalDate,
  departureDate,
}: BookingFormProps) {
  const t = useT();
  const { data: session } = useSession();
  const [form, setForm] = useState<BookingFormState>(INITIAL_FORM);
  const [options, setOptions] = useState<OptionRecord[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const response = await fetch("/api/options");
        const data = await readJsonResponse<OptionRecord[]>(response, []);

        if (active && Array.isArray(data)) {
          setOptions(data);
        }
      } catch {
        if (active) {
          setOptions([]);
        }
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/account/profile");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await readJsonResponse<ProfileResponse>(response, {
          user: null,
        });
        const user = json.user;

        if (active && user) {
          setForm((current) => ({
            ...current,
            firstName: user.firstName ?? current.firstName,
            lastName: user.lastName ?? current.lastName,
            address: {
              number: user.addressNumber ?? current.address.number,
              street: user.addressStreet ?? current.address.street,
              city: user.addressCity ?? current.address.city,
              state: user.addressState ?? current.address.state,
            },
            phone: user.phone ?? current.phone,
            mobile: user.mobile ?? current.mobile,
            email: user.email ?? current.email,
            birthDate: user.birthDate
              ? user.birthDate.substring(0, 10)
              : current.birthDate,
          }));
        }
      } catch {
        // Keep the empty form when the profile request fails.
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session]);

  const pricing = useMemo(
    () =>
      calculateReservationPricingSummary({
        arrivalDate,
        departureDate,
        adults: form.adults,
        children: form.children,
        selectedOptions: options.filter((option) => form.options[option.id]),
      }),
    [arrivalDate, departureDate, form.adults, form.children, form.options, options]
  );

  const requiredProfileFields = useMemo(
    () =>
      PROFILE_REQUIRED_FIELDS.map((field) => ({
        ...field,
        label: t(field.labelKey),
      })),
    [t]
  );

  const updateAddressField = (field: AddressField, value: string) => {
    setForm((current) => ({
      ...current,
      address: { ...current.address, [field]: value },
    }));
  };

  const updateTextField = (field: BookingTextField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateCheckboxField = (field: BookingCheckboxField, value: boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleChange = (event: BookingInputEvent) => {
    const target = event.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    if (isAddressField(name)) {
      updateAddressField(name, value);
      return;
    }

    if (name === "adults" || name === "children") {
      setForm((current) => ({
        ...current,
        [name]: Number.parseInt(value, 10) || 0,
      }));
      return;
    }

    if (type === "checkbox") {
      if (name.startsWith(BOOKING_OPTION_PREFIX)) {
        const id = name.replace(BOOKING_OPTION_PREFIX, "");
        setForm((current) => ({
          ...current,
          options: { ...current.options, [id]: checked },
        }));
        return;
      }

      if (isBookingCheckboxField(name)) {
        updateCheckboxField(name, checked);
      }
      return;
    }

    if (isBookingTextField(name)) {
      updateTextField(name, value);
    }
  };

  const selectedOptionIds = Object.entries(form.options)
    .filter(([, selected]) => selected)
    .map(([id]) => id);

  const performReservation = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const payload: ReservationCreatePayload = {
        startDate: arrivalDate.toISOString(),
        endDate: departureDate.toISOString(),
        adults: form.adults,
        children: form.children,
        optionIds: selectedOptionIds,
        pricing: {
          basePriceHt: pricing.basePriceHt,
          optionSumHt: pricing.optionSumHt,
          subtotalHt: pricing.subtotalHt,
          tvaHt: pricing.tvaHt,
          taxSejourTtc: pricing.taxSejourTtc,
          total: pricing.total,
        },
      };

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        const json = await readJsonResponse<ApiErrorResponse>(response, {
          error: "",
        });
        if (/profile incomplete/i.test(json.error)) {
          setShowProfileModal(true);
          return;
        }
      }

      if (!response.ok) {
        throw new Error("Failed to create reservation");
      }

      window.location.href = "/account";
    } catch (reservationError) {
      setError(getErrorMessage(reservationError, "Error"));
    } finally {
      setSubmitting(false);
    }
  };

  const saveProfileAndContinue = async () => {
    setProfileError(null);
    const missing = getMissingProfileFields(form);
    if (missing.length) {
      setProfileError("Please fill all required fields.");
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          toProfileUpdatePayload({
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            mobile: form.mobile,
            birthDate: form.birthDate,
            addressNumber: form.address.number,
            addressStreet: form.address.street,
            addressCity: form.address.city,
            addressState: form.address.state,
          })
        ),
      });
      if (!response.ok) {
        throw new Error("Profile save failed");
      }

      setShowProfileModal(false);
      await performReservation();
    } catch (profileSaveError) {
      setProfileError(getErrorMessage(profileSaveError, "Error saving profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session) {
      window.location.href = "/account";
      return;
    }

    const missing = getMissingProfileFields(form);
    if (missing.length) {
      setShowProfileModal(true);
      return;
    }

    await performReservation();
  };

  return (
    <div className="p-4 md:p-8 text-gray-100 w-full">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        <div className="md:col-span-12 mb-2 text-sm opacity-80">
          <p>
            {t("arrival")}: {arrivalDate.toLocaleDateString()} &mdash;{" "}
            {t("departure")}: {departureDate.toLocaleDateString()}
          </p>
        </div>
        <div className="md:col-span-7">
          <h2 className="text-xl font-semibold mb-4">{t("contact")}</h2>
          {!session && (
            <p className="mb-4 text-sm text-red-300">
              {t("pleaseLogin") ||
                "Please sign in first to complete booking. Your selected dates will be kept."}
            </p>
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
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
              />
            </div>
            <div>
              <label htmlFor="birthDate" className="block text-sm">
                {t("birthDate")}
              </label>
              <input
                id="birthDate"
                type="date"
                name="birthDate"
                value={form.birthDate}
                onChange={handleChange}
                className="mt-1 w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              name="specialOffers"
              checked={form.specialOffers}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-indigo-500"
            />
            <span className="ml-2 text-sm">
              I would like to receive special offers
            </span>
          </label>
          <div className="grid grid-cols-2 gap-4 mt-6 mb-4">
            <div>
              <label className="block text-sm mb-1">Adults</label>
              <input
                type="number"
                name="adults"
                min={1}
                value={form.adults}
                onChange={handleChange}
                className="w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Children</label>
              <input
                type="number"
                name="children"
                min={0}
                value={form.children}
                onChange={handleChange}
                className="w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          {options.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Options</h3>
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name={`${BOOKING_OPTION_PREFIX}${option.id}`}
                      checked={!!form.options[option.id]}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <span className="flex-1">{option.name}</span>
                    <span className="text-xs opacity-70">
                      &euro;{option.priceHt.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t("comments")}</h2>
            <textarea
              name="comments"
              value={form.comments}
              onChange={handleChange}
              placeholder={t("comments")}
              className="w-full h-40 p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400 text-gray-100"
            />
            <div className="mt-6">
              <label htmlFor="discountCode" className="block text-sm mb-1">
                {t("discountCode")}
              </label>
              <input
                id="discountCode"
                type="text"
                name="discountCode"
                value={form.discountCode}
                onChange={handleChange}
                className="w-full p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <PriceSummary
              basePriceHt={pricing.basePriceHt}
              optionSumHt={pricing.optionSumHt}
              tvaHt={pricing.tvaHt}
              taxSejourTtc={pricing.taxSejourTtc}
              total={pricing.total}
              deposit={pricing.deposit}
              balance={pricing.balance}
            />
            <label className="inline-flex items-center mt-4">
              <input
                type="checkbox"
                name="payFullNow"
                checked={form.payFullNow}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-indigo-500"
              />
              <span className="ml-2 text-sm">{t("payFullNow")}</span>
            </label>
          </div>
          <div className="mt-8">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="cancellation"
                checked={form.cancellation}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-indigo-500"
              />
              <span className="ml-2 text-sm">{t("cancellationInsurance")}</span>
            </label>
            <label className="inline-flex items-center ml-6 mt-2">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-indigo-500"
              />
              <span className="ml-2 text-sm underline cursor-pointer">
                {t("acceptTerms")}
              </span>
            </label>
            {error && <div className="mt-4 text-xs text-red-300">{error}</div>}
            <button
              type="submit"
              disabled={!form.acceptTerms || submitting}
              className="group relative mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2 font-semibold text-white bg-gradient-to-r from-indigo-600 via-blue-700 to-indigo-600 shadow-lg shadow-indigo-900/30 hover:from-indigo-500 hover:via-blue-600 hover:to-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{submitting ? "Saving..." : t("pay")}</span>
              <span className="transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
              <span className="absolute inset-0 rounded-full ring-1 ring-white/10 pointer-events-none" />
            </button>
          </div>
        </div>
      </form>
      <ProfileCompletionModal
        open={showProfileModal}
        form={form}
        requiredFields={requiredProfileFields}
        onChange={handleChange}
        onClose={() => setShowProfileModal(false)}
        onSave={saveProfileAndContinue}
        savingProfile={savingProfile}
        profileError={profileError}
      />
    </div>
  );
}

function PriceSummary({
  basePriceHt,
  optionSumHt,
  tvaHt,
  taxSejourTtc,
  total,
  deposit,
  balance,
}: {
  basePriceHt: number;
  optionSumHt: number;
  tvaHt: number;
  taxSejourTtc: number;
  total: number;
  deposit: number;
  balance: number;
}) {
  return (
    <div className="mt-6 text-sm space-y-1">
      <p>Base HT &euro;{basePriceHt.toFixed(2)}</p>
      <p>Options HT &euro;{optionSumHt.toFixed(2)}</p>
      <p>TVA HT &euro;{tvaHt.toFixed(2)}</p>
      <p>{"Taxe s\u00e9jour"} &euro;{taxSejourTtc.toFixed(2)}</p>
      <p className="font-medium">Total &euro;{total.toFixed(2)}</p>
      <p>Deposit &euro;{deposit.toFixed(2)}</p>
      <p>Balance &euro;{balance.toFixed(2)}</p>
    </div>
  );
}

function ProfileCompletionModal({
  open,
  form,
  requiredFields,
  onChange,
  onClose,
  onSave,
  savingProfile,
  profileError,
}: {
  open: boolean;
  form: BookingFormState;
  requiredFields: Array<
    (typeof PROFILE_REQUIRED_FIELDS)[number] & { label: string }
  >;
  onChange: (event: BookingInputEvent) => void;
  onClose: () => void;
  onSave: () => void;
  savingProfile: boolean;
  profileError: string | null;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-blue-900 border border-blue-700 rounded-lg w-full max-w-lg p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-xs px-2 py-1 bg-blue-700/40 rounded hover:bg-blue-600/60"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-2">Complete your profile</h3>
        <p className="text-xs mb-4 opacity-80">
          We need a few details before confirming your reservation.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {requiredFields.map((field) => {
            const missing = !getProfileFieldValue(form, field.key).trim();
            const baseName = field.key.includes("address.")
              ? field.key.split(".")[1]
              : field.key;

            return (
              <div key={field.key} className="flex flex-col">
                <label className="text-xs mb-1">
                  {field.label}
                  <span className="text-red-300 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name={baseName}
                  value={getProfileFieldValue(form, field.key)}
                  onChange={onChange}
                  className={`p-2 rounded bg-blue-800 border text-sm focus:outline-none focus:border-indigo-400 ${
                    missing ? "border-red-500" : "border-blue-700"
                  }`}
                />
              </div>
            );
          })}
        </div>
        {profileError && (
          <div className="mt-3 text-xs text-red-300">{profileError}</div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-blue-800 border border-blue-700 hover:bg-blue-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={savingProfile}
            className="px-4 py-2 text-sm rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
