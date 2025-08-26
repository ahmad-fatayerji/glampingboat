"use client";
import { signIn } from "next-auth/react";

interface Props {
  dark?: boolean;
}

export default function GoogleSignInButton({ dark }: Props) {
  const base =
    "w-full py-2 rounded-md font-medium transition flex items-center justify-center gap-2 text-sm ring-1 ring-transparent";
  const style = dark
    ? "bg-[#1d252c] text-[var(--color-beige)]/90 hover:bg-[#27323b] hover:text-[var(--color-beige)] ring-[#2d3942]"
    : "bg-red-600 text-white hover:bg-red-700";
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className={`${base} ${style}`}
    >
      {/* simple G icon */}
      <span className="text-lg leading-none">�</span>
      <span className="tracking-wide">Sign in with Google</span>
    </button>
  );
}
