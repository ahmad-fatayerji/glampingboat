import type { Locale } from "@/components/Language/dictionaries";

type TermsSubsection = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

type TermsSection = {
  heading: string;
  paragraphs?: string[];
  itemsIntro?: string;
  items?: string[];
  subsections?: TermsSubsection[];
};

type TermsDocument = {
  title: string;
  sections: TermsSection[];
};

const terms: Record<Locale, TermsDocument> = {
  en: {
    title: "General Terms and Conditions of Rental (GTCR) - Glamping Boat™",
    sections: [
      {
        heading: "1. Purpose",
        paragraphs: [
          "These General Terms and Conditions of Sale govern the reservation and rental of the Glamping Boat™, an electric accommodation boat operated by Les Coches de Penchot (LCP), which may be used without a boating licence.",
          "Any reservation implies full and unconditional acceptance of these Terms and Conditions.",
        ],
      },
      {
        heading: "2. Reservation and Payment",
        paragraphs: ["A reservation becomes final upon receipt of:"],
        items: [
          "a completed booking form;",
          "payment of a deposit equal to 50% of the total rental amount.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "The remaining balance must be paid no later than 15 days before the arrival date.",
              "Failure to pay the balance within the specified period may result in cancellation of the reservation without refund of any amounts already paid.",
            ],
          },
        ],
      },
      {
        heading: "3. Occupancy Conditions",
        paragraphs: [
          "The Glamping Boat™ is designed to accommodate a maximum of four (4) persons, including at least one responsible adult.",
          "The renter agrees to comply with the maximum occupancy limit and with all operating and safety instructions provided at check-in.",
          "Navigation is reserved for persons capable of carrying out the normal manoeuvres of a leisure boat and complying with inland waterway navigation regulations.",
        ],
      },
      {
        heading: "4. Boat Handover",
        paragraphs: [
          "Before departure, the renter will receive an introduction to the boat, its equipment and applicable safety rules.",
          "A security deposit is required before boarding. The amount will be communicated at the time of booking.",
          "The renter acknowledges that the boat has been received in good working order and in a clean condition.",
        ],
      },
      {
        heading: "5. Use of the Glamping Boat™",
        paragraphs: [
          "The Glamping Boat™ is intended exclusively for tourism and leisure purposes.",
          "The following are strictly prohibited:",
        ],
        items: [
          "subletting the boat;",
          "lending the boat to third parties;",
          "any unauthorised professional or commercial use;",
          "intentional damage to equipment;",
          "exceeding the maximum authorised occupancy.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "The boat may only be operated within the navigation areas authorised by the owner.",
            ],
          },
        ],
      },
      {
        heading: "6. Environmental Protection",
        paragraphs: [
          "The Glamping Boat™ is equipped with an autonomous biological water-treatment system and facilities designed to minimise environmental impact.",
          "Occupants undertake to:",
        ],
        items: [
          "limit water consumption;",
          "use only the cleaning and hygiene products provided on board;",
          "respect the natural environment and local wildlife;",
          "refrain from disposing of waste into the natural environment.",
        ],
      },
      {
        heading: "7. Liability",
        paragraphs: [
          "The renter is responsible for the boat, its equipment and all persons on board throughout the rental period.",
          "Any damage, loss of equipment, breakage or improper use may be charged to the renter and deducted from the security deposit.",
          "The owner shall not be held liable for any loss, theft or damage relating to the personal belongings of occupants.",
        ],
      },
      {
        heading: "8. Insurance",
        paragraphs: [
          "The boat is covered by liability and damage insurance in accordance with applicable regulations.",
          "The renter remains responsible for:",
        ],
        items: [
          "any applicable insurance excess or deductible;",
          "damage resulting from intentional misconduct or gross negligence;",
          "violations of laws or regulations committed during the rental period;",
          "loss or damage to equipment not covered by insurance.",
        ],
      },
      {
        heading: "9. Cancellation",
        subsections: [
          {
            heading: "Cancellation by the renter",
            items: [
              "More than 60 days before arrival: deposit retained.",
              "Between 60 and 15 days before arrival: 50% of the total rental amount payable.",
              "Less than 15 days before arrival or in case of no-show: 100% of the total rental amount payable.",
            ],
            paragraphs: ["All cancellations must be notified in writing."],
          },
          {
            heading: "Cancellation by the owner",
            paragraphs: [
              "In the event of exceptional circumstances, force majeure, or technical impossibility preventing the rental from taking place, the owner may offer a postponement of the stay or refund the amounts paid, without any further compensation.",
            ],
          },
        ],
      },
      {
        heading: "10. Navigation Conditions",
        paragraphs: ["Navigation may be restricted, suspended or prohibited due to:"],
        items: [
          "weather conditions;",
          "water levels;",
          "administrative restrictions;",
          "maintenance works or incidents affecting the waterway;",
          "any situation presenting a risk to occupants or equipment.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Such circumstances shall not give rise to any claim for compensation.",
            ],
          },
        ],
      },
      {
        heading: "11. Return of the Boat",
        paragraphs: [
          "The boat must be returned on the agreed date, at the agreed time and location.",
          "It must be returned in a reasonably clean condition and with all equipment supplied at departure.",
          "Any delay, exceptional cleaning requirement or replacement of missing equipment may be charged to the renter.",
        ],
      },
      {
        heading: "12. Complaints and Disputes",
        paragraphs: [
          "Any complaint relating to the stay must be submitted to the owner within thirty (30) days following the end of the rental period.",
          "These Terms and Conditions are governed by French law.",
          "In the event of a dispute, the parties shall first seek an amicable settlement before initiating legal proceedings.",
        ],
      },
      {
        heading: "13. Personal Data",
        paragraphs: [
          "Information collected during the booking process is used solely for managing the stay and maintaining the commercial relationship with the customer.",
          "In accordance with applicable data protection regulations, customers have the right to access, rectify and delete their personal data.",
        ],
      },
      {
        heading: "14. Security Deposit",
        paragraphs: [
          "A security deposit, the amount of which is communicated at the time of booking, is required before the boat is handed over.",
          "The security deposit covers, in particular:",
        ],
        items: [
          "damage caused to the boat or its equipment;",
          "loss or deterioration of onboard equipment;",
          "exceptional cleaning costs;",
          "late return of the boat;",
          "any outstanding amounts owed to the owner.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "The deposit will be refunded after the return inspection, less any amounts due from the renter.",
              "If the cost of damage exceeds the amount of the deposit, the renter shall remain liable for the balance.",
            ],
          },
        ],
      },
      {
        heading: "15. Check-in and Check-out Times",
        paragraphs: ["Unless otherwise specified at the time of booking:"],
        items: [
          "check-in is from 5:00 p.m.;",
          "check-out must take place before 11:00 a.m. on the departure day.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "The renter must comply with the agreed schedule to allow for reception, inspection and preparation procedures.",
              "Any significant delay must be reported to the owner as soon as possible.",
            ],
          },
        ],
      },
      {
        heading: "16. Accessibility and Special Circumstances",
        paragraphs: [
          "The Glamping Boat™ has been designed to facilitate access for persons with reduced mobility and guests attending thermal spa treatments.",
          "However, due to the nature of the river environment and navigation constraints, certain limitations may apply.",
          "Guests with specific requirements are encouraged to contact the owner before booking in order to verify the suitability of the boat and, where necessary, arrange appropriate accommodation conditions.",
        ],
      },
      {
        heading: "17. Consumer Mediation",
        paragraphs: [
          "In accordance with the French Consumer Code, customers have the right to use a consumer mediation service free of charge in order to seek an amicable resolution of any dispute.",
          "After submitting a written complaint to the owner and in the absence of a satisfactory response within sixty (60) days, the customer may refer the matter to the designated consumer mediator, whose contact details are available upon request or on the operator's website.",
          "Failing an amicable resolution, any dispute shall fall under the jurisdiction of the competent French courts.",
        ],
      },
    ],
  },
  fr: {
    title: "Conditions générales de vente - Location Glamping Boat™",
    sections: [
      {
        heading: "1. Objet",
        paragraphs: [
          "Les présentes Conditions Générales de Vente régissent la réservation et la location du Glamping Boat™, bateau-hébergement électrique sans permis exploité par Les Coches de Penchot (LCP).",
          "Toute réservation implique l'acceptation sans réserve des présentes conditions.",
        ],
      },
      {
        heading: "2. Réservation et paiement",
        paragraphs: ["La réservation devient définitive à réception :"],
        items: [
          "du formulaire de réservation complété ;",
          "du paiement de l'acompte correspondant à 50 % du montant total du séjour.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Le solde est exigible au plus tard 15 jours avant la date d'arrivée.",
              "En cas de non-paiement du solde dans les délais, le loueur se réserve le droit d'annuler la réservation sans remboursement des sommes déjà versées.",
            ],
          },
        ],
      },
      {
        heading: "3. Conditions d'occupation",
        paragraphs: [
          "Le Glamping Boat™ est conçu pour accueillir au maximum 4 personnes, dont au moins un adulte majeur responsable.",
          "Le locataire s'engage à respecter la capacité maximale autorisée ainsi que les consignes d'utilisation et de sécurité remises lors de la prise en charge.",
          "La navigation est réservée à des personnes aptes à assurer les manœuvres courantes d'un bateau de plaisance et à respecter les règles de navigation intérieure.",
        ],
      },
      {
        heading: "4. Prise en charge du bateau",
        paragraphs: [
          "Avant le départ, le locataire reçoit une présentation du bateau, de ses équipements et des règles de sécurité.",
          "Une caution est demandée avant l'embarquement. Son montant est communiqué lors de la réservation.",
          "Le locataire reconnaît avoir pris possession du bateau en bon état de fonctionnement et de propreté.",
        ],
      },
      {
        heading: "5. Utilisation du Glamping Boat™",
        paragraphs: [
          "Le Glamping Boat™ est destiné exclusivement à une utilisation touristique et de loisirs.",
          "Sont notamment interdits :",
        ],
        items: [
          "la sous-location ;",
          "le prêt à des tiers ;",
          "toute utilisation professionnelle ou commerciale non autorisée ;",
          "toute dégradation volontaire des équipements ;",
          "le dépassement de la capacité maximale autorisée.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Le bateau ne peut être utilisé que dans les zones de navigation autorisées par le loueur.",
            ],
          },
        ],
      },
      {
        heading: "6. Respect de l'environnement",
        paragraphs: [
          "Le Glamping Boat™ est équipé d'un système autonome de traitement biologique de l'eau et d'équipements conçus pour limiter son impact environnemental.",
          "Les occupants s'engagent à :",
        ],
        items: [
          "limiter leur consommation d'eau ;",
          "utiliser exclusivement les produits d'entretien et d'hygiène fournis à bord ;",
          "respecter les milieux naturels et la faune environnante ;",
          "ne rejeter aucun déchet dans le milieu naturel.",
        ],
      },
      {
        heading: "7. Responsabilité",
        paragraphs: [
          "Le locataire est responsable du bateau, de ses équipements et des personnes embarquées pendant toute la durée de la location.",
          "Toute dégradation, perte d'équipement, casse ou utilisation non conforme pourra être facturée au locataire et retenue sur la caution.",
          "Le loueur ne saurait être tenu responsable des pertes, vols ou dommages concernant les effets personnels des occupants.",
        ],
      },
      {
        heading: "8. Assurance",
        paragraphs: [
          "Le bateau est couvert par une assurance responsabilité civile et dommages conformément à la réglementation en vigueur.",
          "Restent à la charge du locataire :",
        ],
        items: [
          "les franchises applicables ;",
          "les dommages résultant d'une faute intentionnelle ou d'une négligence grave ;",
          "les infractions commises durant la location ;",
          "les pertes ou détériorations d'équipements non couvertes par l'assurance.",
        ],
      },
      {
        heading: "9. Annulation",
        subsections: [
          {
            heading: "Annulation par le locataire",
            items: [
              "Plus de 60 jours avant l'arrivée : retenue de l'acompte.",
              "Entre 60 et 15 jours avant l'arrivée : 50 % du montant du séjour.",
              "Moins de 15 jours avant l'arrivée ou non-présentation : 100 % du montant du séjour.",
            ],
            paragraphs: ["Toute annulation doit être notifiée par écrit."],
          },
          {
            heading: "Annulation par le loueur",
            paragraphs: [
              "En cas d'événement exceptionnel, de force majeure ou d'impossibilité technique rendant la location impossible, le loueur pourra proposer un report de séjour ou rembourser les sommes versées, sans autre indemnité.",
            ],
          },
        ],
      },
      {
        heading: "10. Conditions de navigation",
        paragraphs: ["La navigation peut être limitée, suspendue ou interdite en raison :"],
        items: [
          "des conditions météorologiques ;",
          "du niveau des eaux ;",
          "d'arrêtés administratifs ;",
          "de travaux ou incidents sur la voie navigable ;",
          "de toute situation présentant un risque pour les occupants ou le matériel.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Ces circonstances ne pourront donner lieu à aucune demande d'indemnisation.",
            ],
          },
        ],
      },
      {
        heading: "11. Restitution du bateau",
        paragraphs: [
          "Le bateau doit être restitué à la date, à l'heure et au lieu convenus.",
          "Il devra être rendu dans un état normal de propreté et avec l'ensemble des équipements remis au départ.",
          "Tout retard, nettoyage exceptionnel ou remplacement de matériel manquant pourra être facturé.",
        ],
      },
      {
        heading: "12. Réclamations et litiges",
        paragraphs: [
          "Toute réclamation relative au séjour devra être adressée au loueur dans un délai de 30 jours suivant la fin de la location.",
          "Les présentes conditions sont soumises au droit français.",
          "En cas de litige, les parties rechercheront en priorité une solution amiable avant toute action judiciaire.",
        ],
      },
      {
        heading: "13. Données personnelles",
        paragraphs: [
          "Les informations recueillies lors de la réservation sont utilisées exclusivement pour la gestion du séjour et la relation commerciale avec le client.",
          "Conformément à la réglementation en vigueur, chaque client dispose d'un droit d'accès, de rectification et de suppression de ses données personnelles.",
        ],
      },
      {
        heading: "14. Caution",
        paragraphs: [
          "Une caution d'un montant communiqué lors de la réservation est exigée avant la remise du bateau.",
          "Cette caution garantit notamment :",
        ],
        items: [
          "les dommages causés au bateau ou à ses équipements ;",
          "la perte ou la détérioration du matériel embarqué ;",
          "les frais de nettoyage exceptionnel ;",
          "les retards de restitution ;",
          "toute somme restant due au loueur.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "La caution est restituée après l'état des lieux de retour, déduction faite, le cas échéant, des frais restant à la charge du locataire.",
              "Si le montant des dommages excède celui de la caution, le locataire reste tenu du paiement du solde correspondant.",
            ],
          },
        ],
      },
      {
        heading: "15. Horaires d'arrivée et de départ",
        paragraphs: ["Sauf disposition particulière communiquée lors de la réservation :"],
        items: [
          "les arrivées sont prévues à partir de 17h00 ;",
          "les départs doivent intervenir avant 11h00 le jour de fin de séjour.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Le locataire est tenu de respecter les horaires convenus afin de permettre les opérations d'accueil, de contrôle et de préparation du bateau.",
              "Tout retard significatif devra être signalé dans les meilleurs délais au loueur.",
            ],
          },
        ],
      },
      {
        heading: "16. Accessibilité et situations particulières",
        paragraphs: [
          "Le Glamping Boat™ a été conçu afin de faciliter l'accueil de personnes à mobilité réduite ou suivant une cure thermale.",
          "Toutefois, en raison de l'environnement fluvial et des contraintes liées à la navigation, certaines limitations peuvent subsister.",
          "Les personnes concernées sont invitées à contacter le loueur avant toute réservation afin de vérifier l'adéquation du bateau à leurs besoins spécifiques et d'organiser, si nécessaire, les conditions d'accueil les plus adaptées.",
        ],
      },
      {
        heading: "17. Médiation de la consommation",
        paragraphs: [
          "Conformément aux dispositions du Code de la consommation, le client a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige.",
          "Après avoir adressé une réclamation écrite au loueur et en l'absence de réponse satisfaisante dans un délai de 60 jours, le client pourra saisir le médiateur compétent dont les coordonnées seront communiquées sur simple demande ou figurent sur le site internet de l'exploitant.",
          "À défaut de résolution amiable, le litige sera soumis aux juridictions françaises compétentes.",
        ],
      },
    ],
  },
  de: {
    title: "Allgemeine Mietbedingungen - Glamping Boat™",
    sections: [
      {
        heading: "1. Gegenstand",
        paragraphs: [
          "Diese Allgemeinen Verkaufs- und Mietbedingungen regeln die Reservierung und Vermietung des Glamping Boat™, eines führerscheinfreien elektrischen Unterkunftsboots, das von Les Coches de Penchot (LCP) betrieben wird.",
          "Jede Reservierung setzt die vorbehaltlose Annahme dieser Bedingungen voraus.",
        ],
      },
      {
        heading: "2. Reservierung und Zahlung",
        paragraphs: ["Die Reservierung wird endgültig nach Eingang:"],
        items: [
          "des vollständig ausgefüllten Reservierungsformulars;",
          "der Anzahlung in Höhe von 50 % des Gesamtbetrags des Aufenthalts.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Der Restbetrag ist spätestens 15 Tage vor dem Anreisedatum fällig.",
              "Bei nicht fristgerechter Zahlung des Restbetrags behält sich der Vermieter vor, die Reservierung ohne Erstattung bereits gezahlter Beträge zu stornieren.",
            ],
          },
        ],
      },
      {
        heading: "3. Belegungsbedingungen",
        paragraphs: [
          "Das Glamping Boat™ ist für maximal 4 Personen ausgelegt, darunter mindestens ein verantwortlicher volljähriger Erwachsener.",
          "Der Mieter verpflichtet sich, die zulässige Höchstbelegung sowie die bei der Übergabe ausgehändigten Nutzungs- und Sicherheitshinweise einzuhalten.",
          "Die Navigation ist Personen vorbehalten, die die üblichen Manöver eines Freizeitboots ausführen und die Regeln der Binnenschifffahrt einhalten können.",
        ],
      },
      {
        heading: "4. Übergabe des Boots",
        paragraphs: [
          "Vor der Abfahrt erhält der Mieter eine Einweisung in das Boot, seine Ausstattung und die Sicherheitsregeln.",
          "Vor dem Einschiffen ist eine Kaution zu hinterlegen. Deren Höhe wird bei der Reservierung mitgeteilt.",
          "Der Mieter bestätigt, das Boot in funktionsfähigem und sauberem Zustand übernommen zu haben.",
        ],
      },
      {
        heading: "5. Nutzung des Glamping Boat™",
        paragraphs: [
          "Das Glamping Boat™ ist ausschließlich für touristische und freizeitbezogene Zwecke bestimmt.",
          "Insbesondere ist untersagt:",
        ],
        items: [
          "die Untervermietung;",
          "die Überlassung an Dritte;",
          "jede nicht genehmigte berufliche oder kommerzielle Nutzung;",
          "jede vorsätzliche Beschädigung der Ausstattung;",
          "die Überschreitung der zulässigen Höchstbelegung.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Das Boot darf nur in den vom Vermieter zugelassenen Navigationsbereichen genutzt werden.",
            ],
          },
        ],
      },
      {
        heading: "6. Umweltschutz",
        paragraphs: [
          "Das Glamping Boat™ ist mit einem autonomen biologischen Wasseraufbereitungssystem und Einrichtungen ausgestattet, die seine Umweltbelastung begrenzen.",
          "Die Gäste verpflichten sich:",
        ],
        items: [
          "ihren Wasserverbrauch zu begrenzen;",
          "ausschließlich die an Bord bereitgestellten Reinigungs- und Hygieneprodukte zu verwenden;",
          "Naturgebiete und die umliegende Tierwelt zu respektieren;",
          "keine Abfälle in die natürliche Umgebung einzuleiten oder zu entsorgen.",
        ],
      },
      {
        heading: "7. Haftung",
        paragraphs: [
          "Der Mieter ist während der gesamten Mietdauer für das Boot, seine Ausstattung und die an Bord befindlichen Personen verantwortlich.",
          "Jede Beschädigung, jeder Ausrüstungsverlust, Bruch oder nicht vertragsgemäße Gebrauch kann dem Mieter in Rechnung gestellt und von der Kaution abgezogen werden.",
          "Der Vermieter haftet nicht für Verlust, Diebstahl oder Schäden an persönlichen Gegenständen der Gäste.",
        ],
      },
      {
        heading: "8. Versicherung",
        paragraphs: [
          "Das Boot ist gemäß den geltenden Vorschriften haftpflicht- und schadensversichert.",
          "Zu Lasten des Mieters bleiben:",
        ],
        items: [
          "anwendbare Selbstbehalte;",
          "Schäden infolge vorsätzlichen Fehlverhaltens oder grober Fahrlässigkeit;",
          "während der Miete begangene Verstöße gegen Gesetze oder Vorschriften;",
          "Verlust oder Beschädigung von Ausrüstung, die nicht von der Versicherung gedeckt ist.",
        ],
      },
      {
        heading: "9. Stornierung",
        subsections: [
          {
            heading: "Stornierung durch den Mieter",
            items: [
              "Mehr als 60 Tage vor Anreise: Einbehalt der Anzahlung.",
              "Zwischen 60 und 15 Tagen vor Anreise: 50 % des Aufenthaltsbetrags.",
              "Weniger als 15 Tage vor Anreise oder Nichterscheinen: 100 % des Aufenthaltsbetrags.",
            ],
            paragraphs: ["Jede Stornierung muss schriftlich mitgeteilt werden."],
          },
          {
            heading: "Stornierung durch den Vermieter",
            paragraphs: [
              "Bei außergewöhnlichen Ereignissen, höherer Gewalt oder technischer Unmöglichkeit, die die Vermietung verhindert, kann der Vermieter eine Verschiebung des Aufenthalts anbieten oder die gezahlten Beträge ohne weitere Entschädigung erstatten.",
            ],
          },
        ],
      },
      {
        heading: "10. Navigationsbedingungen",
        paragraphs: ["Die Navigation kann eingeschränkt, ausgesetzt oder untersagt werden wegen:"],
        items: [
          "Wetterbedingungen;",
          "Wasserständen;",
          "behördlichen Anordnungen;",
          "Arbeiten oder Zwischenfällen auf der Wasserstraße;",
          "jeder Situation, die ein Risiko für Gäste oder Material darstellt.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Diese Umstände begründen keinen Anspruch auf Entschädigung.",
            ],
          },
        ],
      },
      {
        heading: "11. Rückgabe des Boots",
        paragraphs: [
          "Das Boot ist am vereinbarten Datum, zur vereinbarten Uhrzeit und am vereinbarten Ort zurückzugeben.",
          "Es ist in normal sauberem Zustand und mit sämtlicher bei der Abfahrt übergebener Ausstattung zurückzugeben.",
          "Verspätung, außergewöhnliche Reinigung oder Ersatz fehlenden Materials können berechnet werden.",
        ],
      },
      {
        heading: "12. Beschwerden und Streitigkeiten",
        paragraphs: [
          "Jede Beschwerde im Zusammenhang mit dem Aufenthalt ist dem Vermieter innerhalb von 30 Tagen nach Ende der Miete zu übermitteln.",
          "Diese Bedingungen unterliegen französischem Recht.",
          "Im Streitfall bemühen sich die Parteien vorrangig um eine gütliche Lösung, bevor gerichtliche Schritte eingeleitet werden.",
        ],
      },
      {
        heading: "13. Personenbezogene Daten",
        paragraphs: [
          "Die bei der Reservierung erhobenen Informationen werden ausschließlich zur Verwaltung des Aufenthalts und der Geschäftsbeziehung mit dem Kunden verwendet.",
          "Gemäß den geltenden Datenschutzvorschriften hat jeder Kunde das Recht auf Auskunft, Berichtigung und Löschung seiner personenbezogenen Daten.",
        ],
      },
      {
        heading: "14. Kaution",
        paragraphs: [
          "Vor Übergabe des Boots ist eine Kaution in der bei der Reservierung mitgeteilten Höhe zu leisten.",
          "Diese Kaution deckt insbesondere:",
        ],
        items: [
          "Schäden am Boot oder seiner Ausstattung;",
          "Verlust oder Beschädigung des Bordmaterials;",
          "Kosten außergewöhnlicher Reinigung;",
          "verspätete Rückgabe;",
          "alle dem Vermieter noch geschuldeten Beträge.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Die Kaution wird nach der Rückgabeinspektion abzüglich gegebenenfalls vom Mieter zu tragender Kosten erstattet.",
              "Übersteigt die Schadenshöhe die Kaution, bleibt der Mieter zur Zahlung des entsprechenden Restbetrags verpflichtet.",
            ],
          },
        ],
      },
      {
        heading: "15. Anreise- und Abreisezeiten",
        paragraphs: ["Sofern bei der Reservierung nichts anderes mitgeteilt wird:"],
        items: [
          "Anreisen sind ab 17:00 Uhr vorgesehen;",
          "Abreisen müssen am Abreisetag vor 11:00 Uhr erfolgen.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Der Mieter muss die vereinbarten Zeiten einhalten, damit Empfang, Kontrolle und Vorbereitung des Boots durchgeführt werden können.",
              "Jede erhebliche Verspätung ist dem Vermieter schnellstmöglich mitzuteilen.",
            ],
          },
        ],
      },
      {
        heading: "16. Zugänglichkeit und besondere Umstände",
        paragraphs: [
          "Das Glamping Boat™ wurde so konzipiert, dass es den Empfang von Personen mit eingeschränkter Mobilität oder Gästen während einer Kur erleichtert.",
          "Aufgrund der Flussumgebung und der mit der Navigation verbundenen Einschränkungen können jedoch bestimmte Grenzen bestehen.",
          "Betroffene Personen werden gebeten, den Vermieter vor jeder Reservierung zu kontaktieren, um zu prüfen, ob das Boot ihren besonderen Bedürfnissen entspricht, und gegebenenfalls geeignete Aufnahmebedingungen zu organisieren.",
        ],
      },
      {
        heading: "17. Verbrauchermediation",
        paragraphs: [
          "Gemäß den Bestimmungen des französischen Verbrauchergesetzbuchs hat der Kunde das Recht, kostenlos einen Verbrauchermediator zur gütlichen Beilegung einer Streitigkeit anzurufen.",
          "Nach einer schriftlichen Beschwerde beim Vermieter und ohne zufriedenstellende Antwort innerhalb von 60 Tagen kann der Kunde den zuständigen Mediator anrufen, dessen Kontaktdaten auf einfache Anfrage mitgeteilt werden oder auf der Website des Betreibers erscheinen.",
          "Kommt keine gütliche Lösung zustande, unterliegt die Streitigkeit den zuständigen französischen Gerichten.",
        ],
      },
    ],
  },
  nl: {
    title: "Algemene huurvoorwaarden - Glamping Boat™",
    sections: [
      {
        heading: "1. Doel",
        paragraphs: [
          "Deze Algemene Verkoop- en Huurvoorwaarden regelen de reservering en verhuur van de Glamping Boat™, een elektrisch accommodatievaartuig zonder vaarbewijs, geëxploiteerd door Les Coches de Penchot (LCP).",
          "Elke reservering houdt de onvoorwaardelijke aanvaarding van deze voorwaarden in.",
        ],
      },
      {
        heading: "2. Reservering en betaling",
        paragraphs: ["De reservering wordt definitief na ontvangst van:"],
        items: [
          "het ingevulde reserveringsformulier;",
          "betaling van een aanbetaling van 50% van het totale bedrag van het verblijf.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Het saldo moet uiterlijk 15 dagen vóór de aankomstdatum worden betaald.",
              "Bij niet-tijdige betaling van het saldo behoudt de verhuurder zich het recht voor de reservering te annuleren zonder terugbetaling van reeds betaalde bedragen.",
            ],
          },
        ],
      },
      {
        heading: "3. Bezettingsvoorwaarden",
        paragraphs: [
          "De Glamping Boat™ is ontworpen voor maximaal 4 personen, waaronder ten minste één verantwoordelijke meerderjarige volwassene.",
          "De huurder verbindt zich ertoe de maximale toegestane capaciteit en de bij overdracht verstrekte gebruiks- en veiligheidsinstructies na te leven.",
          "Navigatie is voorbehouden aan personen die de normale manoeuvres van een pleziervaartuig kunnen uitvoeren en de regels voor binnenvaart naleven.",
        ],
      },
      {
        heading: "4. Overdracht van de boot",
        paragraphs: [
          "Voor vertrek krijgt de huurder een uitleg over de boot, de uitrusting en de veiligheidsregels.",
          "Voor inscheping wordt een borg gevraagd. Het bedrag wordt bij de reservering meegedeeld.",
          "De huurder erkent de boot in goede werkende en schone staat te hebben ontvangen.",
        ],
      },
      {
        heading: "5. Gebruik van de Glamping Boat™",
        paragraphs: [
          "De Glamping Boat™ is uitsluitend bestemd voor toeristisch en recreatief gebruik.",
          "Met name zijn verboden:",
        ],
        items: [
          "onderverhuur;",
          "uitlening aan derden;",
          "elk niet-toegestaan professioneel of commercieel gebruik;",
          "opzettelijke beschadiging van de uitrusting;",
          "overschrijding van de maximaal toegestane capaciteit.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "De boot mag alleen worden gebruikt in de vaargebieden die door de verhuurder zijn toegestaan.",
            ],
          },
        ],
      },
      {
        heading: "6. Milieubescherming",
        paragraphs: [
          "De Glamping Boat™ is uitgerust met een autonoom biologisch waterbehandelingssysteem en voorzieningen die de milieubelasting beperken.",
          "De opvarenden verbinden zich ertoe:",
        ],
        items: [
          "hun waterverbruik te beperken;",
          "uitsluitend de aan boord verstrekte schoonmaak- en hygiëneproducten te gebruiken;",
          "natuurgebieden en omliggende fauna te respecteren;",
          "geen afval in de natuurlijke omgeving te lozen of achter te laten.",
        ],
      },
      {
        heading: "7. Aansprakelijkheid",
        paragraphs: [
          "De huurder is gedurende de volledige huurperiode verantwoordelijk voor de boot, de uitrusting en alle personen aan boord.",
          "Elke beschadiging, verlies van uitrusting, breuk of niet-conform gebruik kan aan de huurder worden gefactureerd en op de borg worden ingehouden.",
          "De verhuurder is niet aansprakelijk voor verlies, diefstal of schade met betrekking tot persoonlijke bezittingen van de opvarenden.",
        ],
      },
      {
        heading: "8. Verzekering",
        paragraphs: [
          "De boot is gedekt door aansprakelijkheids- en schadeverzekering overeenkomstig de geldende regelgeving.",
          "Voor rekening van de huurder blijven:",
        ],
        items: [
          "toepasselijke eigen risico's;",
          "schade als gevolg van opzettelijke fout of grove nalatigheid;",
          "overtredingen van wet- of regelgeving tijdens de huurperiode;",
          "verlies of beschadiging van uitrusting die niet door de verzekering wordt gedekt.",
        ],
      },
      {
        heading: "9. Annulering",
        subsections: [
          {
            heading: "Annulering door de huurder",
            items: [
              "Meer dan 60 dagen vóór aankomst: inhouding van de aanbetaling.",
              "Tussen 60 en 15 dagen vóór aankomst: 50% van het bedrag van het verblijf.",
              "Minder dan 15 dagen vóór aankomst of no-show: 100% van het bedrag van het verblijf.",
            ],
            paragraphs: ["Elke annulering moet schriftelijk worden meegedeeld."],
          },
          {
            heading: "Annulering door de verhuurder",
            paragraphs: [
              "Bij een uitzonderlijke gebeurtenis, overmacht of technische onmogelijkheid waardoor de verhuur niet kan plaatsvinden, kan de verhuurder een uitstel van het verblijf voorstellen of de betaalde bedragen terugbetalen, zonder verdere vergoeding.",
            ],
          },
        ],
      },
      {
        heading: "10. Navigatievoorwaarden",
        paragraphs: ["Navigatie kan worden beperkt, opgeschort of verboden wegens:"],
        items: [
          "weersomstandigheden;",
          "waterstanden;",
          "administratieve besluiten;",
          "werkzaamheden of incidenten op de vaarweg;",
          "elke situatie die een risico vormt voor opvarenden of materieel.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Deze omstandigheden kunnen geen aanleiding geven tot enige schadevergoeding.",
            ],
          },
        ],
      },
      {
        heading: "11. Teruggave van de boot",
        paragraphs: [
          "De boot moet op de overeengekomen datum, tijd en plaats worden teruggegeven.",
          "De boot moet in normale schone staat en met alle bij vertrek verstrekte uitrusting worden teruggegeven.",
          "Vertraging, uitzonderlijke schoonmaak of vervanging van ontbrekend materiaal kan worden gefactureerd.",
        ],
      },
      {
        heading: "12. Klachten en geschillen",
        paragraphs: [
          "Elke klacht met betrekking tot het verblijf moet binnen 30 dagen na afloop van de huur aan de verhuurder worden gericht.",
          "Deze voorwaarden vallen onder Frans recht.",
          "Bij een geschil zoeken partijen eerst naar een minnelijke oplossing voordat gerechtelijke stappen worden gezet.",
        ],
      },
      {
        heading: "13. Persoonsgegevens",
        paragraphs: [
          "De bij de reservering verzamelde informatie wordt uitsluitend gebruikt voor het beheer van het verblijf en de commerciële relatie met de klant.",
          "Overeenkomstig de geldende regels inzake gegevensbescherming heeft elke klant recht op toegang, correctie en verwijdering van zijn of haar persoonsgegevens.",
        ],
      },
      {
        heading: "14. Borg",
        paragraphs: [
          "Voor de overdracht van de boot is een borg vereist waarvan het bedrag bij de reservering wordt meegedeeld.",
          "Deze borg dekt met name:",
        ],
        items: [
          "schade aan de boot of de uitrusting;",
          "verlies of beschadiging van boordmateriaal;",
          "kosten voor uitzonderlijke schoonmaak;",
          "te late teruggave;",
          "elk nog aan de verhuurder verschuldigd bedrag.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "De borg wordt na de retourinspectie terugbetaald, na aftrek van eventuele kosten die voor rekening van de huurder blijven.",
              "Indien het schadebedrag hoger is dan de borg, blijft de huurder gehouden het overeenkomstige saldo te betalen.",
            ],
          },
        ],
      },
      {
        heading: "15. Aankomst- en vertrektijden",
        paragraphs: ["Tenzij bij de reservering anders meegedeeld:"],
        items: [
          "aankomst is voorzien vanaf 17:00 uur;",
          "vertrek moet plaatsvinden vóór 11:00 uur op de dag van vertrek.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "De huurder moet de overeengekomen tijden respecteren om ontvangst, controle en voorbereiding van de boot mogelijk te maken.",
              "Elke aanzienlijke vertraging moet zo snel mogelijk aan de verhuurder worden gemeld.",
            ],
          },
        ],
      },
      {
        heading: "16. Toegankelijkheid en bijzondere omstandigheden",
        paragraphs: [
          "De Glamping Boat™ is ontworpen om de ontvangst van personen met beperkte mobiliteit of gasten die een kuur volgen te vergemakkelijken.",
          "Door de rivieromgeving en de beperkingen van navigatie kunnen echter bepaalde beperkingen blijven bestaan.",
          "Betrokken personen worden verzocht vóór elke reservering contact op te nemen met de verhuurder om na te gaan of de boot geschikt is voor hun specifieke behoeften en, indien nodig, passende ontvangstvoorwaarden te organiseren.",
        ],
      },
      {
        heading: "17. Consumentenbemiddeling",
        paragraphs: [
          "Overeenkomstig de bepalingen van de Franse Consumentenwet heeft de klant het recht gratis een consumentenbemiddelaar in te schakelen om een geschil minnelijk op te lossen.",
          "Na een schriftelijke klacht aan de verhuurder en bij gebreke van een bevredigend antwoord binnen 60 dagen kan de klant zich wenden tot de bevoegde bemiddelaar, waarvan de contactgegevens op eenvoudig verzoek worden meegedeeld of op de website van de exploitant staan.",
          "Bij gebrek aan een minnelijke oplossing wordt het geschil voorgelegd aan de bevoegde Franse rechtbanken.",
        ],
      },
    ],
  },
  ru: {
    title: "Общие условия аренды - Glamping Boat™",
    sections: [
      {
        heading: "1. Предмет",
        paragraphs: [
          "Настоящие Общие условия продажи и аренды регулируют бронирование и аренду Glamping Boat™, электрической лодки для проживания, которой можно управлять без судоводительского удостоверения и которая эксплуатируется Les Coches de Penchot (LCP).",
          "Любое бронирование означает безоговорочное принятие настоящих условий.",
        ],
      },
      {
        heading: "2. Бронирование и оплата",
        paragraphs: ["Бронирование становится окончательным после получения:"],
        items: [
          "заполненной формы бронирования;",
          "предоплаты в размере 50% от общей стоимости пребывания.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Остаток должен быть оплачен не позднее чем за 15 дней до даты прибытия.",
              "При неоплате остатка в установленный срок арендодатель оставляет за собой право отменить бронирование без возврата уже уплаченных сумм.",
            ],
          },
        ],
      },
      {
        heading: "3. Условия размещения",
        paragraphs: [
          "Glamping Boat™ рассчитан максимум на 4 человек, включая как минимум одного ответственного совершеннолетнего взрослого.",
          "Арендатор обязуется соблюдать максимально допустимую вместимость, а также инструкции по эксплуатации и безопасности, переданные при приемке.",
          "Навигация разрешена только лицам, способным выполнять обычные маневры прогулочного судна и соблюдать правила внутреннего судоходства.",
        ],
      },
      {
        heading: "4. Передача лодки",
        paragraphs: [
          "Перед отправлением арендатор получает ознакомление с лодкой, ее оборудованием и правилами безопасности.",
          "До посадки требуется залог. Его размер сообщается при бронировании.",
          "Арендатор подтверждает получение лодки в исправном и чистом состоянии.",
        ],
      },
      {
        heading: "5. Использование Glamping Boat™",
        paragraphs: [
          "Glamping Boat™ предназначен исключительно для туризма и отдыха.",
          "В частности, запрещены:",
        ],
        items: [
          "субаренда;",
          "передача лодки третьим лицам;",
          "любое неразрешенное профессиональное или коммерческое использование;",
          "умышленное повреждение оборудования;",
          "превышение максимально допустимой вместимости.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Лодка может использоваться только в навигационных зонах, разрешенных арендодателем.",
            ],
          },
        ],
      },
      {
        heading: "6. Охрана окружающей среды",
        paragraphs: [
          "Glamping Boat™ оснащен автономной биологической системой обработки воды и оборудованием, предназначенным для ограничения воздействия на окружающую среду.",
          "Пассажиры обязуются:",
        ],
        items: [
          "ограничивать потребление воды;",
          "использовать только предоставленные на борту средства для уборки и гигиены;",
          "уважать природную среду и окружающую фауну;",
          "не сбрасывать и не оставлять отходы в природной среде.",
        ],
      },
      {
        heading: "7. Ответственность",
        paragraphs: [
          "Арендатор несет ответственность за лодку, ее оборудование и лиц на борту в течение всего срока аренды.",
          "Любое повреждение, потеря оборудования, поломка или ненадлежащее использование могут быть выставлены арендатору к оплате и удержаны из залога.",
          "Арендодатель не несет ответственности за потерю, кражу или повреждение личных вещей пассажиров.",
        ],
      },
      {
        heading: "8. Страхование",
        paragraphs: [
          "Лодка застрахована по гражданской ответственности и ущербу в соответствии с действующими правилами.",
          "За счет арендатора остаются:",
        ],
        items: [
          "применимые франшизы;",
          "ущерб, возникший вследствие умышленной вины или грубой неосторожности;",
          "нарушения законов или правил, совершенные во время аренды;",
          "потеря или повреждение оборудования, не покрываемые страховкой.",
        ],
      },
      {
        heading: "9. Отмена",
        subsections: [
          {
            heading: "Отмена арендатором",
            items: [
              "Более чем за 60 дней до прибытия: предоплата удерживается.",
              "От 60 до 15 дней до прибытия: 50% стоимости пребывания.",
              "Менее чем за 15 дней до прибытия или незаезд: 100% стоимости пребывания.",
            ],
            paragraphs: ["Любая отмена должна быть направлена в письменной форме."],
          },
          {
            heading: "Отмена арендодателем",
            paragraphs: [
              "В случае исключительного события, форс-мажора или технической невозможности, делающей аренду невозможной, арендодатель может предложить перенос пребывания или вернуть уплаченные суммы без иной компенсации.",
            ],
          },
        ],
      },
      {
        heading: "10. Условия навигации",
        paragraphs: ["Навигация может быть ограничена, приостановлена или запрещена по причине:"],
        items: [
          "погодных условий;",
          "уровня воды;",
          "административных распоряжений;",
          "работ или происшествий на водном пути;",
          "любой ситуации, представляющей риск для пассажиров или имущества.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Такие обстоятельства не дают права на требование компенсации.",
            ],
          },
        ],
      },
      {
        heading: "11. Возврат лодки",
        paragraphs: [
          "Лодка должна быть возвращена в согласованные дату, время и место.",
          "Она должна быть возвращена в обычном чистом состоянии и со всем оборудованием, переданным при отправлении.",
          "Задержка, необходимость исключительной уборки или замена отсутствующего оборудования могут быть выставлены к оплате.",
        ],
      },
      {
        heading: "12. Претензии и споры",
        paragraphs: [
          "Любая претензия, связанная с пребыванием, должна быть направлена арендодателю в течение 30 дней после окончания аренды.",
          "Настоящие условия регулируются французским правом.",
          "В случае спора стороны в первую очередь ищут мирное решение до начала судебных процедур.",
        ],
      },
      {
        heading: "13. Персональные данные",
        paragraphs: [
          "Информация, собранная при бронировании, используется исключительно для управления пребыванием и коммерческими отношениями с клиентом.",
          "В соответствии с действующими правилами защиты данных каждый клиент имеет право доступа, исправления и удаления своих персональных данных.",
        ],
      },
      {
        heading: "14. Залог",
        paragraphs: [
          "До передачи лодки требуется залог, размер которого сообщается при бронировании.",
          "Этот залог, в частности, покрывает:",
        ],
        items: [
          "ущерб лодке или ее оборудованию;",
          "потерю или повреждение бортового оборудования;",
          "расходы на исключительную уборку;",
          "задержку возврата;",
          "любые суммы, остающиеся причитающимися арендодателю.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Залог возвращается после осмотра при возврате за вычетом, при необходимости, расходов, остающихся за счет арендатора.",
              "Если сумма ущерба превышает размер залога, арендатор обязан оплатить соответствующий остаток.",
            ],
          },
        ],
      },
      {
        heading: "15. Время заезда и выезда",
        paragraphs: ["Если при бронировании не указано иное:"],
        items: [
          "заезд предусмотрен с 17:00;",
          "выезд должен состояться до 11:00 в день окончания пребывания.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Арендатор обязан соблюдать согласованное расписание, чтобы обеспечить прием, проверку и подготовку лодки.",
              "О любой значительной задержке необходимо как можно скорее сообщить арендодателю.",
            ],
          },
        ],
      },
      {
        heading: "16. Доступность и особые обстоятельства",
        paragraphs: [
          "Glamping Boat™ был разработан для облегчения приема людей с ограниченной мобильностью или гостей, проходящих термальное лечение.",
          "Однако из-за речной среды и ограничений, связанных с навигацией, могут сохраняться определенные ограничения.",
          "Соответствующим лицам рекомендуется связаться с арендодателем до бронирования, чтобы проверить соответствие лодки их особым потребностям и при необходимости организовать наиболее подходящие условия приема.",
        ],
      },
      {
        heading: "17. Потребительская медиация",
        paragraphs: [
          "В соответствии с положениями Французского потребительского кодекса клиент имеет право бесплатно обратиться к потребительскому медиатору для мирного разрешения спора.",
          "После направления письменной претензии арендодателю и при отсутствии удовлетворительного ответа в течение 60 дней клиент может обратиться к компетентному медиатору, контактные данные которого предоставляются по запросу или размещаются на сайте оператора.",
          "При отсутствии мирного урегулирования спор передается в компетентные французские суды.",
        ],
      },
    ],
  },
  es: {
    title: "Condiciones generales de alquiler - Glamping Boat™",
    sections: [
      {
        heading: "1. Objeto",
        paragraphs: [
          "Las presentes Condiciones Generales de Venta y Alquiler regulan la reserva y el alquiler del Glamping Boat™, barco-alojamiento eléctrico sin licencia explotado por Les Coches de Penchot (LCP).",
          "Toda reserva implica la aceptación sin reservas de estas condiciones.",
        ],
      },
      {
        heading: "2. Reserva y pago",
        paragraphs: ["La reserva será definitiva tras la recepción de:"],
        items: [
          "el formulario de reserva completado;",
          "el pago de un depósito correspondiente al 50 % del importe total de la estancia.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "El saldo deberá pagarse a más tardar 15 días antes de la fecha de llegada.",
              "En caso de impago del saldo dentro del plazo, el arrendador se reserva el derecho de cancelar la reserva sin reembolso de las cantidades ya abonadas.",
            ],
          },
        ],
      },
      {
        heading: "3. Condiciones de ocupación",
        paragraphs: [
          "El Glamping Boat™ está diseñado para alojar a un máximo de 4 personas, incluida al menos una persona adulta responsable.",
          "El arrendatario se compromete a respetar la capacidad máxima autorizada, así como las instrucciones de uso y seguridad entregadas en la recepción.",
          "La navegación queda reservada a personas aptas para realizar las maniobras habituales de una embarcación de recreo y respetar las normas de navegación interior.",
        ],
      },
      {
        heading: "4. Entrega del barco",
        paragraphs: [
          "Antes de la salida, el arrendatario recibirá una presentación del barco, de su equipamiento y de las reglas de seguridad.",
          "Se exige una fianza antes del embarque. Su importe se comunicará al realizar la reserva.",
          "El arrendatario reconoce haber recibido el barco en buen estado de funcionamiento y limpieza.",
        ],
      },
      {
        heading: "5. Uso del Glamping Boat™",
        paragraphs: [
          "El Glamping Boat™ está destinado exclusivamente a un uso turístico y de ocio.",
          "Queda especialmente prohibido:",
        ],
        items: [
          "subarrendar el barco;",
          "prestarlo a terceros;",
          "cualquier uso profesional o comercial no autorizado;",
          "cualquier deterioro voluntario del equipamiento;",
          "superar la capacidad máxima autorizada.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "El barco solo podrá utilizarse en las zonas de navegación autorizadas por el arrendador.",
            ],
          },
        ],
      },
      {
        heading: "6. Respeto del medio ambiente",
        paragraphs: [
          "El Glamping Boat™ está equipado con un sistema autónomo de tratamiento biológico del agua y con equipos diseñados para limitar su impacto ambiental.",
          "Los ocupantes se comprometen a:",
        ],
        items: [
          "limitar su consumo de agua;",
          "utilizar exclusivamente los productos de limpieza e higiene suministrados a bordo;",
          "respetar los entornos naturales y la fauna circundante;",
          "no verter ni abandonar residuos en el medio natural.",
        ],
      },
      {
        heading: "7. Responsabilidad",
        paragraphs: [
          "El arrendatario es responsable del barco, de su equipamiento y de las personas embarcadas durante toda la duración del alquiler.",
          "Cualquier deterioro, pérdida de equipamiento, rotura o uso no conforme podrá facturarse al arrendatario y deducirse de la fianza.",
          "El arrendador no será responsable de pérdidas, robos o daños relativos a los efectos personales de los ocupantes.",
        ],
      },
      {
        heading: "8. Seguro",
        paragraphs: [
          "El barco está cubierto por un seguro de responsabilidad civil y daños conforme a la normativa vigente.",
          "Quedan a cargo del arrendatario:",
        ],
        items: [
          "las franquicias aplicables;",
          "los daños resultantes de una falta intencional o negligencia grave;",
          "las infracciones cometidas durante el alquiler;",
          "las pérdidas o deterioros de equipamientos no cubiertos por el seguro.",
        ],
      },
      {
        heading: "9. Cancelación",
        subsections: [
          {
            heading: "Cancelación por el arrendatario",
            items: [
              "Más de 60 días antes de la llegada: retención del depósito.",
              "Entre 60 y 15 días antes de la llegada: 50 % del importe de la estancia.",
              "Menos de 15 días antes de la llegada o no presentación: 100 % del importe de la estancia.",
            ],
            paragraphs: ["Toda cancelación deberá notificarse por escrito."],
          },
          {
            heading: "Cancelación por el arrendador",
            paragraphs: [
              "En caso de acontecimiento excepcional, fuerza mayor o imposibilidad técnica que haga imposible el alquiler, el arrendador podrá proponer el aplazamiento de la estancia o reembolsar las cantidades abonadas, sin otra indemnización.",
            ],
          },
        ],
      },
      {
        heading: "10. Condiciones de navegación",
        paragraphs: ["La navegación podrá limitarse, suspenderse o prohibirse por razón de:"],
        items: [
          "condiciones meteorológicas;",
          "nivel de las aguas;",
          "resoluciones administrativas;",
          "obras o incidentes en la vía navegable;",
          "cualquier situación que presente un riesgo para los ocupantes o el material.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Estas circunstancias no podrán dar lugar a ninguna solicitud de indemnización.",
            ],
          },
        ],
      },
      {
        heading: "11. Devolución del barco",
        paragraphs: [
          "El barco deberá devolverse en la fecha, hora y lugar convenidos.",
          "Deberá devolverse en un estado normal de limpieza y con todo el equipamiento entregado a la salida.",
          "Cualquier retraso, limpieza excepcional o sustitución de material faltante podrá facturarse.",
        ],
      },
      {
        heading: "12. Reclamaciones y litigios",
        paragraphs: [
          "Toda reclamación relativa a la estancia deberá dirigirse al arrendador en un plazo de 30 días tras el final del alquiler.",
          "Estas condiciones se rigen por el derecho francés.",
          "En caso de litigio, las partes buscarán prioritariamente una solución amistosa antes de cualquier acción judicial.",
        ],
      },
      {
        heading: "13. Datos personales",
        paragraphs: [
          "La información recogida durante la reserva se utiliza exclusivamente para la gestión de la estancia y la relación comercial con el cliente.",
          "De conformidad con la normativa vigente de protección de datos, cada cliente dispone de un derecho de acceso, rectificación y supresión de sus datos personales.",
        ],
      },
      {
        heading: "14. Fianza",
        paragraphs: [
          "Antes de la entrega del barco se exige una fianza cuyo importe se comunica al realizar la reserva.",
          "Esta fianza garantiza en particular:",
        ],
        items: [
          "los daños causados al barco o a su equipamiento;",
          "la pérdida o deterioro del material embarcado;",
          "los gastos de limpieza excepcional;",
          "los retrasos en la devolución;",
          "cualquier suma pendiente adeudada al arrendador.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "La fianza se devolverá tras el inventario de retorno, deducidos, en su caso, los gastos que sigan a cargo del arrendatario.",
              "Si el importe de los daños supera el de la fianza, el arrendatario seguirá obligado al pago del saldo correspondiente.",
            ],
          },
        ],
      },
      {
        heading: "15. Horarios de llegada y salida",
        paragraphs: ["Salvo disposición particular comunicada al realizar la reserva:"],
        items: [
          "las llegadas están previstas a partir de las 17:00;",
          "las salidas deberán realizarse antes de las 11:00 del día de finalización de la estancia.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "El arrendatario deberá respetar los horarios convenidos para permitir las operaciones de recepción, control y preparación del barco.",
              "Cualquier retraso significativo deberá comunicarse al arrendador lo antes posible.",
            ],
          },
        ],
      },
      {
        heading: "16. Accesibilidad y situaciones particulares",
        paragraphs: [
          "El Glamping Boat™ ha sido diseñado para facilitar la acogida de personas con movilidad reducida o que siguen una cura termal.",
          "No obstante, debido al entorno fluvial y a las limitaciones relacionadas con la navegación, pueden subsistir ciertas limitaciones.",
          "Se invita a las personas afectadas a contactar con el arrendador antes de cualquier reserva para verificar la adecuación del barco a sus necesidades específicas y organizar, si fuera necesario, las condiciones de acogida más adecuadas.",
        ],
      },
      {
        heading: "17. Mediación de consumo",
        paragraphs: [
          "De conformidad con las disposiciones del Código de Consumo francés, el cliente tiene derecho a recurrir gratuitamente a un mediador de consumo para la resolución amistosa de un litigio.",
          "Tras presentar una reclamación escrita al arrendador y en ausencia de respuesta satisfactoria en un plazo de 60 días, el cliente podrá acudir al mediador competente, cuyos datos de contacto se comunicarán previa solicitud o figuran en el sitio web del operador.",
          "A falta de resolución amistosa, el litigio se someterá a los tribunales franceses competentes.",
        ],
      },
    ],
  },
  it: {
    title: "Condizioni generali di noleggio - Glamping Boat™",
    sections: [
      {
        heading: "1. Oggetto",
        paragraphs: [
          "Le presenti Condizioni Generali di Vendita e Noleggio disciplinano la prenotazione e il noleggio del Glamping Boat™, barca-alloggio elettrica senza patente gestita da Les Coches de Penchot (LCP).",
          "Ogni prenotazione implica l'accettazione senza riserve delle presenti condizioni.",
        ],
      },
      {
        heading: "2. Prenotazione e pagamento",
        paragraphs: ["La prenotazione diventa definitiva al ricevimento:"],
        items: [
          "del modulo di prenotazione compilato;",
          "del pagamento dell'acconto pari al 50% dell'importo totale del soggiorno.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Il saldo è esigibile al più tardi 15 giorni prima della data di arrivo.",
              "In caso di mancato pagamento del saldo nei termini, il locatore si riserva il diritto di annullare la prenotazione senza rimborso delle somme già versate.",
            ],
          },
        ],
      },
      {
        heading: "3. Condizioni di occupazione",
        paragraphs: [
          "Il Glamping Boat™ è progettato per accogliere al massimo 4 persone, di cui almeno un adulto maggiorenne responsabile.",
          "Il conduttore si impegna a rispettare la capacità massima autorizzata e le istruzioni d'uso e sicurezza consegnate alla presa in carico.",
          "La navigazione è riservata a persone idonee a effettuare le manovre ordinarie di una barca da diporto e a rispettare le regole della navigazione interna.",
        ],
      },
      {
        heading: "4. Presa in consegna della barca",
        paragraphs: [
          "Prima della partenza, il conduttore riceve una presentazione della barca, delle sue attrezzature e delle regole di sicurezza.",
          "Prima dell'imbarco è richiesta una cauzione. Il relativo importo viene comunicato al momento della prenotazione.",
          "Il conduttore riconosce di aver preso possesso della barca in buono stato di funzionamento e pulizia.",
        ],
      },
      {
        heading: "5. Utilizzo del Glamping Boat™",
        paragraphs: [
          "Il Glamping Boat™ è destinato esclusivamente a un uso turistico e ricreativo.",
          "Sono in particolare vietati:",
        ],
        items: [
          "il subnoleggio;",
          "il prestito a terzi;",
          "qualsiasi uso professionale o commerciale non autorizzato;",
          "qualsiasi danneggiamento volontario delle attrezzature;",
          "il superamento della capacità massima autorizzata.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "La barca può essere utilizzata solo nelle zone di navigazione autorizzate dal locatore.",
            ],
          },
        ],
      },
      {
        heading: "6. Rispetto dell'ambiente",
        paragraphs: [
          "Il Glamping Boat™ è dotato di un sistema autonomo di trattamento biologico dell'acqua e di attrezzature progettate per limitare l'impatto ambientale.",
          "Gli occupanti si impegnano a:",
        ],
        items: [
          "limitare il consumo d'acqua;",
          "utilizzare esclusivamente i prodotti per la pulizia e l'igiene forniti a bordo;",
          "rispettare gli ambienti naturali e la fauna circostante;",
          "non scaricare né abbandonare rifiuti nell'ambiente naturale.",
        ],
      },
      {
        heading: "7. Responsabilità",
        paragraphs: [
          "Il conduttore è responsabile della barca, delle sue attrezzature e delle persone imbarcate per tutta la durata del noleggio.",
          "Qualsiasi deterioramento, perdita di attrezzatura, rottura o uso non conforme potrà essere fatturato al conduttore e trattenuto dalla cauzione.",
          "Il locatore non potrà essere ritenuto responsabile per perdite, furti o danni riguardanti gli effetti personali degli occupanti.",
        ],
      },
      {
        heading: "8. Assicurazione",
        paragraphs: [
          "La barca è coperta da assicurazione di responsabilità civile e danni conformemente alla normativa vigente.",
          "Restano a carico del conduttore:",
        ],
        items: [
          "le franchigie applicabili;",
          "i danni derivanti da dolo o grave negligenza;",
          "le violazioni commesse durante il noleggio;",
          "le perdite o deterioramenti di attrezzature non coperti dall'assicurazione.",
        ],
      },
      {
        heading: "9. Annullamento",
        subsections: [
          {
            heading: "Annullamento da parte del conduttore",
            items: [
              "Più di 60 giorni prima dell'arrivo: trattenuta dell'acconto.",
              "Tra 60 e 15 giorni prima dell'arrivo: 50% dell'importo del soggiorno.",
              "Meno di 15 giorni prima dell'arrivo o mancata presentazione: 100% dell'importo del soggiorno.",
            ],
            paragraphs: ["Ogni annullamento deve essere notificato per iscritto."],
          },
          {
            heading: "Annullamento da parte del locatore",
            paragraphs: [
              "In caso di evento eccezionale, forza maggiore o impossibilità tecnica che renda impossibile il noleggio, il locatore potrà proporre il rinvio del soggiorno o rimborsare le somme versate, senza altra indennità.",
            ],
          },
        ],
      },
      {
        heading: "10. Condizioni di navigazione",
        paragraphs: ["La navigazione può essere limitata, sospesa o vietata a causa di:"],
        items: [
          "condizioni meteorologiche;",
          "livello delle acque;",
          "provvedimenti amministrativi;",
          "lavori o incidenti sulla via navigabile;",
          "qualsiasi situazione che presenti un rischio per gli occupanti o il materiale.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Tali circostanze non potranno dar luogo ad alcuna richiesta di indennizzo.",
            ],
          },
        ],
      },
      {
        heading: "11. Restituzione della barca",
        paragraphs: [
          "La barca deve essere restituita alla data, all'ora e nel luogo convenuti.",
          "Dovrà essere restituita in normale stato di pulizia e con tutte le attrezzature consegnate alla partenza.",
          "Qualsiasi ritardo, pulizia eccezionale o sostituzione di materiale mancante potrà essere fatturato.",
        ],
      },
      {
        heading: "12. Reclami e controversie",
        paragraphs: [
          "Qualsiasi reclamo relativo al soggiorno dovrà essere indirizzato al locatore entro 30 giorni dalla fine del noleggio.",
          "Le presenti condizioni sono soggette al diritto francese.",
          "In caso di controversia, le parti cercheranno prioritariamente una soluzione amichevole prima di qualsiasi azione giudiziaria.",
        ],
      },
      {
        heading: "13. Dati personali",
        paragraphs: [
          "Le informazioni raccolte durante la prenotazione sono utilizzate esclusivamente per la gestione del soggiorno e del rapporto commerciale con il cliente.",
          "Conformemente alla normativa vigente in materia di protezione dei dati, ogni cliente dispone del diritto di accesso, rettifica e cancellazione dei propri dati personali.",
        ],
      },
      {
        heading: "14. Cauzione",
        paragraphs: [
          "Prima della consegna della barca è richiesta una cauzione, il cui importo viene comunicato al momento della prenotazione.",
          "Questa cauzione garantisce in particolare:",
        ],
        items: [
          "i danni causati alla barca o alle sue attrezzature;",
          "la perdita o il deterioramento del materiale di bordo;",
          "le spese di pulizia eccezionale;",
          "i ritardi nella restituzione;",
          "qualsiasi somma ancora dovuta al locatore.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "La cauzione viene restituita dopo lo stato dei luoghi di ritorno, previa detrazione, se del caso, delle spese rimaste a carico del conduttore.",
              "Se l'importo dei danni supera quello della cauzione, il conduttore resta tenuto al pagamento del saldo corrispondente.",
            ],
          },
        ],
      },
      {
        heading: "15. Orari di arrivo e partenza",
        paragraphs: ["Salvo disposizione particolare comunicata al momento della prenotazione:"],
        items: [
          "gli arrivi sono previsti a partire dalle 17:00;",
          "le partenze devono avvenire prima delle 11:00 del giorno di fine soggiorno.",
        ],
        subsections: [
          {
            heading: "",
            paragraphs: [
              "Il conduttore è tenuto a rispettare gli orari concordati per consentire le operazioni di accoglienza, controllo e preparazione della barca.",
              "Qualsiasi ritardo significativo dovrà essere segnalato al locatore nel più breve tempo possibile.",
            ],
          },
        ],
      },
      {
        heading: "16. Accessibilità e situazioni particolari",
        paragraphs: [
          "Il Glamping Boat™ è stato progettato per facilitare l'accoglienza di persone a mobilità ridotta o che seguono cure termali.",
          "Tuttavia, a causa dell'ambiente fluviale e dei vincoli legati alla navigazione, possono sussistere alcune limitazioni.",
          "Le persone interessate sono invitate a contattare il locatore prima di ogni prenotazione per verificare l'adeguatezza della barca alle loro esigenze specifiche e organizzare, se necessario, le condizioni di accoglienza più adatte.",
        ],
      },
      {
        heading: "17. Mediazione dei consumatori",
        paragraphs: [
          "Conformemente alle disposizioni del Codice del consumo francese, il cliente ha il diritto di ricorrere gratuitamente a un mediatore dei consumatori per la risoluzione amichevole di una controversia.",
          "Dopo aver inviato un reclamo scritto al locatore e in assenza di risposta soddisfacente entro 60 giorni, il cliente potrà rivolgersi al mediatore competente, i cui recapiti saranno comunicati su semplice richiesta o figurano sul sito internet dell'operatore.",
          "In mancanza di una risoluzione amichevole, la controversia sarà sottoposta ai tribunali francesi competenti.",
        ],
      },
    ],
  },
};

