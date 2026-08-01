import type { Locale } from "@/components/Language/dictionaries";
import { normalizeEmailLocale } from "@/lib/email-i18n";

type AuthEmailCopy = {
  eyebrow: string;
  verifySubject: string;
  verifyTitle: string;
  verifyPreview: string;
  verifyBody: string;
  verifyAction: string;
  verifyText: (url: string) => string;
  codeSubject: string;
  codeTitle: string;
  codePreview: string;
  codeIntro: string;
  codeExpiry: string;
  codeText: (code: string) => string;
  linkedSubject: string;
  linkedTitle: string;
  linkedPreview: string;
  linkedBody: string;
  linkedText: string;
  settingSubject: (enabled: boolean) => string;
  settingPreview: (enabled: boolean) => string;
  settingBody: (enabled: boolean) => string;
  settingText: (enabled: boolean) => string;
};

const en: AuthEmailCopy = {
  eyebrow: "Account security",
  verifySubject: "Verify your Glamping Boat email",
  verifyTitle: "Verify your email",
  verifyPreview: "Confirm your email to activate your Glamping Boat account.",
  verifyBody:
    "<p>Confirm that this email belongs to you before signing in, creating reservations, or making payments.</p><p>This secure link expires in 30 minutes.</p>",
  verifyAction: "Verify email",
  verifyText: (url) => `Verify your Glamping Boat email:\n${url}\n\nThis link expires in 30 minutes.`,
  codeSubject: "Your Glamping Boat sign-in code",
  codeTitle: "Confirm your sign-in",
  codePreview: "Use this one-time code to finish signing in.",
  codeIntro: "Enter this one-time code to finish signing in:",
  codeExpiry: "The code expires in 10 minutes and can only be used once.",
  codeText: (code) => `Your Glamping Boat sign-in code is ${code}. It expires in 10 minutes.`,
  linkedSubject: "Google was linked to your Glamping Boat account",
  linkedTitle: "Google account linked",
  linkedPreview: "A Google sign-in method was added to your account.",
  linkedBody:
    "<p>Your Google account was linked successfully. You can now use either Google or your password to sign in.</p><p>If you did not do this, reset your password and contact us immediately.</p>",
  linkedText:
    "Google was linked to your Glamping Boat account. If you did not do this, reset your password and contact us immediately.",
  settingSubject: (enabled) => `Email sign-in codes ${enabled ? "enabled" : "disabled"}`,
  settingPreview: (enabled) => `Email sign-in codes were ${enabled ? "enabled" : "disabled"} for your account.`,
  settingBody: (enabled) => `<p>Email sign-in codes were <strong>${enabled ? "enabled" : "disabled"}</strong> for your Glamping Boat account.</p><p>If you did not make this change, reset your password and contact us immediately.</p>`,
  settingText: (enabled) => `Email sign-in codes were ${enabled ? "enabled" : "disabled"} for your Glamping Boat account. If you did not make this change, reset your password and contact us immediately.`,
};

