"use client";

import DrawerSurface from "@/components/Drawer/DrawerSurface";
import LegalContent, { type LegalKind } from "@/components/Legal/LegalContent";
import ManageCookiesButton from "@/components/Legal/ManageCookiesButton";

export default function LegalTextDrawer({
  kind,
}: {
  kind: Exclude<LegalKind, "legal">;
}) {
  const isLegalText = kind === "terms" || kind === "cookies";

  return (
    <DrawerSurface
      className={
        isLegalText
          ? "border-white/10 bg-[rgba(24,34,30,0.42)] shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-[1px]"
          : ""
      }
    >
      <div
        className={`mx-auto w-full ${isLegalText ? "max-w-5xl py-2 sm:py-4" : "max-w-3xl py-6"}`}
      >
        <LegalContent kind={kind} />
        {kind === "cookies" && (
          <div className="mt-6">
            <ManageCookiesButton />
          </div>
        )}
      </div>
    </DrawerSurface>
  );
}
