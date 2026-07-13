"use client";

import { useLanguage } from "@/components/Language/LanguageContext";
import type { Locale } from "@/components/Language/dictionaries";
import RentalTerms from "@/components/Legal/RentalTerms";

export type LegalKind = "legal" | "cookies" | "terms";

type LegalItem = {
  title: string;
  body: React.JSX.Element;
};

type CookiePolicyCopy = {
  title: string;
  intro: string;
  usedTitle: string;
  usedBody: string;
  noTrackingTitle: string;
  noTrackingBody: string;
  choicesTitle: string;
  choicesBody: string;
};

const cookiePolicyCopies: Record<Locale, CookiePolicyCopy> = {
  en: {
    title: "Cookies policy",
    intro:
      "This page explains how Glamping Boat uses cookies and browser storage.",
    usedTitle: "What we use",
    usedBody:
      "We only use necessary storage to run the site, remember your language and cookie choice, keep account sessions secure, and support services you choose to use, such as Google sign-in, Stripe checkout, or the embedded YouTube video.",
    noTrackingTitle: "No analytics or advertising cookies",
    noTrackingBody:
      "We do not currently use analytics, advertising, profiling, or marketing cookies on this site.",
    choicesTitle: "Managing your choice",
    choicesBody:
      "You can reopen the cookie banner with the button below, or clear cookies and local storage in your browser settings.",
  },
  fr: {
    title: "Politique de cookies",
    intro:
      "Cette page explique comment Glamping Boat utilise les cookies et le stockage navigateur.",
    usedTitle: "Ce que nous utilisons",
    usedBody:
      "Nous utilisons uniquement le stockage necessaire au fonctionnement du site, a la memorisation de votre langue et de votre choix cookies, a la securite des sessions compte et aux services que vous choisissez d'utiliser, comme Google, Stripe ou la video YouTube integree.",
    noTrackingTitle: "Aucun cookie d'analyse ou publicitaire",
    noTrackingBody:
      "Nous n'utilisons actuellement aucun cookie d'analyse, de publicite, de profilage ou de marketing sur ce site.",
    choicesTitle: "Gerer votre choix",
    choicesBody:
      "Vous pouvez rouvrir le bandeau cookies avec le bouton ci-dessous, ou supprimer les cookies et le stockage local dans les reglages de votre navigateur.",
  },
  de: {
    title: "Cookie-Richtlinie",
    intro:
      "Diese Seite erklaert, wie Glamping Boat Cookies und Browser-Speicher verwendet.",
    usedTitle: "Was wir verwenden",
    usedBody:
      "Wir verwenden nur notwendigen Speicher, um die Website zu betreiben, Ihre Sprache und Cookie-Auswahl zu merken, Kontositzungen zu schuetzen und Dienste zu unterstuetzen, die Sie selbst nutzen, wie Google-Anmeldung, Stripe Checkout oder das eingebettete YouTube-Video.",
    noTrackingTitle: "Keine Analyse- oder Werbe-Cookies",
    noTrackingBody:
      "Wir verwenden derzeit keine Analyse-, Werbe-, Profiling- oder Marketing-Cookies auf dieser Website.",
    choicesTitle: "Auswahl verwalten",
    choicesBody:
      "Sie koennen den Cookie-Hinweis mit der Schaltflaeche unten erneut oeffnen oder Cookies und lokalen Speicher in den Browser-Einstellungen loeschen.",
  },
  nl: {
    title: "Cookiebeleid",
    intro:
      "Deze pagina legt uit hoe Glamping Boat cookies en browseropslag gebruikt.",
    usedTitle: "Wat we gebruiken",
    usedBody:
      "We gebruiken alleen noodzakelijke opslag om de site te laten werken, je taal en cookiekeuze te onthouden, accountsessies te beveiligen en diensten te ondersteunen die je zelf gebruikt, zoals Google-login, Stripe checkout of de ingesloten YouTube-video.",
    noTrackingTitle: "Geen analyse- of advertentiecookies",
    noTrackingBody:
      "Wij gebruiken momenteel geen analyse-, advertentie-, profiling- of marketingcookies op deze site.",
    choicesTitle: "Uw keuze beheren",
    choicesBody:
      "U kunt de cookiebanner opnieuw openen met de knop hieronder, of cookies en lokale opslag wissen in uw browserinstellingen.",
  },
  ru: {
    title: "Cookie policy",
    intro:
      "This page explains how Glamping Boat uses cookies and browser storage.",
    usedTitle: "What we use",
    usedBody:
      "We only use necessary storage to run the site, remember your language and cookie choice, keep account sessions secure, and support services you choose to use, such as Google sign-in, Stripe checkout, or the embedded YouTube video.",
    noTrackingTitle: "No analytics or advertising cookies",
    noTrackingBody:
      "We do not currently use analytics, advertising, profiling, or marketing cookies on this site.",
    choicesTitle: "Managing your choice",
    choicesBody:
      "You can reopen the cookie banner with the button below, or clear cookies and local storage in your browser settings.",
  },
  es: {
    title: "Politica de cookies",
    intro:
      "Esta pagina explica como Glamping Boat utiliza cookies y almacenamiento del navegador.",
    usedTitle: "Lo que usamos",
    usedBody:
      "Solo usamos almacenamiento necesario para que el sitio funcione, recordar tu idioma y eleccion de cookies, proteger sesiones de cuenta y permitir servicios que decides usar, como Google, Stripe o el video de YouTube incrustado.",
    noTrackingTitle: "Sin cookies de analitica ni publicidad",
    noTrackingBody:
      "Actualmente no usamos cookies de analitica, publicidad, perfilado o marketing en este sitio.",
    choicesTitle: "Gestionar su eleccion",
    choicesBody:
      "Puede volver a abrir el banner de cookies con el boton inferior, o borrar cookies y almacenamiento local en la configuracion del navegador.",
  },
  it: {
    title: "Informativa sui cookie",
    intro:
      "Questa pagina spiega come Glamping Boat usa cookie e archiviazione del browser.",
    usedTitle: "Cosa usiamo",
    usedBody:
      "Usiamo solo archiviazione necessaria per far funzionare il sito, ricordare lingua e scelta sui cookie, proteggere le sessioni account e supportare i servizi che scegli di usare, come Google, Stripe o il video YouTube incorporato.",
    noTrackingTitle: "Nessun cookie di analisi o pubblicitario",
    noTrackingBody:
      "Attualmente non usiamo cookie di analisi, pubblicita, profilazione o marketing su questo sito.",
    choicesTitle: "Gestire la scelta",
    choicesBody:
      "Puoi riaprire il banner cookie con il pulsante qui sotto, oppure cancellare cookie e archiviazione locale dalle impostazioni del browser.",
  },
};

