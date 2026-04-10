"use client";

import React from "react";
import { useT } from "@/components/Language/useT";
import type { TranslationKey } from "@/components/Language/dictionaries";

const LINKS = [
  { key: "cookies", onClickProp: "onCookiesClick" },
  { key: "terms", onClickProp: "onTermsClick" },
] as const satisfies ReadonlyArray<{
  key: TranslationKey;
  onClickProp: "onCookiesClick" | "onTermsClick";
}>;

export default function LegalLinks({
  onLegalClick,
  onCookiesClick,
  onTermsClick,
}: {
  onLegalClick: () => void;
  onCookiesClick: () => void;
  onTermsClick: () => void;
}) {
  const t = useT();
  const handlers = {
    onCookiesClick,
    onTermsClick,
  };

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-y-1 text-center text-xs leading-snug text-gray-600 sm:text-sm">
      <button type="button" onClick={onLegalClick} className="hover:underline">
        {t("legal")}
      </button>
      <span className="px-2 text-gray-400" aria-hidden="true">
        {"\u00B7"}
      </span>
      {LINKS.map((item, index) => (
        <React.Fragment key={item.key}>
          <button
            type="button"
            onClick={handlers[item.onClickProp]}
            className="hover:underline"
          >
            {t(item.key)}
          </button>
          {index < LINKS.length - 1 && (
            <span className="px-2 text-gray-400" aria-hidden="true">
              {"\u00B7"}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
