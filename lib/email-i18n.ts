import { LOCALES, type Locale } from "@/components/Language/dictionaries";

type PasswordResetEmailCopy = {
  subject: string;
  title: string;
  eyebrow: string;
  preview: string;
  intro: string;
  instructions: string;
  actionLabel: string;
  ignoreNotice: string;
  footer: (resetUrl: string) => string;
  text: (resetUrl: string) => string;
};

type ContactEmailCopy = {
  subject: string;
  title: string;
  eyebrow: string;
  preview: (sender: string) => string;
  fields: {
    name: string;
    email: string;
    phone: string;
    address: string;
    message: string;
  };
  textTitle: string;
};

type EmailCopy = {
  passwordReset: PasswordResetEmailCopy;
  contact: ContactEmailCopy;
};

function resetText(
  copy: Omit<PasswordResetEmailCopy, "text">,
  resetUrl: string
) {
  return [
    copy.subject,
    "",
    copy.instructions,
    resetUrl,
    "",
    copy.ignoreNotice,
  ].join("\n");
}

const emailCopy = {
  en: {
    passwordReset: {
      subject: "Reset your Glamping Boat password",
      title: "Reset your password",
      eyebrow: "Account security",
      preview: "Use this secure link to reset your Glamping Boat password.",
      intro:
        "We received a request to reset the password for your Glamping Boat account.",
      instructions:
        "Use the button below to choose a new password. This link expires in 1 hour.",
      actionLabel: "Reset password",
      ignoreNotice: "If you did not request this, you can ignore this email.",
      footer: (resetUrl) =>
        `If the button does not work, paste this link into your browser:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      text(resetUrl) {
        return resetText(this, resetUrl);
      },
    },
    contact: {
      subject: "New Contact Form Submission - Glamping Boat",
      title: "New contact form submission",
      eyebrow: "Website contact",
      preview: (sender) => `New message from ${sender}.`,
      fields: {
        name: "Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        message: "Message",
      },
      textTitle: "New Contact Form Submission",
    },
  },
  fr: {
    passwordReset: {
      subject: "Reinitialisez votre mot de passe Glamping Boat",
      title: "Reinitialisez votre mot de passe",
      eyebrow: "Securite du compte",
      preview:
        "Utilisez ce lien securise pour reinitialiser votre mot de passe Glamping Boat.",
      intro:
        "Nous avons recu une demande de reinitialisation du mot de passe de votre compte Glamping Boat.",
      instructions:
        "Utilisez le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.",
      actionLabel: "Reinitialiser le mot de passe",
      ignoreNotice:
        "Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet e-mail.",
      footer: (resetUrl) =>
        `Si le bouton ne fonctionne pas, collez ce lien dans votre navigateur :\n${resetUrl}\n\nSi vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet e-mail.`,
      text(resetUrl) {
        return resetText(this, resetUrl);
      },
    },
    contact: {
      subject: "Nouvelle demande de contact - Glamping Boat",
      title: "Nouvelle demande de contact",
      eyebrow: "Contact du site",
      preview: (sender) => `Nouveau message de ${sender}.`,
      fields: {
        name: "Nom",
        email: "E-mail",
        phone: "Telephone",
        address: "Adresse",
        message: "Message",
      },
      textTitle: "Nouvelle demande de contact",
    },
  },
  de: {
    passwordReset: {
      subject: "Glamping Boat Passwort zuruecksetzen",
      title: "Passwort zuruecksetzen",
      eyebrow: "Kontosicherheit",
      preview:
        "Verwenden Sie diesen sicheren Link, um Ihr Glamping Boat Passwort zurueckzusetzen.",
      intro:
        "Wir haben eine Anfrage erhalten, das Passwort fuer Ihr Glamping Boat Konto zurueckzusetzen.",
      instructions:
        "Verwenden Sie die Schaltflaeche unten, um ein neues Passwort zu waehlen. Dieser Link laeuft in 1 Stunde ab.",
      actionLabel: "Passwort zuruecksetzen",
      ignoreNotice:
        "Wenn Sie dies nicht angefordert haben, koennen Sie diese E-Mail ignorieren.",
      footer: (resetUrl) =>
        `Wenn die Schaltflaeche nicht funktioniert, fuegen Sie diesen Link in Ihren Browser ein:\n${resetUrl}\n\nWenn Sie dies nicht angefordert haben, koennen Sie diese E-Mail ignorieren.`,
      text(resetUrl) {
        return resetText(this, resetUrl);
      },
    },
    contact: {
      subject: "Neue Kontaktanfrage - Glamping Boat",
      title: "Neue Kontaktanfrage",
      eyebrow: "Website-Kontakt",
      preview: (sender) => `Neue Nachricht von ${sender}.`,
      fields: {
        name: "Name",
        email: "E-Mail",
        phone: "Telefon",
        address: "Adresse",
        message: "Nachricht",
      },
      textTitle: "Neue Kontaktanfrage",
    },
  },
  nl: {
    passwordReset: {
      subject: "Reset je Glamping Boat wachtwoord",
      title: "Reset je wachtwoord",
      eyebrow: "Accountbeveiliging",
      preview:
        "Gebruik deze veilige link om je Glamping Boat wachtwoord te resetten.",
      intro:
        "We hebben een verzoek ontvangen om het wachtwoord van je Glamping Boat account te resetten.",
      instructions:
        "Gebruik de knop hieronder om een nieuw wachtwoord te kiezen. Deze link verloopt over 1 uur.",
      actionLabel: "Wachtwoord resetten",
      ignoreNotice:
        "Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.",
      footer: (resetUrl) =>
        `Als de knop niet werkt, plak dan deze link in je browser:\n${resetUrl}\n\nAls je dit niet hebt aangevraagd, kun je deze e-mail negeren.`,
      text(resetUrl) {
        return resetText(this, resetUrl);
      },
    },
    contact: {
      subject: "Nieuw contactformulier - Glamping Boat",
      title: "Nieuw contactformulier",
      eyebrow: "Websitecontact",
      preview: (sender) => `Nieuw bericht van ${sender}.`,
      fields: {
        name: "Naam",
        email: "E-mail",
        phone: "Telefoon",
        address: "Adres",
        message: "Bericht",
      },
      textTitle: "Nieuw contactformulier",
    },
  },
  ru: {
    passwordReset: {
      subject: "Сброс пароля Glamping Boat",
      title: "Сброс пароля",
      eyebrow: "Безопасность аккаунта",
      preview:
        "Используйте эту безопасную ссылку для сброса пароля Glamping Boat.",
      intro:
        "Мы получили запрос на сброс пароля для вашего аккаунта Glamping Boat.",
      instructions:
        "Нажмите кнопку ниже, чтобы выбрать новый пароль. Ссылка действует 1 час.",
      actionLabel: "Сбросить пароль",
      ignoreNotice:
        "Если вы не запрашивали сброс, просто проигнорируйте это письмо.",
      footer: (resetUrl) =>
        `Если кнопка не работает, вставьте эту ссылку в браузер:\n${resetUrl}\n\nЕсли вы не запрашивали сброс, просто проигнорируйте это письмо.`,
      text(resetUrl) {
        return resetText(this, resetUrl);
      },
    },
    contact: {
      subject: "Новое сообщение с формы контакта - Glamping Boat",
      title: "Новое сообщение с формы контакта",
      eyebrow: "Контакт с сайта",
      preview: (sender) => `Новое сообщение от ${sender}.`,
      fields: {
        name: "Имя",
        email: "Email",
        phone: "Телефон",
        address: "Адрес",
        message: "Сообщение",
      },
      textTitle: "Новое сообщение с формы контакта",
    },
  },
  es: {
    passwordReset: {
      subject: "Restablece tu contrasena de Glamping Boat",
      title: "Restablece tu contrasena",
      eyebrow: "Seguridad de la cuenta",
      preview:
        "Usa este enlace seguro para restablecer tu contrasena de Glamping Boat.",
      intro:
        "Hemos recibido una solicitud para restablecer la contrasena de tu cuenta de Glamping Boat.",
      instructions:
        "Usa el boton de abajo para elegir una nueva contrasena. Este enlace caduca en 1 hora.",
      actionLabel: "Restablecer contrasena",
      ignoreNotice: "Si no solicitaste esto, puedes ignorar este email.",
      footer: (resetUrl) =>
        `Si el boton no funciona, pega este enlace en tu navegador:\n${resetUrl}\n\nSi no solicitaste esto, puedes ignorar este email.`,
      text(resetUrl) {
        return resetText(this, resetUrl);
      },
    },
    contact: {
      subject: "Nuevo formulario de contacto - Glamping Boat",
      title: "Nuevo formulario de contacto",
      eyebrow: "Contacto del sitio web",
      preview: (sender) => `Nuevo mensaje de ${sender}.`,
      fields: {
        name: "Nombre",
        email: "Email",
        phone: "Telefono",
        address: "Direccion",
        message: "Mensaje",
      },
      textTitle: "Nuevo formulario de contacto",
    },
  },
  it: {
    passwordReset: {
      subject: "Reimposta la password di Glamping Boat",
      title: "Reimposta la password",
      eyebrow: "Sicurezza dell'account",
      preview:
        "Usa questo link sicuro per reimpostare la password di Glamping Boat.",
      intro:
        "Abbiamo ricevuto una richiesta per reimpostare la password del tuo account Glamping Boat.",
      instructions:
        "Usa il pulsante qui sotto per scegliere una nuova password. Questo link scade tra 1 ora.",
      actionLabel: "Reimposta password",
      ignoreNotice:
        "Se non hai richiesto tu questa operazione, puoi ignorare questa email.",
      footer: (resetUrl) =>
        `Se il pulsante non funziona, incolla questo link nel browser:\n${resetUrl}\n\nSe non hai richiesto tu questa operazione, puoi ignorare questa email.`,
      text(resetUrl) {
        return resetText(this, resetUrl);
      },
    },
    contact: {
      subject: "Nuovo modulo di contatto - Glamping Boat",
      title: "Nuovo modulo di contatto",
      eyebrow: "Contatto dal sito",
      preview: (sender) => `Nuovo messaggio da ${sender}.`,
      fields: {
        name: "Nome",
        email: "Email",
        phone: "Telefono",
        address: "Indirizzo",
        message: "Messaggio",
      },
      textTitle: "Nuovo modulo di contatto",
    },
  },
} satisfies Record<Locale, EmailCopy>;

export function normalizeEmailLocale(locale: unknown): Locale {
  return typeof locale === "string" && LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : "en";
}

export function getEmailCopy(locale: unknown) {
  return emailCopy[normalizeEmailLocale(locale)];
}

export function getPasswordResetEmailCopy(locale: unknown) {
  return getEmailCopy(locale).passwordReset;
}

export function getContactEmailCopy(locale: unknown) {
  return getEmailCopy(locale).contact;
}