const cookiePolicyTitles: Record<Locale, string> = {
  en: cookiePolicyCopies.en.title,
  fr: cookiePolicyCopies.fr.title,
  de: cookiePolicyCopies.de.title,
  nl: cookiePolicyCopies.nl.title,
  ru: cookiePolicyCopies.ru.title,
  es: cookiePolicyCopies.es.title,
  it: cookiePolicyCopies.it.title,
};

function CookiePolicyContent({ locale }: { locale: Locale }) {
  const copy = cookiePolicyCopies[locale] ?? cookiePolicyCopies.en;

  return (
    <>
      <p>{copy.intro}</p>
      <h2>{copy.usedTitle}</h2>
      <p>{copy.usedBody}</p>
      <h2>{copy.noTrackingTitle}</h2>
      <p>{copy.noTrackingBody}</p>
      <h2>{copy.choicesTitle}</h2>
      <p>{copy.choicesBody}</p>
    </>
  );
}

const content: Record<LegalKind, Record<Locale, LegalItem>> = {
  legal: {
    en: {
      title: "Legal notices",
      body: (
        <>
          <h2>Les coches de Penchot - LcP</h2>
          <p>
            contact@glampingboat.fr
            <br />
            SAS Societe par Actions Simplifiee (simplified joint stock company)
            <br />
            Share capital of EUR 1,000.00
            <br />
            Registre du Commerce et des Societes de Rodez (Aveyron)
            <br />
            SIRET number 978 634 905
            <br />
            Head office: 14B rue de la Guiraldie, 12300 Boisse-Penchot, France
            <br />
            Jean-Francois Durel, president, +33 652 11 33 47,
            lescochesdepenchot@gmail.com
          </p>
          <h2>Website hosting</h2>
          <p>
            IONOS SARL
            <br />
            7 place de la Gare, BP 70109
            <br />
            57201 Sarreguemines Cedex, France
            <br />
            Phone: +33 (0) 970 808 911
            <br />
            Website: https://www.ionos.fr/
          </p>
          <h2>Commercial activities</h2>
          <p>
            Registre du Commerce et des Societes de Rodez (Aveyron)
            <br />
            SIRET number 978 634 905 SIREN 978 634 905 00019
            <br />
            intra-Community VAT number FR 04978634905
            <br />
            <strong>General terms and conditions of sale (GTS)</strong>
            <br />
            APE code 30.11Z
            <br />
            Construction and management of pleasure boats, mobile floating
            living structures and mini river bases
            <br />
            Unique manufacturer code LCP
          </p>
        </>
      ),
    },
    fr: {
      title: "Mentions légales",
      body: (
        <>
          <h2>Les coches de Penchot - LcP</h2>
          <p>
            contact@glampingboat.fr
            <br />
            SAS Société par Actions Simplifiée
            <br />
            Capital social de 1 000,00 EUR
            <br />
            Registre du commerce et des sociétés de Rodez (Aveyron)
            <br />
            Numéro SIRET 978 634 905
            <br />
            Siège social : 14B rue de la Guiraldie, 12300 Boisse-Penchot, France
            <br />
            Jean-François Durel, président, +33 652 11 33 47,
            lescochesdepenchot@gmail.com
          </p>
          <h2>Hébergement du site</h2>
          <p>
            IONOS SARL
            <br />
            7 place de la Gare, BP 70109
            <br />
            57201 Sarreguemines Cedex, France
            <br />
            Telephone: +33 (0) 970 808 911
            <br />
            Site web: https://www.ionos.fr/
          </p>
          <h2>Activités commerciales</h2>
          <p>
            Registre du commerce et des sociétés de Rodez (Aveyron)
            <br />
            Numéro SIRET 978 634 905 SIREN 978 634 905 00019
            <br />
            Numéro de TVA intracommunautaire FR 04978634905
            <br />
            <strong>Conditions générales de vente (CGV)</strong>
            <br />
            Code APE 30.11Z
            <br />
            Construction et gestion de bateaux de plaisance, d&apos;habitats
            flottants mobiles et de mini-bases fluviales
            <br />
            Code constructeur unique LCP
          </p>
        </>
      ),
    },
    de: {
      title: "Impressum",
      body: (
        <>
          <h2>Les coches de Penchot - LcP</h2>
          <p>
            contact@glampingboat.fr
            <br />
            SAS Societe par Actions Simplifiee (vereinfachte Aktiengesellschaft)
            <br />
            Stammkapital EUR 1,000.00
            <br />
            Handelsregister Rodez (Aveyron)
            <br />
            SIRET-Nummer 978 634 905
            <br />
            Sitz: 14B rue de la Guiraldie, 12300 Boisse-Penchot, Frankreich
            <br />
            Jean-Francois Durel, Praesident, +33 652 11 33 47,
            lescochesdepenchot@gmail.com
          </p>
          <h2>Website-Hosting</h2>
          <p>
            IONOS SARL
            <br />
            7 place de la Gare, BP 70109
            <br />
            57201 Sarreguemines Cedex, Frankreich
            <br />
            Telefon: +33 (0) 970 808 911
            <br />
            Website: https://www.ionos.fr/
          </p>
          <h2>Geschaeftstaetigkeiten</h2>
          <p>
            Handelsregister Rodez (Aveyron)
            <br />
            SIRET-Nummer 978 634 905 SIREN 978 634 905 00019
            <br />
            Umsatzsteuer-Identifikationsnummer FR 04978634905
            <br />
            <strong>Allgemeine Geschaeftsbedingungen (AGB)</strong>
            <br />
            APE-Code 30.11Z
            <br />
            Bau und Verwaltung von Freizeitbooten, mobilen schwimmenden
            Wohnstrukturen und Mini-Flussbasen
            <br />
            Eindeutiger Herstellercode LCP
          </p>
        </>
      ),
    },
    nl: {
      title: "Juridische vermeldingen",
      body: (
        <>
          <h2>Les coches de Penchot - LcP</h2>
          <p>
            contact@glampingboat.fr
            <br />
            SAS Societe par Actions Simplifiee (vereenvoudigde naamloze vennootschap)
            <br />
            Maatschappelijk kapitaal EUR 1,000.00
            <br />
            Handelsregister van Rodez (Aveyron)
            <br />
            SIRET-nummer 978 634 905
            <br />
            Maatschappelijke zetel: 14B rue de la Guiraldie, 12300
            Boisse-Penchot, Frankrijk
            <br />
            Jean-Francois Durel, president, +33 652 11 33 47,
            lescochesdepenchot@gmail.com
          </p>
          <h2>Websitehosting</h2>
          <p>
            IONOS SARL
            <br />
            7 place de la Gare, BP 70109
            <br />
            57201 Sarreguemines Cedex, Frankrijk
            <br />
            Telefoon: +33 (0) 970 808 911
            <br />
            Website: https://www.ionos.fr/
          </p>
          <h2>Commerciele activiteiten</h2>
          <p>
            Handelsregister van Rodez (Aveyron)
            <br />
            SIRET-nummer 978 634 905 SIREN 978 634 905 00019
            <br />
            intracommunautair btw-nummer FR 04978634905
            <br />
            <strong>Algemene verkoopvoorwaarden</strong>
            <br />
            APE-code 30.11Z
            <br />
            Bouw en beheer van pleziervaartuigen, mobiele drijvende
            woonstructuren en mini-rivierbasissen
            <br />
            Unieke fabrikantcode LCP
          </p>
        </>
      ),
    },
    ru: {
      title: "Правовая информация",
      body: (
        <>
          <h2>Les coches de Penchot - LcP</h2>
          <p>
            contact@glampingboat.fr
            <br />
            SAS Societe par Actions Simplifiee (упрощенное акционерное общество)
            <br />
            Уставный капитал EUR 1,000.00
            <br />
            Торговый реестр Rodez (Aveyron)
            <br />
            Номер SIRET 978 634 905
            <br />
            Юридический адрес: 14B rue de la Guiraldie, 12300
            Boisse-Penchot, France
            <br />
            Jean-Francois Durel, президент, +33 652 11 33 47,
            lescochesdepenchot@gmail.com
          </p>
          <h2>Хостинг сайта</h2>
          <p>
            IONOS SARL
            <br />
            7 place de la Gare, BP 70109
            <br />
            57201 Sarreguemines Cedex, France
            <br />
            Phone: +33 (0) 970 808 911
            <br />
            Website: https://www.ionos.fr/
          </p>
          <h2>Коммерческая деятельность</h2>
          <p>
            Торговый реестр Rodez (Aveyron)
            <br />
            Номер SIRET 978 634 905 SIREN 978 634 905 00019
            <br />
            Номер НДС ЕС FR 04978634905
            <br />
            <strong>Общие условия продажи</strong>
            <br />
            Код APE 30.11Z
            <br />
            Строительство и управление прогулочными судами, мобильными
            плавучими жилыми конструкциями и мини-речными базами
            <br />
            Уникальный код производителя LCP
          </p>
        </>
      ),
    },
    es: {
      title: "Aviso legal",
      body: (
        <>
          <h2>Les coches de Penchot - LcP</h2>
          <p>
            contact@glampingboat.fr
            <br />
            SAS Societe par Actions Simplifiee (sociedad por acciones simplificada)
            <br />
            Capital social de EUR 1,000.00
            <br />
            Registro Mercantil de Rodez (Aveyron)
            <br />
            Numero SIRET 978 634 905
            <br />
            Domicilio social: 14B rue de la Guiraldie, 12300
            Boisse-Penchot, Francia
            <br />
            Jean-Francois Durel, presidente, +33 652 11 33 47,
            lescochesdepenchot@gmail.com
          </p>
          <h2>Alojamiento web</h2>
          <p>
            IONOS SARL
            <br />
            7 place de la Gare, BP 70109
            <br />
            57201 Sarreguemines Cedex, Francia
            <br />
            Telefono: +33 (0) 970 808 911
            <br />
            Sitio web: https://www.ionos.fr/
          </p>
          <h2>Actividades comerciales</h2>
          <p>
            Registro Mercantil de Rodez (Aveyron)
            <br />
            Numero SIRET 978 634 905 SIREN 978 634 905 00019
            <br />
            Numero de IVA intracomunitario FR 04978634905
            <br />
            <strong>Condiciones generales de venta</strong>
            <br />
            Codigo APE 30.11Z
            <br />
            Construccion y gestion de embarcaciones de recreo, estructuras
            flotantes habitables moviles y mini bases fluviales
            <br />
            Codigo unico del fabricante LCP
          </p>
        </>
      ),
    },
    it: {
      title: "Note legali",
      body: (
        <>
          <h2>Les coches de Penchot - LcP</h2>
          <p>
            contact@glampingboat.fr
            <br />
            SAS Societe par Actions Simplifiee (societa per azioni semplificata)
            <br />
            Capitale sociale di EUR 1,000.00
            <br />
            Registro delle Imprese di Rodez (Aveyron)
            <br />
            Numero SIRET 978 634 905
            <br />
            Sede legale: 14B rue de la Guiraldie, 12300 Boisse-Penchot, Francia
            <br />
            Jean-Francois Durel, presidente, +33 652 11 33 47,
            lescochesdepenchot@gmail.com
          </p>
          <h2>Hosting del sito</h2>
          <p>
            IONOS SARL
            <br />
            7 place de la Gare, BP 70109
            <br />
            57201 Sarreguemines Cedex, Francia
            <br />
            Telefono: +33 (0) 970 808 911
            <br />
            Sito web: https://www.ionos.fr/
          </p>
          <h2>Attivita commerciali</h2>
          <p>
            Registro delle Imprese di Rodez (Aveyron)
            <br />
            Numero SIRET 978 634 905 SIREN 978 634 905 00019
            <br />
            Numero IVA intracomunitaria FR 04978634905
            <br />
            <strong>Condizioni generali di vendita</strong>
            <br />
            Codice APE 30.11Z
            <br />
            Costruzione e gestione di imbarcazioni da diporto, strutture
            abitative galleggianti mobili e mini basi fluviali
            <br />
            Codice univoco del produttore LCP
          </p>
        </>
      ),
    },
  },
  cookies: {
    en: { title: "Cookies policy", body: <CookiePolicyContent locale="en" /> },
    fr: { title: "Politique de cookies", body: <CookiePolicyContent locale="fr" /> },
    de: { title: "Cookie-Richtlinie", body: <CookiePolicyContent locale="de" /> },
    nl: { title: "Cookiebeleid", body: <CookiePolicyContent locale="nl" /> },
    ru: { title: "Cookie policy", body: <CookiePolicyContent locale="ru" /> },
    es: { title: "Politica de cookies", body: <CookiePolicyContent locale="es" /> },
    it: { title: "Informativa sui cookie", body: <CookiePolicyContent locale="it" /> },
  },
  terms: {
    en: {
      title: "Terms and conditions",
      body: <RentalTerms locale="en" />,
    },
    fr: {
      title: "Conditions generales",
      body: <RentalTerms locale="fr" />,
    },
    de: {
      title: "AGB",
      body: <RentalTerms locale="de" />,
    },
    nl: {
      title: "Voorwaarden",
      body: <RentalTerms locale="nl" />,
    },
    ru: {
      title: "Terms",
      body: <RentalTerms locale="ru" />,
    },
    es: {
      title: "Terminos y condiciones",
      body: <RentalTerms locale="es" />,
    },
    it: {
      title: "Termini e condizioni",
      body: <RentalTerms locale="it" />,
    },
  },
};