function Paragraphs({ paragraphs }: { paragraphs?: string[] }) {
  return (
    paragraphs?.map((paragraph) => (
      <p className="mb-2 leading-[1.62]" key={paragraph}>
        {paragraph}
      </p>
    )) ?? null
  );
}

function Items({ items }: { items?: string[] }) {
  if (!items?.length) {
    return null;
  }

  return (
    <ul className="mb-4 list-disc space-y-1.5 pl-7 leading-[1.55] marker:text-[var(--color-beige)]/80">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function RentalTerms({ locale }: { locale: Locale }) {
  const document = terms[locale] ?? terms.en;

  return (
    <article className="rental-terms mx-auto w-full max-w-[52rem] px-1 py-2 text-[var(--color-beige)] sm:px-2">
      <header className="mb-8 border-b border-white/18 pb-5 text-center">
        <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-beige)]/70">
          Les Coches de Penchot
        </p>
        <h1 className="mx-auto mb-0 max-w-[42rem] text-balance text-[clamp(1.75rem,3.8vw,2.65rem)] font-semibold leading-[1.08] text-[var(--color-beige)]">
          {document.title}
        </h1>
      </header>
      {document.sections.map((section) => (
        <section
          className="border-b border-white/10 py-5 last:border-b-0 last:pb-0 first:pt-0"
          key={section.heading}
        >
          <h2 className="mb-3 text-[clamp(1.08rem,2vw,1.28rem)] font-semibold leading-tight text-[var(--color-beige)]">
            {section.heading}
          </h2>
          <Paragraphs paragraphs={section.paragraphs} />
          <Items items={section.items} />
          {section.subsections?.map((subsection) => (
            <div
              className="mt-4"
              key={`${section.heading}-${subsection.heading || subsection.paragraphs?.[0]}`}
            >
              {subsection.heading ? (
                <h3 className="mb-2 text-[0.98rem] font-semibold leading-snug text-[var(--color-beige)]/92">
                  {subsection.heading}
                </h3>
              ) : null}
              <Items items={subsection.items} />
              <Paragraphs paragraphs={subsection.paragraphs} />
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
