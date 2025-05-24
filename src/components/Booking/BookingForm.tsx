import React, { useState, ChangeEvent, FormEvent } from "react";

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
}

const BookingForm: React.FC = () => {
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
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (["number", "street", "city", "state"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked } as FormState));
    } else {
      setForm((prev) => ({ ...prev, [name]: value } as FormState));
    }
  };

  const total = 2130;
  const deposit = (total * 0.5).toFixed(2);
  const balance = (total * 0.5).toFixed(2);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // submit logic here
  };

  return (
    <div className="bg-blue-900 bg-opacity-50 backdrop-filter backdrop-blur-lg p-4 md:p-8 rounded-lg text-gray-100 w-full">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Left / Contact details */}
        <div className="md:col-span-7">
          <h2 className="text-xl font-semibold mb-4">Contact details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {["firstName", "lastName"].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
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

          <label className="block text-sm mb-2">Address</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {["number", "street", "city", "state"].map((item) => (
              <input
                key={item}
                type="text"
                placeholder={item.charAt(0).toUpperCase() + item.slice(1)}
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
                  {item}
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
                Email
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
                Birth Date
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
        </div>

        {/* Right Side */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <textarea
              name="comments"
              value={form.comments}
              onChange={handleChange}
              placeholder="Any additional requests or questions..."
              className="w-full h-40 p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400 text-gray-100"
            />

            <div className="mt-6">
              <label htmlFor="discountCode" className="block text-sm mb-1">
                Discount Code
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
              <p>Total amount €{total.toFixed(2)}</p>
              <p>Deposit 50% on booking €{deposit}</p>
              <p>Balance 15 days before date of arrival €{balance}</p>
            </div>

            <label className="inline-flex items-center mt-4">
              <input
                type="checkbox"
                name="payFullNow"
                checked={form.payFullNow}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-indigo-500"
              />
              <span className="ml-2 text-sm">Pay the full price now</span>
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
              <span className="ml-2 text-sm">
                I would like to take out cancellation insurance
              </span>
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
                I have read and accept the terms and conditions
              </span>
            </label>

            <button
              type="submit"
              disabled={!form.acceptTerms}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded"
            >
              Pay &gt;
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
