"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
} from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/Language/LanguageContext";
import { useT } from "@/components/Language/useT";
import {
  getMissingProfileFields,
  getProfileFieldValue,
  PROFILE_REQUIRED_FIELDS,
  toProfileUpdatePayload,
} from "@/lib/profile";
import {
  calculateReservationPricingSummary,
  getOptionQuantity,
} from "@/lib/reservations";
import { getErrorMessage, readJsonResponse } from "@/lib/http";
import { isPhoneField, sanitizePhoneNumber } from "@/lib/input";
import type {
  AddressField,
  AppliedBookingPromo,
  ApiErrorResponse,
  BookingPromoRecord,
  BookingFormState,
  OptionRecord,
  ProfileResponse,
  ReservationCreatePayload,
  ReservationSerialized,
} from "@/lib/types";
import { ADDRESS_FIELDS, NAME_FIELDS, PHONE_FIELDS } from "@/lib/types";

interface BookingFormProps {
  arrivalDate: Date;
  departureDate: Date;
  initialAdults?: number;
  initialChildren?: number;
  promos?: BookingPromoRecord[];
  onBack?: () => void;
  onReserved?: (reservation: ReservationSerialized) => void;
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
  | "acceptTerms"
  | "payFullNow";

type BookingInputEvent = ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

type BookingFieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (event: BookingInputEvent) => void;
  type?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
};

const buildInitialForm = (
  adults: number,
  childrenCount: number
): BookingFormState => ({
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
  acceptTerms: false,
  payFullNow: false,
  adults,
  children: childrenCount,
  options: {},
});

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
  "acceptTerms",
  "payFullNow",
];

const LINEN_PATTERN = /linge|lit|linen/i;

function isAddressField(name: string): name is AddressField {
  return (ADDRESS_FIELDS as readonly string[]).includes(name);
}

function isBookingTextField(name: string): name is BookingTextField {
  return (TEXT_FIELDS as readonly string[]).includes(name);
}

function isBookingCheckboxField(name: string): name is BookingCheckboxField {
  return (CHECKBOX_FIELDS as readonly string[]).includes(name);
}

function fmtEuro(value: number) {
  return `\u20AC${value.toFixed(2)}`;
}

function fmtDate(date: Date) {
  return format(date, "MM/dd/yyyy");
}

