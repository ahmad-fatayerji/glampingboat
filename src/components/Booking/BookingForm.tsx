import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useT } from "@/components/Language/useT";
import { useSession } from "next-auth/react";

interface BookingFormProps {
  arrivalDate: Date;
  departureDate: Date;
}

interface Address {
  number: string;
  street: string;
  city: string;
  state: string;
}

interface FormState {
  firstName: string;
  lastName: string;
  address: Address;
  phone: string;
  mobile: string;
  email: string;
  birthDate: string;
  comments: string;
  discountCode: string;
  specialOffers: boolean;
  cancellation: boolean;
  acceptTerms: boolean;
  payFullNow: boolean;
  adults: number;
  children: number;
  options: Record<string, boolean>; // optionId -> selected
}

const BookingForm: React.FC<BookingFormProps> = ({
  arrivalDate,
  departureDate,
}) => {
  const t = useT();
  const [form, setForm] = useState<FormState>({
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
  });
  const [options, setOptions] = useState<
    { id: string; name: string; priceHt: number }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  // Fetch options once
  useEffect(() => {
    fetch("/api/options")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setOptions(d);
      })
      .catch(() => {});
  }, []);

  // Prefill profile when session available
  useEffect(() => {
    if (!session) return;
    fetch("/api/account/profile")
      .then(async (r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        const txt = await r.text();
        if (!txt) return {};
        try {
          return JSON.parse(txt);
        } catch {
          return {};
        }
      })
      .then((j) => {
        if (j.user) {
          setForm((prev) => ({
            ...prev,
            firstName: j.user.firstName || prev.firstName,
            lastName: j.user.lastName || prev.lastName,
            address: {
              number: j.user.addressNumber || prev.address.number,
              street: j.user.addressStreet || prev.address.street,
              city: j.user.addressCity || prev.address.city,
              state: j.user.addressState || prev.address.state,
            },
            phone: j.user.phone || prev.phone,
            mobile: j.user.mobile || prev.mobile,
            email: j.user.email || prev.email,
            birthDate: j.user.birthDate
              ? j.user.birthDate.substring(0, 10)
              : prev.birthDate,
          }));
        }
      })
      .catch(() => {});
  }, [session]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (["number", "street", "city", "state"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else if (name === "adults" || name === "children") {
      setForm((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else if (type === "checkbox") {
      if (name.startsWith("opt_")) {
        const id = name.replace("opt_", "");
        setForm((prev) => ({
          ...prev,
          options: { ...prev.options, [id]: checked },
        }));
      } else {
        setForm((prev) => ({ ...prev, [name]: checked } as FormState));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value } as FormState));
    }
  };

  // simple pricing: base nightly 180, plus each selected option price * (adults+children if linen)
  const nights = Math.round(
    (departureDate.getTime() - arrivalDate.getTime()) / 86400000
  );
  const basePriceHt = 180 * nights;
  const optionSumHt = options.reduce((sum, o) => {
    if (!form.options[o.id]) return sum;
    // heuristic: if name includes 'linge' assume per person
    const perPerson = /linge|lit/i.test(o.name);
    const qty = perPerson ? form.adults + form.children : 1;
    return sum + o.priceHt * qty;
  }, 0);
  const subtotalHt = basePriceHt + optionSumHt;
  const tvaHt = subtotalHt * 0.2;
  const taxSejourTtc = 1.5 * nights * (form.adults + form.children);
  const total = subtotalHt + tvaHt + taxSejourTtc;
  const deposit = (total * 0.3).toFixed(2);
  const balance = (total - parseFloat(deposit)).toFixed(2);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session) {
      window.location.href = "/account";
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const selectedOptions = Object.entries(form.options)
        .filter(([, v]) => v)
        .map(([id]) => id);
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: arrivalDate.toISOString(),
          endDate: departureDate.toISOString(),
          adults: form.adults,
          children: form.children,
          optionIds: selectedOptions,
          pricing: {
            basePriceHt,
            optionSumHt,
            subtotalHt,
            tvaHt,
            taxSejourTtc,
            total,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create reservation");
      window.location.href = "/account";
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 text-gray-100 w-full">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        <div className="md:col-span-12 mb-2 text-sm opacity-80">
          <p>
            {t("arrival")}: {arrivalDate.toLocaleDateString()} —{" "}
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
                />
              </div>
            ))}
          </div>
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
              />
            ))}
          </div>
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
                {options.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={`opt_${o.id}`}
                      checked={!!form.options[o.id]}
                      onChange={handleChange}
                      className="h-4 w-4"
                    />
                    <span className="flex-1">{o.name}</span>
                    <span className="text-xs opacity-70">
                      €{o.priceHt.toFixed(2)}
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
            <div className="mt-6 text-sm space-y-1">
              <p>Base HT €{basePriceHt.toFixed(2)}</p>
              <p>Options HT €{optionSumHt.toFixed(2)}</p>
              <p>TVA HT €{tvaHt.toFixed(2)}</p>
              <p>Taxe séjour €{taxSejourTtc.toFixed(2)}</p>
              <p className="font-medium">Total €{total.toFixed(2)}</p>
              <p>Deposit €{deposit}</p>
              <p>Balance €{balance}</p>
            </div>
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
              <span>{submitting ? "Saving…" : t("pay")}</span>
              <span className="transition-transform group-hover:translate-x-1">
                ➜
              </span>
              <span className="absolute inset-0 rounded-full ring-1 ring-white/10 pointer-events-none" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
