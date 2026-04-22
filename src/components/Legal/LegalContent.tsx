"use client";

import { useLanguage } from "@/components/Language/LanguageContext";
import type { Locale } from "@/components/Language/dictionaries";

export type LegalKind = "legal" | "cookies" | "terms";

type LegalItem = {
  title: string;
  body: React.JSX.Element;
};

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
            name of host
            <br />
            company name
            <br />
            Address
            <br />
            telephone number
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
      title: "Mentions legales",
      body: (
        <>
          <h2>Les coches de Penchot - LcP</h2>
          <p>
            contact@glampingboat.fr
            <br />
            SAS Societe par Actions Simplifiee
            <br />
            Capital social de EUR 1,000.00
            <br />
            Registre du Commerce et des Societes de Rodez (Aveyron)
            <br />
            Numero SIRET 978 634 905
            <br />
            Siege social : 14B rue de la Guiraldie, 12300 Boisse-Penchot, France
            <br />
            Jean-Francois Durel, president, +33 652 11 33 47,
            lescochesdepenchot@gmail.com
          </p>
          <h2>Hebergement du site</h2>
          <p>
            nom de l&apos;hebergeur
            <br />
            raison sociale
            <br />
            adresse
            <br />
            numero de telephone
          </p>
          <h2>Activites commerciales</h2>
          <p>
            Registre du Commerce et des Societes de Rodez (Aveyron)
            <br />
            Numero SIRET 978 634 905 SIREN 978 634 905 00019
            <br />
            Numero de TVA intracommunautaire FR 04978634905
            <br />
            <strong>Conditions generales de vente (CGV)</strong>
            <br />
            Code APE 30.11Z
            <br />
            Construction et gestion de bateaux de plaisance, d&apos;habitats
            flottants mobiles et de mini bases fluviales
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
            Name des Hosters
            <br />
            Firmenname
            <br />
            Adresse
            <br />
            Telefonnummer
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
            naam van host
            <br />
            bedrijfsnaam
            <br />
            Adres
            <br />
            telefoonnummer
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
            название хостинга
            <br />
            название компании
            <br />
            адрес
            <br />
            телефон
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
            nombre del host
            <br />
            nombre de la empresa
            <br />
            direccion
            <br />
            numero de telefono
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
            nome dell&apos;host
            <br />
            ragione sociale
            <br />
            indirizzo
            <br />
            numero di telefono
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
    en: {
      title: "Cookies policy",
      body: (
        <>
          <p>
            Mockup cookies policy; adapt with your actual details for GDPR
            compliance.
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
    fr: {
      title: "Politique de cookies",
      body: (
        <>
          <p>
            Maquette de politique de cookies conforme au RGPD et au droit
            francais.
          </p>
          <h2>Responsable du traitement</h2>
          <p>[Nom/raison sociale], [adresse], contact: [email].</p>
          <h2>Cookies utilises</h2>
          <p>
            Indispensables, mesure d&apos;audience, confort & performance,
            marketing.
          </p>
        </>
      ),
    },
    de: {
      title: "Cookie-Richtlinie",
      body: (
        <>
          <p>
            Muster einer Cookie-Richtlinie. Bitte mit Ihren tatsaechlichen
            Angaben fuer DSGVO-Konformitaet anpassen.
          </p>
          <h2>Verantwortlicher</h2>
          <p>[Unternehmen], [Adresse], Kontakt: [E-Mail].</p>
          <h2>Verwendete Cookies</h2>
          <p>Notwendig, Analyse, Praeferenzen/Leistung, Marketing.</p>
        </>
      ),
    },
    nl: {
      title: "Cookiebeleid",
      body: (
        <>
          <p>
            Voorbeeld van een cookiebeleid. Pas dit aan met uw werkelijke
            gegevens voor AVG-naleving.
          </p>
          <h2>Verwerkingsverantwoordelijke</h2>
          <p>[Bedrijf], [adres], contact: [e-mail].</p>
          <h2>Gebruikte cookies</h2>
          <p>Noodzakelijk, analyse, voorkeuren/prestaties, marketing.</p>
        </>
      ),
    },
    ru: {
      title: "Политика cookie",
      body: (
        <>
          <p>
            Это шаблон политики cookie. Адаптируйте его под фактические данные
            для соответствия GDPR.
          </p>
          <h2>Оператор данных</h2>
          <p>[Компания], [адрес], контакт: [email].</p>
          <h2>Используемые cookie</h2>
          <p>Обязательные, аналитика, предпочтения/производительность, маркетинг.</p>
        </>
      ),
    },
    es: {
      title: "Politica de cookies",
      body: (
        <>
          <p>
            Modelo de politica de cookies. Adapte este texto con sus datos
            reales para cumplir con el RGPD.
          </p>
          <h2>Responsable del tratamiento</h2>
          <p>[Empresa], [direccion], contacto: [email].</p>
          <h2>Cookies utilizadas</h2>
          <p>Estrictamente necesarias, analitica, preferencias/rendimiento, marketing.</p>
        </>
      ),
    },
    it: {
      title: "Informativa sui cookie",
      body: (
        <>
          <p>
            Modello di informativa sui cookie. Adattarlo con i dati reali per
            la conformita al GDPR.
          </p>
          <h2>Titolare del trattamento</h2>
          <p>[Societa], [indirizzo], contatto: [email].</p>
          <h2>Cookie utilizzati</h2>
          <p>Necessari, analitici, preferenze/prestazioni, marketing.</p>
        </>
      ),
    },
  },
  terms: {
    en: {
      title: "Terms and conditions",
      body: (
        <>
          <p>
            English mockup of terms and conditions. Adapt to your business
            model: sales, rental, or services.
          </p>
          <h2>Purpose</h2>
          <p>
            Rules governing use of the website and the supply of
            services/products.
          </p>
        </>
      ),
    },
    fr: {
      title: "Conditions generales",
      body: (
        <>
          <p>
            Maquette de CGU/CGV. Adaptez selon vente, location ou prestations.
          </p>
          <h2>Objet</h2>
          <p>Regles d&apos;utilisation du site et des services/produits.</p>
        </>
      ),
    },
    de: {
      title: "AGB",
      body: (
        <>
          <p>
            Muster fuer allgemeine Geschaeftsbedingungen/Nutzungsbedingungen.
            Bitte auf Verkauf, Vermietung oder Dienstleistungen abstimmen.
          </p>
          <h2>Zweck</h2>
          <p>Regeln fuer die Nutzung der Website und das Angebot von Leistungen/Produkten.</p>
        </>
      ),
    },
    nl: {
      title: "Voorwaarden",
      body: (
        <>
          <p>
            Voorbeeld van algemene voorwaarden/gebruiksvoorwaarden. Pas deze
            aan uw verkoop, verhuur of diensten aan.
          </p>
          <h2>Doel</h2>
          <p>Regels voor het gebruik van de website en de levering van diensten/producten.</p>
        </>
      ),
    },
    ru: {
      title: "Условия",
      body: (
        <>
          <p>
            Шаблон условий использования/общих условий продажи. Адаптируйте его
            под продажи, аренду или услуги.
          </p>
          <h2>Предмет</h2>
          <p>Правила использования сайта и предоставления услуг/товаров.</p>
        </>
      ),
    },
    es: {
      title: "Terminos y condiciones",
      body: (
        <>
          <p>
            Modelo de terminos y condiciones. Adaptelo a su actividad
            comercial, alquiler o servicios.
          </p>
          <h2>Objeto</h2>
          <p>Normas que regulan el uso del sitio web y la prestacion de servicios/productos.</p>
        </>
      ),
    },
    it: {
      title: "Termini e condizioni",
      body: (
        <>
          <p>
            Modello di termini e condizioni. Adattarlo alla vostra attivita di
            vendita, noleggio o servizi.
          </p>
          <h2>Oggetto</h2>
          <p>Regole che disciplinano l&apos;uso del sito e la fornitura di servizi/prodotti.</p>
        </>
      ),
    },
  },
};

export default function LegalContent({ kind }: { kind: LegalKind }) {
  const { locale } = useLanguage();
  const item = content[kind][locale] ?? content[kind].en;
  const isLegal = kind === "legal";

  return (
    <main
      className={
        isLegal
          ? "max-w-[58rem] text-[var(--color-beige)] [&_h2]:mt-0 [&_h2]:mb-3 [&_h2]:text-[clamp(2rem,3.6vw,3.05rem)] [&_h2]:font-semibold [&_h2]:leading-[1.02] [&_p]:mb-10 [&_p]:max-w-[52rem] [&_p]:text-[clamp(1.05rem,1.7vw,1.35rem)] [&_p]:font-light [&_p]:leading-[1.2] [&_strong]:font-semibold"
          : "prose prose-invert max-w-3xl text-[var(--color-beige)] [&_h1]:text-[var(--color-beige)] [&_h2]:text-[var(--color-beige)]"
      }
    >
      {!isLegal && <h1>{item.title}</h1>}
      {item.body}
    </main>
  );
}