const copies: Record<Locale, AuthEmailCopy> = {
  en,
  fr: {
    ...en,
    eyebrow: "Sécurité du compte",
    verifySubject: "Vérifiez votre e-mail Glamping Boat",
    verifyTitle: "Vérifiez votre e-mail",
    verifyPreview: "Confirmez votre e-mail pour activer votre compte Glamping Boat.",
    verifyBody: "<p>Confirmez que cet e-mail vous appartient avant de vous connecter, réserver ou payer.</p><p>Ce lien sécurisé expire dans 30 minutes.</p>",
    verifyAction: "Vérifier l'e-mail",
    verifyText: (url) => `Vérifiez votre e-mail Glamping Boat :\n${url}\n\nCe lien expire dans 30 minutes.`,
    codeSubject: "Votre code de connexion Glamping Boat",
    codeTitle: "Confirmez votre connexion",
    codePreview: "Utilisez ce code à usage unique pour terminer la connexion.",
    codeIntro: "Saisissez ce code à usage unique pour terminer la connexion :",
    codeExpiry: "Le code expire dans 10 minutes et ne peut être utilisé qu'une fois.",
    codeText: (code) => `Votre code de connexion Glamping Boat est ${code}. Il expire dans 10 minutes.`,
    linkedSubject: "Google a été associé à votre compte Glamping Boat",
    linkedTitle: "Compte Google associé",
    linkedPreview: "Une méthode de connexion Google a été ajoutée à votre compte.",
    linkedBody: "<p>Votre compte Google a été associé. Vous pouvez utiliser Google ou votre mot de passe.</p><p>Si vous n'êtes pas à l'origine de cette action, réinitialisez votre mot de passe et contactez-nous immédiatement.</p>",
    linkedText: "Google a été associé à votre compte Glamping Boat. Si vous n'êtes pas à l'origine de cette action, réinitialisez votre mot de passe et contactez-nous immédiatement.",
    settingSubject: (enabled) => `Codes de connexion par e-mail ${enabled ? "activés" : "désactivés"}`,
    settingPreview: (enabled) => `Les codes de connexion ont été ${enabled ? "activés" : "désactivés"} pour votre compte.`,
    settingBody: (enabled) => `<p>Les codes de connexion par e-mail ont été <strong>${enabled ? "activés" : "désactivés"}</strong>.</p><p>Si vous n'avez pas effectué cette modification, réinitialisez votre mot de passe et contactez-nous immédiatement.</p>`,
    settingText: (enabled) => `Les codes de connexion ont été ${enabled ? "activés" : "désactivés"}. Si vous n'avez pas effectué cette modification, réinitialisez votre mot de passe et contactez-nous immédiatement.`,
  },
  de: {
    ...en,
    eyebrow: "Kontosicherheit",
    verifySubject: "Bestätigen Sie Ihre Glamping Boat E-Mail",
    verifyTitle: "E-Mail bestätigen",
    verifyPreview: "Bestätigen Sie Ihre E-Mail, um Ihr Konto zu aktivieren.",
    verifyBody: "<p>Bestätigen Sie vor Anmeldung, Buchung oder Zahlung, dass diese E-Mail Ihnen gehört.</p><p>Der sichere Link läuft in 30 Minuten ab.</p>",
    verifyAction: "E-Mail bestätigen",
    verifyText: (url) => `Bestätigen Sie Ihre Glamping Boat E-Mail:\n${url}\n\nDer Link läuft in 30 Minuten ab.`,
    codeSubject: "Ihr Glamping Boat Anmeldecode",
    codeTitle: "Anmeldung bestätigen",
    codePreview: "Verwenden Sie diesen Einmalcode zur Anmeldung.",
    codeIntro: "Geben Sie diesen Einmalcode ein:",
    codeExpiry: "Der Code läuft in 10 Minuten ab und ist nur einmal gültig.",
    codeText: (code) => `Ihr Glamping Boat Anmeldecode ist ${code}. Er läuft in 10 Minuten ab.`,
    linkedSubject: "Google wurde mit Ihrem Glamping Boat Konto verknüpft",
    linkedTitle: "Google-Konto verknüpft",
    linkedPreview: "Google wurde als Anmeldemethode hinzugefügt.",
    linkedBody: "<p>Ihr Google-Konto wurde erfolgreich verknüpft.</p><p>Wenn Sie dies nicht waren, setzen Sie Ihr Passwort zurück und kontaktieren Sie uns sofort.</p>",
    linkedText: "Google wurde mit Ihrem Glamping Boat Konto verknüpft. Wenn Sie dies nicht waren, setzen Sie Ihr Passwort zurück und kontaktieren Sie uns sofort.",
  },
  nl: {
    ...en,
    eyebrow: "Accountbeveiliging",
    verifySubject: "Bevestig je Glamping Boat e-mailadres",
    verifyTitle: "Bevestig je e-mailadres",
    verifyPreview: "Bevestig je e-mailadres om je account te activeren.",
    verifyBody: "<p>Bevestig dat dit e-mailadres van jou is voordat je inlogt, boekt of betaalt.</p><p>De veilige link verloopt over 30 minuten.</p>",
    verifyAction: "E-mailadres bevestigen",
    verifyText: (url) => `Bevestig je Glamping Boat e-mailadres:\n${url}\n\nDeze link verloopt over 30 minuten.`,
    codeSubject: "Je Glamping Boat inlogcode",
    codeTitle: "Bevestig je aanmelding",
    codePreview: "Gebruik deze eenmalige code om in te loggen.",
    codeIntro: "Voer deze eenmalige code in:",
    codeExpiry: "De code verloopt over 10 minuten en kan één keer worden gebruikt.",
    codeText: (code) => `Je Glamping Boat inlogcode is ${code}. Deze verloopt over 10 minuten.`,
    linkedSubject: "Google is gekoppeld aan je Glamping Boat account",
    linkedTitle: "Google-account gekoppeld",
    linkedPreview: "Google is toegevoegd als inlogmethode.",
    linkedBody: "<p>Je Google-account is gekoppeld.</p><p>Was jij dit niet, reset dan je wachtwoord en neem direct contact met ons op.</p>",
    linkedText: "Google is gekoppeld aan je Glamping Boat account. Was jij dit niet, reset dan je wachtwoord en neem direct contact met ons op.",
  },
  ru: {
    ...en,
    eyebrow: "Безопасность аккаунта",
    verifySubject: "Подтвердите адрес электронной почты Glamping Boat",
    verifyTitle: "Подтвердите адрес электронной почты",
    verifyPreview: "Подтвердите адрес, чтобы активировать аккаунт.",
    verifyBody: "<p>Подтвердите, что этот адрес принадлежит вам, прежде чем входить, бронировать или оплачивать.</p><p>Безопасная ссылка действует 30 минут.</p>",
    verifyAction: "Подтвердить адрес",
    verifyText: (url) => `Подтвердите адрес Glamping Boat:\n${url}\n\nСсылка действует 30 минут.`,
    codeSubject: "Код входа Glamping Boat",
    codeTitle: "Подтвердите вход",
    codePreview: "Используйте одноразовый код для завершения входа.",
    codeIntro: "Введите этот одноразовый код:",
    codeExpiry: "Код действует 10 минут и используется один раз.",
    codeText: (code) => `Ваш код входа Glamping Boat: ${code}. Он действует 10 минут.`,
    linkedSubject: "Google подключен к аккаунту Glamping Boat",
    linkedTitle: "Аккаунт Google подключен",
    linkedPreview: "Добавлен способ входа через Google.",
    linkedBody: "<p>Аккаунт Google успешно подключен.</p><p>Если это сделали не вы, смените пароль и немедленно свяжитесь с нами.</p>",
    linkedText: "Google подключен к вашему аккаунту Glamping Boat. Если это сделали не вы, смените пароль и немедленно свяжитесь с нами.",
  },
  es: {
    ...en,
    eyebrow: "Seguridad de la cuenta",
    verifySubject: "Verifica tu email de Glamping Boat",
    verifyTitle: "Verifica tu email",
    verifyPreview: "Confirma tu email para activar tu cuenta.",
    verifyBody: "<p>Confirma que este email te pertenece antes de iniciar sesión, reservar o pagar.</p><p>El enlace seguro caduca en 30 minutos.</p>",
    verifyAction: "Verificar email",
    verifyText: (url) => `Verifica tu email de Glamping Boat:\n${url}\n\nEl enlace caduca en 30 minutos.`,
    codeSubject: "Tu código de acceso de Glamping Boat",
    codeTitle: "Confirma el inicio de sesión",
    codePreview: "Usa este código de un solo uso para iniciar sesión.",
    codeIntro: "Introduce este código de un solo uso:",
    codeExpiry: "El código caduca en 10 minutos y solo puede usarse una vez.",
    codeText: (code) => `Tu código de acceso de Glamping Boat es ${code}. Caduca en 10 minutos.`,
    linkedSubject: "Google se vinculó a tu cuenta de Glamping Boat",
    linkedTitle: "Cuenta de Google vinculada",
    linkedPreview: "Se añadió el acceso con Google.",
    linkedBody: "<p>Tu cuenta de Google se vinculó correctamente.</p><p>Si no fuiste tú, restablece la contraseña y contáctanos de inmediato.</p>",
    linkedText: "Google se vinculó a tu cuenta de Glamping Boat. Si no fuiste tú, restablece la contraseña y contáctanos de inmediato.",
  },
  it: {
    ...en,
    eyebrow: "Sicurezza dell'account",
    verifySubject: "Verifica la tua email Glamping Boat",
    verifyTitle: "Verifica la tua email",
    verifyPreview: "Conferma l'email per attivare il tuo account.",
    verifyBody: "<p>Conferma che questa email ti appartiene prima di accedere, prenotare o pagare.</p><p>Il link sicuro scade tra 30 minuti.</p>",
    verifyAction: "Verifica email",
    verifyText: (url) => `Verifica la tua email Glamping Boat:\n${url}\n\nIl link scade tra 30 minuti.`,
    codeSubject: "Il tuo codice di accesso Glamping Boat",
    codeTitle: "Conferma l'accesso",
    codePreview: "Usa questo codice monouso per completare l'accesso.",
    codeIntro: "Inserisci questo codice monouso:",
    codeExpiry: "Il codice scade tra 10 minuti e può essere usato una sola volta.",
    codeText: (code) => `Il tuo codice di accesso Glamping Boat è ${code}. Scade tra 10 minuti.`,
    linkedSubject: "Google è stato collegato al tuo account Glamping Boat",
    linkedTitle: "Account Google collegato",
    linkedPreview: "È stato aggiunto l'accesso con Google.",
    linkedBody: "<p>Il tuo account Google è stato collegato.</p><p>Se non sei stato tu, reimposta la password e contattaci immediatamente.</p>",
    linkedText: "Google è stato collegato al tuo account Glamping Boat. Se non sei stato tu, reimposta la password e contattaci immediatamente.",
  },
};

export function getAuthEmailCopy(locale: unknown) {
  return copies[normalizeEmailLocale(locale)];
}
