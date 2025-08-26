"use client";
import { useState } from "react";
import CredentialsSignIn from "./CredentialsSignIn";
import CredentialsSignUp from "./CredentialsSignUp";

export default function CredentialsTabs() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  return (
    <div className="space-y-6">
      <h1 className="text-center text-2xl font-semibold tracking-wide text-[var(--color-blue)]">
        {mode === "signin" ? "Sign in" : "Create account"}
      </h1>
      <div className="grid grid-cols-2 rounded-full overflow-hidden bg-[var(--color-beige)]/60 text-sm ring-1 ring-[var(--color-blue)]/10">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`py-2 font-medium transition ${
            mode === "signin"
              ? "bg-[var(--color-blue)] text-[var(--color-beige)]"
              : "text-[var(--color-blue)]/70 hover:text-[var(--color-blue)]"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`py-2 font-medium transition ${
            mode === "signup"
              ? "bg-[var(--color-blue)] text-[var(--color-beige)]"
              : "text-[var(--color-blue)]/70 hover:text-[var(--color-blue)]"
          }`}
        >
          Create
        </button>
      </div>
      {mode === "signin" ? <CredentialsSignIn /> : <CredentialsSignUp />}
    </div>
  );
}

export type {};
