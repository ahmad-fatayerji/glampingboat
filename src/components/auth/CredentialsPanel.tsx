"use client";

import { useState } from "react";
import CredentialsSignUp from "./CredentialsSignUp";
import CredentialsSignIn from "./CredentialsSignIn";
import { useT } from "@/components/Language/useT";

export default function CredentialsPanel() {
  const [mode, setMode] = useState<"sign-up" | "sign-in">("sign-up");
  const t = useT();

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setMode("sign-up")}
          className={`px-4 py-2 rounded-tl rounded-bl ${
            mode === "sign-up"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("authCreateAccount")}
        </button>
        <button
          onClick={() => setMode("sign-in")}
          className={`px-4 py-2 rounded-tr rounded-br ${
            mode === "sign-in"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t("authSignIn")}
        </button>
      </div>

      {mode === "sign-up" ? <CredentialsSignUp /> : <CredentialsSignIn />}
    </div>
  );
}
