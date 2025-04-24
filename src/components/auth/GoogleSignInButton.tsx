"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
    >
      Sign in with Google
    </button>
  );
}
