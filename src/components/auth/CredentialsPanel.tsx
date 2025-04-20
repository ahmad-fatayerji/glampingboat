"use client"

import { useState } from "react"
import CredentialsSignUp from "./CredentialsSignUp"
import CredentialsSignIn from "./CredentialsSignIn"

export default function CredentialsPanel() {
  const [mode, setMode] = useState<"sign-up" | "sign-in">("sign-up")

  return (
    <div className="space-y-4">
      {/* toggle buttons */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setMode("sign-up")}
          className={`px-4 py-2 rounded-tl rounded-bl ${
            mode === "sign-up"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setMode("sign-in")}
          className={`px-4 py-2 rounded-tr rounded-br ${
            mode === "sign-in"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Sign In
        </button>
      </div>

      {/* the active form */}
      {mode === "sign-up" ? <CredentialsSignUp /> : <CredentialsSignIn />}
    </div>
  )
}
