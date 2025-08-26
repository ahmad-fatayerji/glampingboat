"use client";

import { useLanguage } from "./LanguageContext";

type Dict = Record<string, string>;

const dictionaries: Record<string, Dict> = {
    en: {
        ourVision: "Our Vision",
        boat: "Boat",
        book: "Book",
        buy: "Buy",
        contact: "Contact",
        legal: "Legal notices",
        cookies: "Cookies",
        terms: "Terms and conditions",
    },
    fr: {
        ourVision: "Notre vision",
        boat: "Bateau",
        book: "Réserver",
        buy: "Acheter",
        contact: "Contact",
        legal: "Mentions légales",
        cookies: "Cookies",
        terms: "Conditions générales",
    },
    de: { ourVision: "Unsere Vision", boat: "Boot", book: "Buchen", buy: "Kaufen", contact: "Kontakt", legal: "Impressum", cookies: "Cookies", terms: "AGB" },
    nl: { ourVision: "Onze visie", boat: "Boot", book: "Boeken", buy: "Kopen", contact: "Contact", legal: "Juridische vermeldingen", cookies: "Cookies", terms: "Voorwaarden" },
    ru: { ourVision: "Наша концепция", boat: "Лодка", book: "Бронировать", buy: "Купить", contact: "Контакты", legal: "Юридическая информация", cookies: "Cookies", terms: "Условия" },
    es: { ourVision: "Nuestra visión", boat: "Barco", book: "Reservar", buy: "Comprar", contact: "Contacto", legal: "Aviso legal", cookies: "Cookies", terms: "Términos" },
    it: { ourVision: "La nostra visione", boat: "Barca", book: "Prenota", buy: "Compra", contact: "Contatti", legal: "Note legali", cookies: "Cookie", terms: "Condizioni" },
};

export function useT() {
    const { locale } = useLanguage();
    const dict = dictionaries[locale] ?? dictionaries.en;
    return (key: keyof typeof dictionaries.en) => dict[key] ?? key;
}
