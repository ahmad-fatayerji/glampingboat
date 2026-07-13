"use client";

import { validatePasswordPolicy } from "@/lib/password-policy";
import { useT } from "@/components/Language/useT";

type PasswordRequirementsProps = {
  password: string;
  tone?: "dark" | "light";
};

export default function PasswordRequirements({
  password,
  tone = "dark",
}: PasswordRequirementsProps) {
  const t = useT();
  const policy = validatePasswordPolicy(password);
  const textClass =
    tone === "dark"
      ? "text-[var(--color-beige)]"
      : "text-[var(--color-blue)]";
  const mutedTextClass =
    tone === "dark"
      ? "text-[var(--color-beige)]/65"
      : "text-[var(--color-blue)]/65";
  const titleClass =
    tone === "dark"
      ? "text-[var(--color-beige)]/85"
      : "text-[var(--color-blue)]/80";
  const pendingDotClass =
    tone === "dark"
      ? "h-2.5 w-2.5 rounded-full border border-[var(--color-beige)]/45"
      : "h-2.5 w-2.5 rounded-full border border-[var(--color-blue)]/35";
  const requirements = [
    { met: policy.minLength, label: t("passwordReqMinLength") },
    { met: policy.hasUppercase, label: t("passwordReqUppercase") },
    { met: policy.hasLowercase, label: t("passwordReqLowercase") },
    { met: policy.hasNumber, label: t("passwordReqNumber") },
    { met: policy.hasSymbol, label: t("passwordReqSymbol") },
  ];

  return (
    <div className="space-y-2 text-xs" aria-live="polite">
      <p className={titleClass}>{t("passwordRequirementsTitle")}</p>
      <ul className="grid gap-1">
        {requirements.map((requirement) => (
          <li
            key={requirement.label}
            className={`flex items-center gap-2 ${
              requirement.met ? textClass : mutedTextClass
            }`}
          >
            <span
              aria-hidden="true"
              className={
                requirement.met
                  ? "h-2.5 w-2.5 rounded-full bg-[#8fbf8f]"
                  : pendingDotClass
              }
            />
            <span>{requirement.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