export default function LegalContent({ kind }: { kind: LegalKind }) {
  const { locale } = useLanguage();
  const item = content[kind][locale] ?? content[kind].en;
  const isLegal = kind === "legal";
  const isTerms = kind === "terms";
  const isCookies = kind === "cookies";
  const title = isCookies
    ? (cookiePolicyTitles[locale] ?? cookiePolicyTitles.en)
    : item.title;

  return (
    <main
      className={
        isLegal
          ? "max-w-[58rem] text-[var(--color-beige)] [&_h2]:mt-0 [&_h2]:mb-3 [&_h2]:text-[clamp(2rem,3.6vw,3.05rem)] [&_h2]:font-semibold [&_h2]:leading-[1.02] [&_p]:mb-10 [&_p]:max-w-[52rem] [&_p]:text-[clamp(1.05rem,1.7vw,1.35rem)] [&_p]:font-light [&_p]:leading-[1.2] [&_strong]:font-semibold"
          : isTerms
            ? "w-full max-w-[56rem] text-[var(--color-beige)]"
            : isCookies
              ? "w-full max-w-[58rem] text-[var(--color-beige)] [&_h1]:mb-8 [&_h1]:text-[clamp(2.45rem,5vw,4.5rem)] [&_h1]:font-semibold [&_h1]:leading-[0.98] [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[clamp(1.75rem,3.2vw,2.75rem)] [&_h2]:font-semibold [&_h2]:leading-[1.04] [&_p]:mb-7 [&_p]:max-w-[52rem] [&_p]:text-[clamp(1rem,1.5vw,1.22rem)] [&_p]:font-light [&_p]:leading-[1.35]"
          : "prose prose-invert max-w-3xl text-[var(--color-beige)] [&_h1]:text-[var(--color-beige)] [&_h2]:text-[var(--color-beige)]"
      }
    >
      {!isLegal && kind !== "terms" && <h1>{title}</h1>}
      {isCookies ? <CookiePolicyContent locale={locale} /> : item.body}
    </main>
  );
}
