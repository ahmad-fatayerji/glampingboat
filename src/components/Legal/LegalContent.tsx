"use client";

import { useLanguage } from "@/components/Language/LanguageContext";

export type LegalKind = "legal" | "cookies" | "terms";

const content = {
  legal: {
    fr: {
      title: "Mentions légales",
      body: (
        <>
          <p>
            Ce contenu est une maquette en français pour vos mentions légales
            (conformité droit français).
          </p>
          <h2>Éditeur du site</h2>
          <p>
            Raison sociale: [Votre société]
            <br />
            Forme juridique: [SARL / SAS / EI]
            <br />
            Siège social: [Adresse complète]
            <br />
            Capital social: [€]
            <br />
            RCS: [Ville] – [Numéro RCS]
            <br />
            N° TVA intracommunautaire: [FR..]
          </p>
          <h2>Hébergement</h2>
          <p>Hébergeur: [Nom, adresse, contact].</p>
          <h2>Contact</h2>
          <p>Email: contact@votredomaine.fr – Téléphone: [numéro]</p>
          <h2>Directeur de la publication</h2>
          <p>[Nom du directeur de la publication].</p>
          <h2>Propriété intellectuelle</h2>
          <p>
            Le contenu est protégé. Toute reproduction est interdite sans
            autorisation écrite.
          </p>
          <h2>Données personnelles</h2>
          <p>
            Voir la politique de confidentialité et la politique de cookies.
          </p>
        </>
      ),
    },
    en: {
      title: "Legal notices",
      body: (
        <>
          <p>
            This is an English mockup for your legal notices (French law
            compliance remains your responsibility).
          </p>
          <h2>Site publisher</h2>
          <p>
            Company: [Your company]
            <br />
            Legal form: [LLC / SAS / Sole proprietorship]
            <br />
            Registered office: [Full address]
            <br />
            Share capital: [€]
            <br />
            Trade register: [City] – [Registration number]
            <br />
            VAT number: [EU VAT]
          </p>
          <h2>Hosting</h2>
          <p>Host: [Name, address, contact].</p>
          <h2>Contact</h2>
          <p>Email: contact@yourdomain.com – Phone: [number]</p>
          <h2>Publishing director</h2>
          <p>[Name].</p>
          <h2>Intellectual property</h2>
          <p>
            Content is protected. Any reproduction requires prior written
            consent.
          </p>
          <h2>Personal data</h2>
          <p>See the privacy policy and the cookies policy.</p>
        </>
      ),
    },
  },
  cookies: {
    fr: {
      title: "Politique de cookies",
      body: (
        <>
          <p>
            Maquette de politique de cookies conforme au RGPD et au droit
            français.
          </p>
          <h2>Responsable du traitement</h2>
          <p>[Nom/raison sociale], [adresse], contact: [email].</p>
          <h2>Cookies utilisés</h2>
          <p>
            Indispensables, mesure d'audience, confort & performance, marketing.
          </p>
        </>
      ),
    },
    en: {
      title: "Cookies policy",
      body: (
        <>
          <p>
            Mockup cookies policy; adapt for GDPR compliance with actual
            details.
          </p>
          <h2>Controller</h2>
          <p>[Company name], [address], contact: [email].</p>
          <h2>Cookies used</h2>
          <p>
            Strictly necessary, analytics, preferences/performance, marketing.
          </p>
        </>
      ),
    },
  },
  terms: {
    fr: {
      title: "Conditions générales",
      body: (
        <>
          <p>
            Maquette de CGU/CGV. Adaptez selon vente / location / prestations.
          </p>
          <h2>Objet</h2>
          <p>Règles d'utilisation du site et des services/produits.</p>
        </>
      ),
    },
    en: {
      title: "Terms and conditions",
      body: (
        <>
          <p>
            English mockup of T&C; adapt to your business (sales, rental,
            services).
          </p>
          <h2>Purpose</h2>
          <p>
            Rules governing use of the website and the supply of
            services/products.
          </p>
        </>
      ),
    },
  },
} as const;

export default function LegalContent({ kind }: { kind: LegalKind }) {
  const { locale } = useLanguage();
  const lang = locale === "fr" ? "fr" : "en";
  const item = content[kind][lang];
  return (
    <main className="prose prose-invert max-w-3xl mx-auto py-10">
      <h1>{item.title}</h1>
      {item.body}
    </main>
  );
}
