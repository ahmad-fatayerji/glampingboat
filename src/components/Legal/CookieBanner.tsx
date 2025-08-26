"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Preferences = {
  necessary: true; // always true and locked
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "cookie-consent-v1";

function loadPrefs(): Preferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Preferences;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      performance: !!parsed.performance,
      marketing: !!parsed.marketing,
    };
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({
    necessary: true,
    analytics: false,
    performance: false,
    marketing: false,
  });

  useEffect(() => {
    const existing = loadPrefs();
    if (!existing) {
      setOpen(true);
    }
  }, []);

  const save = (p: Preferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setOpen(false);
  };

  const acceptAll = () =>
    save({
      necessary: true,
      analytics: true,
      performance: true,
      marketing: true,
    });
  const rejectAll = () =>
    save({
      necessary: true,
      analytics: false,
      performance: false,
      marketing: false,
    });
  const saveSelection = () => save(prefs);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-lg bg-[#002038] text-gray-100 shadow-xl ring-1 ring-white/10">
        <div className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold">Cookies</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-200">
            Nous utilisons des cookies pour faire fonctionner le site, mesurer
            son audience et améliorer votre expérience. Vous pouvez accepter
            tous les cookies, les refuser (hors indispensables) ou personnaliser
            vos choix. Consultez notre{" "}
            <Link className="underline hover:text-indigo-300" href="/cookies">
              politique de cookies
            </Link>{" "}
            pour en savoir plus.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={acceptAll}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Tout accepter
            </button>
            <button
              onClick={rejectAll}
              className="px-4 py-2 rounded bg-blue-800 hover:bg-blue-700 text-white"
            >
              Tout refuser
            </button>
            <button
              onClick={() => setShowDetails((s) => !s)}
              className="px-4 py-2 rounded border border-white/20 hover:border-white/40"
            >
              Personnaliser
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3 p-3 rounded bg-blue-900/40">
                <input
                  type="checkbox"
                  checked
                  readOnly
                  className="mt-1 cursor-not-allowed"
                />
                <div>
                  <p className="font-medium">Indispensables</p>
                  <p className="text-gray-300">
                    Requis pour le fonctionnement du site et la sécurité.
                    Toujours activés.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded bg-blue-900/40">
                <input
                  id="analytics"
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, analytics: e.target.checked }))
                  }
                />
                <div>
                  <label
                    htmlFor="analytics"
                    className="font-medium cursor-pointer"
                  >
                    Mesure d'audience
                  </label>
                  <p className="text-gray-300">
                    Aide à comprendre l'utilisation du site (statistiques
                    anonymisées).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded bg-blue-900/40">
                <input
                  id="performance"
                  type="checkbox"
                  checked={prefs.performance}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, performance: e.target.checked }))
                  }
                />
                <div>
                  <label
                    htmlFor="performance"
                    className="font-medium cursor-pointer"
                  >
                    Confort & performance
                  </label>
                  <p className="text-gray-300">
                    Enregistre vos préférences pour améliorer l'expérience.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded bg-blue-900/40">
                <input
                  id="marketing"
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, marketing: e.target.checked }))
                  }
                />
                <div>
                  <label
                    htmlFor="marketing"
                    className="font-medium cursor-pointer"
                  >
                    Publicité
                  </label>
                  <p className="text-gray-300">
                    Personnalise le contenu publicitaire sur et en dehors du
                    site.
                  </p>
                </div>
              </div>
              <div className="sm:col-span-2">
                <button
                  onClick={saveSelection}
                  className="mt-2 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Enregistrer mes choix
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
