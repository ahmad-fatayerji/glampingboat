"use client";

import DrawerSurface from "@/components/Drawer/DrawerSurface";
import LegalContent, { type LegalKind } from "@/components/Legal/LegalContent";
import ManageCookiesButton from "@/components/Legal/ManageCookiesButton";

export default function LegalTextDrawer({
  kind,
}: {
  kind: Exclude<LegalKind, "legal">;
}) {
  return (
    <DrawerSurface>
      <div className="mx-auto w-full max-w-3xl py-6">
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
