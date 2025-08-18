import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Marcellus, Outfit } from "next/font/google";
import Logo from "@/components/Logo";
import AppShell from "@/components/AppShell";
import { AudioProvider } from "@/components/Audio/AudioContext";
import CookieBanner from "@/components/Legal/CookieBanner";

const marcellus = Marcellus({ subsets: ["latin"], weight: "400" });
const outfit = Outfit({ subsets: ["latin"], weight: ["100", "300"] });

export const metadata = {
  title: "Glamping Boat",
  description: "Site de vente et location de bateaux fluviaux",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Compute “today” in Paris at midnight
  const parisNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" })
  );
  parisNow.setHours(0, 0, 0, 0);
  const serverToday = parisNow.toISOString();

  return (
    <html lang="en" className={`${marcellus.className} ${outfit.className}`}>
      <body>
        <SessionProvider>
          {/* AudioProvider mounted once here → audio persists across pages */}
          <AudioProvider src="/audio/bg-music.mp3">
            {/* fixed logo */}
            <div className="fixed top-12 left-4 z-40 pointer-events-none">
              <Logo />
            </div>

            {/* Your shell (nav menu, drawer, booking flow) */}
            <AppShell serverToday={serverToday}>{children}</AppShell>
            {/* Cookie consent banner */}
            <CookieBanner />
          </AudioProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
