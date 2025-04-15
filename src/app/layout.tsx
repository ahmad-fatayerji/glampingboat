// src/app/layout.tsx
import { Marcellus, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Import Marcellus with a default weight.
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
});

// Import Outfit with two weights: 100 (thin) and 300 (light).
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "300"],
});

export const metadata = {
  title: "Glamping Boat",
  description: "Site de vente et location de bateaux fluviaux",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${marcellus.className} ${outfit.className}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
