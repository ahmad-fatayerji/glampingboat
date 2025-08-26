"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/account" })}
      className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
    >
      Logout
    </button>
  );
}
