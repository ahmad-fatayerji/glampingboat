export const metadata = { title: "Politique de cookies" };

import DrawerSurface from "@/components/Drawer/DrawerSurface";
import ManageCookiesButton from "@/components/Legal/ManageCookiesButton";
import LegalContent from "@/components/Legal/LegalContent";

export default function CookiesPolicy() {
  return (
    <DrawerSurface>
      <div className="mx-auto w-full max-w-5xl py-2 sm:py-4">
        <LegalContent kind="cookies" />
        <div className="mt-6">
          <ManageCookiesButton />
        </div>
      </div>
    </DrawerSurface>
  );
}
