"use client"; 

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");

  // Refs and event listener to close dropdown when clicking outside
  const langRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLanguageSelect = (lang: string) => {
    setSelectedLang(lang);
    setLangOpen(false);
    // Optionally, add language change logic here (e.g., router.push(..., { locale: lang.toLowerCase() }))
  };

  // Navigation items
  const navItems = [
    { label: "A propos", href: "/a-propos" },
    { label: "Le bateau", href: "/le-bateau" },
    { label: "Réserver", href: "/reserver" },
    { label: "Acheter", href: "/acheter" },
    { label: "Contact", href: "/contact" },
  ];

  // Language options
  const languages = ["EN", "FR", "DE", "NL", "RU"];

  return (
    <header className="relative w-full bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
      {/* Logo on the left */}
      <Link
        href="/"
        className="text-xl font-bold"
        style={{ fontFamily: "Marcellus, serif", color: "#002038" }}
      >
        GLAMPING BOAT
      </Link>

      {/* Right section: language dropdown and burger menu */}
      <div className="flex items-center space-x-4">
        {/* Language Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((prev) => !prev)}
            className="flex items-center text-sm focus:outline-none"
            style={{ fontFamily: "Outfit, sans-serif", color: "#002038" }}
          >
            {selectedLang}{" "}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {langOpen && (
            <ul className="absolute right-0 mt-2 w-24 bg-white shadow-md border border-gray-200 rounded">
              {languages.map((lang) => (
                <li key={lang}>
                  <button
                    onClick={() => handleLanguageSelect(lang)}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                    style={{ fontFamily: "Outfit, sans-serif", color: "#002038" }}
                  >
                    {lang}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Burger Menu Button */}
        <button
          onClick={toggleMenu}
          className="text-gray-700 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              // X icon when menu is open
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger icon when menu is closed
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Overlay (burger menu content) */}
      {menuOpen && (
        <nav className="absolute top-full left-0 w-full bg-white border-t border-gray-200 flex flex-col items-center space-y-4 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:underline"
              style={{ fontFamily: "Outfit, sans-serif", color: "#002038" }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
