"use client";

import { useT } from "@/components/Language/useT";

export default function Loading() {
  const t = useT();

  return <h1>{t("loading")}</h1>;
}
