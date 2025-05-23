import { SessionProvider } from "next-auth/react";
import { Marcellus, Outfit } from "next/font/google";
import Logo from "@/components/Logo";
import "./globals.css";
import WaveToggle from "@/components/NavBox/WaveToggle";

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
    <html lang="en">
      <body>
        <SessionProvider>
          {/* WaveToggle lives at z-50 */}
          <WaveToggle /> {/* Logo under the wave, z-40 */}{" "}
          <div className="fixed top-8 z p-4 pointer-events-none">
            <Logo />{" "}
          </div>
          {/* page contents */} {children}{" "}
        </SessionProvider>
      </body>
    </html>
  );
}
