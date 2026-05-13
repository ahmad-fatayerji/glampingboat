"use client";

import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

export default function RouteAwareLogo() {
  const pathname = usePathname();
  const isAccountRoute = pathname.startsWith("/account");
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div
      className={`fixed left-5 z-40 transition-[top] duration-300 ${
        isAccountRoute || isAdminRoute ? "top-5" : "top-24"
      }`}
    >
      <Logo />
    </div>
  );
}
