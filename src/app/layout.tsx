import { SessionProvider } from "next-auth/react";
import { Marcellus, Outfit } from "next/font/google";
import Logo from "@/components/Logo";
import "./globals.css";
import WaveToggle from "@/components/NavBox/WaveToggle";
import AppShell from "@/components/AppShell";

//Import of fonts
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "300"],
});

//Metadata setup
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
  return (
    <html lang="en" className={`${marcellus.className} ${outfit.className}`}>
      <body>
        {/* wrap everything in SessionProvider */}
        <SessionProvider>
          {/* fixed logo directly under the waves button (left-4, just below top-4) */}
          <div className="fixed top-12 left-4 z-40 pointer-events-none">
            <Logo />
          </div>

          {/* AppShell now assumes session is already provided */}
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
