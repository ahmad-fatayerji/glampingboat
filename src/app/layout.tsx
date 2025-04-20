import { SessionProvider } from "next-auth/react"
import { Marcellus, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