export default function BookingForm({
  arrivalDate,
  departureDate,
  initialAdults = 2,
  initialChildren = 0,
  promos = [],
  onBack,
  onReserved,
}: BookingFormProps) {
  const t = useT();
  const { locale } = useLanguage();
  const { data: session } = useSession();
  const [form, setForm] = useState<BookingFormState>(() =>
    buildInitialForm(initialAdults, initialChildren)
  );
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
          setForm((current) => {
            const next = { ...current.options };
            for (const opt of data) {
              if (next[opt.id] === undefined) {
                next[opt.id] = !LINEN_PATTERN.test(opt.name);
              }
            }
            return { ...current, options: next };
          });
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
        // Keep the existing form data if the profile request fails.
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session]);

  const selectedOptions = useMemo(
    () => options.filter((option) => form.options[option.id]),
    [options, form.options]
  );

  const pricing = useMemo(
    () =>
      calculateReservationPricingSummary({
        arrivalDate,
        departureDate,
        adults: form.adults,
        children: form.children,
        selectedOptions,
        promos,
      }),
    [arrivalDate, departureDate, form.adults, form.children, selectedOptions, promos]
  );

  const headCount = form.adults + form.children;
  const nightlyTtc = pricing.nights > 0
    ? pricing.baseTtc / pricing.nights
    : 0;

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
    const nextValue = isPhoneField(field) ? sanitizePhoneNumber(value) : value;
    setForm((current) => ({ ...current, [field]: nextValue }));
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

  const toggleOption = (id: string, value: boolean) => {
    setForm((current) => ({
      ...current,
      options: { ...current.options, [id]: value },
    }));
  };

  const selectedOptionIds = Object.entries(form.options)
    .filter(([, selected]) => selected)
    .map(([id]) => id);

  const performReservation = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const payload: ReservationCreatePayload = {
        startDate: format(arrivalDate, "yyyy-MM-dd"),
        endDate: format(departureDate, "yyyy-MM-dd"),
        adults: form.adults,
        children: form.children,
        optionIds: selectedOptionIds,
        payFullNow: form.payFullNow,
        acceptTerms: form.acceptTerms,
        locale,
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
        const json = await readJsonResponse<ApiErrorResponse>(response, {
          error: t("failedCreateReservation"),
        });
        throw new Error(json.error || t("failedCreateReservation"));
      }

      const created = await readJsonResponse<ReservationSerialized | null>(
        response,
        null
      );
      if (created && onReserved) {
        onReserved(created);
        return;
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
      setProfileError(t("fillAllRequired"));
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
        throw new Error(t("profileSaveFailed"));
      }

      setShowProfileModal(false);
      await performReservation();
    } catch (profileSaveError) {
      setProfileError(getErrorMessage(profileSaveError, t("errorSavingProfile")));
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
    <div className="w-full text-[var(--color-beige)]">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm text-[var(--color-beige)]/80 hover:text-[var(--color-beige)]"
        >
          &lsaquo; {t("previous")}
        </button>
      )}

      <PriceRecap
        arrivalDate={arrivalDate}
        departureDate={departureDate}
        nights={pricing.nights}
        nightlyTtc={nightlyTtc}
        baseTtc={pricing.baseTtc}
        subtotalHt={pricing.subtotalHt}
        tvaHt={pricing.tvaHt}
        total={pricing.total}
        deposit={pricing.deposit}
        balance={pricing.balance}
        balanceDueDate={pricing.balanceDueDate}
        normalNightCount={pricing.normalNightCount}
        promoNightCount={pricing.promoNightCount}
        normalAccommodationTtc={pricing.normalAccommodationTtc}
        promoAccommodationTtc={pricing.promoAccommodationTtc}
        appliedPromos={pricing.appliedPromos}
        options={options}
        selectedOptions={form.options}
        onToggleOption={toggleOption}
        headCount={headCount}
        t={t}
      />

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12"
      >
        <div className="md:col-span-7">
          <h2 className="mb-4 border-b border-[#173c59] pb-2 text-[1.05rem] tracking-wide text-[var(--color-beige)]">
            {t("contactDetails")}
          </h2>
          {!session && (
            <p className="mb-4 text-sm text-[#ffd9d9]">
              {t("bookingSignInFirst")}
            </p>
          )}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {NAME_FIELDS.map((field) => (
              <Field
                key={field}
                id={field}
                name={field}
                label={t(field)}
                value={form[field]}
                onChange={handleChange}
              />
            ))}
          </div>
          <label className="mb-2 block text-sm text-[var(--color-beige)]/90">
            {t("address")}
          </label>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ADDRESS_FIELDS.map((field) => (
              <input
                key={field}
                type="text"
                placeholder={t(field)}
                name={field}
                value={form.address[field]}
                onChange={handleChange}
                className="h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]"
              />
            ))}
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PHONE_FIELDS.map((field) => (
              <Field
                key={field}
                id={field}
                name={field}
                label={t(field)}
                value={form[field]}
                onChange={handleChange}
                type="tel"
                inputMode="tel"
              />
            ))}
          </div>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              id="email"
              name="email"
              label={t("email")}
              value={form.email}
              onChange={handleChange}
              type="email"
            />
            <Field
              id="birthDate"
              name="birthDate"
              label={t("birthDate")}
              value={form.birthDate}
              onChange={handleChange}
              type="date"
            />
          </div>
          <label className="mt-2 inline-flex items-center">
            <input
              type="checkbox"
              name="specialOffers"
              checked={form.specialOffers}
              onChange={handleChange}
              className="h-4 w-4 accent-[#0d3350]"
            />
            <span className="ml-2 text-sm">{t("specialOffers")}</span>
          </label>

        </div>

        <div className="md:col-span-5 flex flex-col">
          <h2 className="mb-4 border-b border-[#173c59] pb-2 text-[1.05rem] tracking-wide text-[var(--color-beige)]">
            {t("comments")}
          </h2>
          <textarea
            name="comments"
            value={form.comments}
            onChange={handleChange}
            placeholder={t("comments")}
            className="h-40 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] p-3 text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69]"
          />
          <h3 className="mt-8 mb-3 border-b border-[#173c59] pb-2 text-[1.05rem] tracking-wide text-[var(--color-beige)]">
            {t("paymentSection")}
          </h3>
          <div className="text-sm text-[var(--color-beige)]/90">
            <div className="flex items-center justify-between">
              <span>{t("totalAmountLabel")}</span>
              <span className="font-medium">{fmtEuro(pricing.total)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>{t("depositOnBooking")}</span>
              <span>{fmtEuro(pricing.deposit)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>{t("balanceBeforeArrival")}</span>
              <span>{fmtEuro(pricing.balance)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>{t("balanceDueDate")}</span>
              <span>{pricing.balanceDueDate}</span>
            </div>
          </div>
          <label className="mt-3 inline-flex items-center">
            <input
              type="checkbox"
              name="payFullNow"
              checked={form.payFullNow}
              onChange={handleChange}
              className="h-4 w-4 accent-[#0d3350]"
            />
            <span className="ml-2 text-sm">{t("payFullNow")}</span>
          </label>

          <label className="mt-6 inline-flex items-start gap-2">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={form.acceptTerms}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 accent-[#0d3350]"
            />
            <span className="text-sm">
              {t("acceptTerms")}
            </span>
          </label>

          {error && <div className="mt-4 text-xs text-[#ffd9d9]">{error}</div>}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!form.acceptTerms || submitting}
              className="group inline-flex items-center gap-3 rounded-md bg-[var(--color-blue)] px-6 py-2 text-sm font-medium text-[var(--color-beige)] transition hover:bg-[#06324d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{submitting ? t("saving") : `${t("pay")} >`}</span>
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
        t={t}
      />
    </div>
  );
}

function Field({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  inputMode,
}: BookingFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm text-[var(--color-beige)]/90"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={onChange}
        className="mt-1 h-10 w-full rounded-md border-2 border-[#0d3350] bg-[var(--color-beige)] px-3 text-[var(--color-blue)] outline-none transition focus:border-[#234d69]"
      />
    </div>
  );
}

