"use client";

import DrawerSurface from "@/components/Drawer/DrawerSurface";
import { useT } from "@/components/Language/useT";

export default function BuyDrawer({
  onBookClick,
  onContactClick,
}: {
  onBookClick: () => void;
  onContactClick: () => void;
}) {
  const t = useT();

  return (
    <DrawerSurface className="justify-center">
      <div className="max-w-3xl space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-beige)]/65">
          {t("buy")}
        </p>
        <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
          Own the glampingboat experience.
        </h2>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-beige)]/88">
          Construction and management of pleasure boats, mobile floating living
          structures and mini river bases. Contact us for purchase information,
          manufacturing details, and availability.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onContactClick}
            className="rounded-xl bg-[var(--color-beige)] px-5 py-3 font-semibold text-[var(--color-blue)] transition hover:bg-[#efe6d9]"
          >
            Contact
          </button>
          <button
            type="button"
            onClick={onBookClick}
            className="rounded-xl border border-[var(--color-beige)]/35 px-5 py-3 font-semibold text-[var(--color-beige)] transition hover:bg-white/8"
          >
            Book
          </button>
        </div>
      </div>
    </DrawerSurface>
  );
}
