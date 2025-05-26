// src/components/Contact/ContactForm.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

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
    <div className="bg-blue-900 bg-opacity-50 backdrop-blur-lg p-4 md:p-8 rounded-lg text-gray-100 w-full">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Left / Contact details */}
        <div className="md:col-span-7">
          <h2 className="text-xl font-semibold mb-4">Contact</h2>

          {/* First & Last Name */}
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
                  required
                />
              </div>
            ))}
          </div>

          {/* Address */}
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
                required
              />
            ))}
          </div>

          {/* Phone & Mobile */}
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

          {/* Email */}
          <div className="mb-4">
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
              required
            />
          </div>
        </div>

        {/* Right / Message */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <h2 className="text-xl font-semibold mb-4">Message</h2>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your message..."
            className="w-full h-48 p-2 bg-blue-800 rounded border border-blue-700 focus:outline-none focus:border-indigo-400 text-gray-100"
            required
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-4 self-end bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded"
          >
            {status === "sending"
              ? "Sending…"
              : status === "success"
              ? "Sent!"
              : status === "error"
              ? "Retry"
              : "Send >"}
          </button>

          {status === "error" && (
            <p className="mt-2 text-red-400">Failed to send. Try again.</p>
          )}
        </div>
      </form>
    </div>
  );
}