interface PriceRecapProps {
  arrivalDate: Date;
  departureDate: Date;
  nights: number;
  nightlyTtc: number;
  baseTtc: number;
  subtotalHt: number;
  tvaHt: number;
  total: number;
  deposit: number;
  balance: number;
  balanceDueDate: string;
  normalNightCount: number;
  promoNightCount: number;
  normalAccommodationTtc: number;
  promoAccommodationTtc: number;
  appliedPromos: AppliedBookingPromo[];
  options: OptionRecord[];
  selectedOptions: Record<string, boolean>;
  onToggleOption: (id: string, value: boolean) => void;
  headCount: number;
  t: ReturnType<typeof useT>;
}

function PriceRecap({
  arrivalDate,
  departureDate,
  nights,
  nightlyTtc,
  baseTtc,
  subtotalHt,
  tvaHt,
  total,
  deposit,
  balance,
  balanceDueDate,
  normalNightCount,
  promoNightCount,
  normalAccommodationTtc,
  promoAccommodationTtc,
  appliedPromos,
  options,
  selectedOptions,
  onToggleOption,
  headCount,
  t,
}: PriceRecapProps) {
  const normalNightlyTtc =
    normalNightCount > 0 ? normalAccommodationTtc / normalNightCount : nightlyTtc;

  return (
    <div className="rounded-lg bg-[var(--color-blue)]/40 p-4 text-sm text-[var(--color-beige)]">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-beige)]/60">
            {t("accommodationPrice")}
          </p>
          <p className="mt-1 text-3xl font-semibold">{fmtEuro(baseTtc)}</p>
          <p className="mt-1 text-xs text-[var(--color-beige)]/70">
            {t("fromTo")
              .replace("{start}", fmtDate(arrivalDate))
              .replace("{end}", fmtDate(departureDate))}
          </p>
          <p className="mt-1 text-xs text-[var(--color-beige)]/70">
            {nights} {nights === 1 ? t("nightSingular") : t("nightPlural")} -{" "}
            {t("pricePreviewIncludesTax")}
          </p>
        </div>
        <div className="grid gap-2 text-right text-xs">
          {normalNightCount > 0 && (
            <div>
              <span className="text-[var(--color-beige)]/68">
                {normalNightCount}{" "}
                {normalNightCount === 1 ? t("nightSingular") : t("nightPlural")}{" "}
                x {fmtEuro(normalNightlyTtc)}
              </span>
              <p className="font-medium">{fmtEuro(normalAccommodationTtc)}</p>
            </div>
          )}
          {promoNightCount > 0 && (
            <div className="rounded-lg border border-[#ffd36d]/50 bg-[linear-gradient(135deg,rgba(255,211,92,0.2),rgba(255,139,92,0.14))] px-3 py-2 text-left text-[#fff0c2] shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
              <p className="mb-1 inline-flex rounded-full bg-[#ffd36d]/16 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#ffe6a3] ring-1 ring-[#ffd36d]/34">
                {t("bookingPromoApplied")}
              </p>
              <span className="block font-medium text-[#ffd86f]">
                {t("bookingCalendarPromo")}
              </span>
              <span>
                {promoNightCount}{" "}
                {promoNightCount === 1 ? t("nightSingular") : t("nightPlural")}
              </span>
              <p className="font-medium">{fmtEuro(promoAccommodationTtc)}</p>
            </div>
          )}
        </div>
      </div>

      {appliedPromos.length > 0 && (
        <div className="mt-4 rounded-lg border border-[#ffd36d]/45 bg-[linear-gradient(135deg,rgba(255,211,92,0.17),rgba(255,139,92,0.12))] p-3 text-xs text-[#fff0c2] shadow-sm shadow-black/10">
          <p className="mb-2 font-medium text-[#ffd86f]">
            {t("bookingPromoApplied")}
          </p>
          {appliedPromos.map((promo) => (
            <p key={promo.id}>
              {promo.title}: {promo.nights}{" "}
              {promo.nights === 1 ? t("nightSingular") : t("nightPlural")} x{" "}
              {fmtEuro(promo.nightlyTtcCents / 100)}
            </p>
          ))}
        </div>
      )}

      {options.length > 0 && (
        <div className="mt-4 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-2 border-t border-[var(--color-beige)]/20 pt-3">
          <div className="text-[var(--color-beige)]">{t("options")}:</div>
          <div className="text-right">{fmtEuro(sumOptionsHt(options, selectedOptions, headCount))}</div>
          <div className="text-right">
            {fmtEuro(sumOptionsHt(options, selectedOptions, headCount) * 0.2)}
          </div>
          <div className="text-right">
            {fmtEuro(sumOptionsHt(options, selectedOptions, headCount) * 1.2)}
          </div>

          {options.map((option) => {
            const selected = !!selectedOptions[option.id];
            const qty = getOptionQuantity(option, headCount);
            const lineHt = option.priceHt * qty;
            return (
              <div key={option.id} className="contents">
                <label className="flex items-center gap-2 pl-2 text-xs">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) =>
                      onToggleOption(option.id, e.target.checked)
                    }
                    className="h-4 w-4 accent-[var(--color-blue)]"
                  />
                  <span className="text-[var(--color-beige)]/85">
                    {qty > 1 ? `${qty} × ` : ""}
                    {option.name}
                    {qty > 1 ? ` (${fmtEuro(option.priceHt)})` : ""}
                  </span>
                </label>
                <div className="text-right text-xs text-[var(--color-beige)]/85">
                  {selected ? fmtEuro(lineHt) : fmtEuro(0)}
                </div>
                <div className="text-right text-xs text-[var(--color-beige)]/85">
                  {selected ? fmtEuro(lineHt * 0.2) : fmtEuro(0)}
                </div>
                <div className="text-right text-xs text-[var(--color-beige)]/85">
                  {selected ? fmtEuro(lineHt * 1.2) : fmtEuro(0)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-t border-[var(--color-beige)]/30 pt-3 font-medium">
        <div>{t("total")}:</div>
        <div className="text-right">{fmtEuro(subtotalHt)}</div>
        <div className="text-right">{fmtEuro(tvaHt)}</div>
        <div className="text-right">{fmtEuro(total)}</div>
      </div>

      <div className="mt-4 flex flex-col items-end text-sm">
        <div className="font-serif text-2xl text-[var(--color-beige)]">
          {t("totalAmountLabel")} {fmtEuro(total)}
        </div>
        <div className="text-xs text-[var(--color-beige)]/85">
          {t("depositOnBooking")} {fmtEuro(deposit)}
        </div>
        <div className="text-xs text-[var(--color-beige)]/85">
          {t("balanceBeforeArrival")} {fmtEuro(balance)}
        </div>
        <div className="text-xs text-[var(--color-beige)]/85">
          {t("balanceDueDate")} {balanceDueDate}
        </div>
      </div>
    </div>
  );
}

function sumOptionsHt(
  options: OptionRecord[],
  selected: Record<string, boolean>,
  headCount: number
) {
  return options.reduce((sum, opt) => {
    if (!selected[opt.id]) return sum;
    const qty = getOptionQuantity(opt, headCount);
    return sum + opt.priceHt * qty;
  }, 0);
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
  t,
}: {
  open: boolean;
  form: BookingFormState;
  requiredFields: Array<
    (typeof PROFILE_REQUIRED_FIELDS)[number] & { label: string }
  >;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSave: () => void;
  savingProfile: boolean;
  profileError: string | null;
  t: ReturnType<typeof useT>;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-lg border border-white/15 bg-[#3f5666]/92 p-6 text-[var(--color-beige)] shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 rounded px-2 py-1 text-xs text-[var(--color-beige)] transition hover:bg-[#0d3350]/40"
        >
          &times;
        </button>
        <h3 className="mb-2 border-b border-[#173c59] pb-2 text-[1.05rem] tracking-wide">
          {t("completeYourProfile")}
        </h3>
        <p className="mb-4 text-xs text-[var(--color-beige)]/80">
          {t("completeProfileBody")}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {requiredFields.map((field) => {
            const missing = !getProfileFieldValue(form, field.key).trim();
            const baseName = field.key.includes("address.")
              ? field.key.split(".")[1]
              : field.key;

            return (
              <div key={field.key} className="flex flex-col">
                <label className="mb-1 text-xs text-[var(--color-beige)]/90">
                  {field.label}
                  <span className="ml-1 text-[#ffd9d9]">*</span>
                </label>
                <input
                  type={isPhoneField(baseName) ? "tel" : "text"}
                  name={baseName}
                  value={getProfileFieldValue(form, field.key)}
                  onChange={onChange}
                  inputMode={isPhoneField(baseName) ? "tel" : undefined}
                  className={`h-10 rounded-md border-2 bg-[var(--color-beige)] px-3 text-sm text-[var(--color-blue)] outline-none transition placeholder:text-[var(--color-blue)]/45 focus:border-[#234d69] ${
                    missing ? "border-[#c65a4a]" : "border-[#0d3350]"
                  }`}
                />
              </div>
            );
          })}
        </div>
        {profileError && (
          <div className="mt-3 text-xs text-[#ffd9d9]">{profileError}</div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#173c59] px-4 py-2 text-sm text-[var(--color-beige)] transition hover:bg-[#0d3350]/40"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={savingProfile}
            className="rounded-xl bg-[#0d3350] px-4 py-2 text-sm text-[var(--color-beige)] transition hover:bg-[#123f61] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? t("saving") : t("saveContinue")}
          </button>
        </div>
      </div>
    </div>
  );
}
