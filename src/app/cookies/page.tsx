export const metadata = { title: "Politique de cookies" };

import ManageCookiesButton from "@/components/Legal/ManageCookiesButton";
import LegalContent from "@/components/Legal/LegalContent";

export default function CookiesPolicy() {
  return (
    <>
      <LegalContent kind="cookies" />
      <div className="max-w-3xl mx-auto px-4">
        <ManageCookiesButton />
      </div>
    </>
  );
}
