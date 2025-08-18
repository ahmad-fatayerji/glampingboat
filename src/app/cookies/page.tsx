export const metadata = { title: "Politique de cookies" };

import ManageCookiesButton from "@/components/Legal/ManageCookiesButton";

export default function CookiesPolicy() {
  return (
    <main className="prose prose-invert max-w-3xl mx-auto py-10">
      <h1>Politique de cookies</h1>
      <p>
        Maquette de politique de cookies conforme au RGPD et au droit français.
        Remplacez les zones entre crochets par vos informations réelles.
      </p>
      <h2>Responsable du traitement</h2>
      <p>[Nom/raison sociale], [adresse], contact: [email].</p>
      <h2>Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie est un traceur déposé sur votre terminal pour permettre le
        fonctionnement du site, mesurer son audience ou personnaliser votre
        expérience.
      </p>
      <h2>Cookies utilisés</h2>
      <ul>
        <li>
          Indispensables: nécessaires au fonctionnement du site (ex: gestion de
          session).
        </li>
        <li>Mesure d'audience: statistiques [outil utilisé ou "aucun"].</li>
        <li>Confort & performance: mémorisation de préférences.</li>
        <li>Marketing: personnalisation publicitaire [si applicable].</li>
      </ul>
      <h2>Base légale</h2>
      <p>Indispensables: intérêt légitime. Autres catégories: consentement.</p>
      <h2>Durées de conservation</h2>
      <p>
        Indiquez ici les durées de vie de chaque cookie et/ou plage (ex: 13 mois
        maximum pour les cookies de mesure d'audience).
      </p>
      <h2>Gestion du consentement</h2>
      <p>
        Vous pouvez modifier vos choix à tout moment via la bannière de cookies
        ou les paramètres de votre navigateur.
      </p>
      <h2>Vos droits</h2>
      <p>
        Accès, rectification, opposition, effacement. Contact: [email DPO ou
        contact]. Réclamation: CNIL.
      </p>
      <ManageCookiesButton />
    </main>
  );
}
