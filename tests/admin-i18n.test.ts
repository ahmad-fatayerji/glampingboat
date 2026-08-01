import assert from "node:assert/strict";
import { test } from "node:test";
import { tAdmin } from "@/components/admin/admin-i18n";

test("French admin translations preserve diacritics", () => {
  assert.equal(tAdmin("fr", "arrival"), "Arrivée");
  assert.equal(tAdmin("fr", "availability"), "Disponibilité");
  assert.equal(tAdmin("fr", "backToReservations"), "Retour aux réservations");
  assert.equal(tAdmin("fr", "securityDeposit"), "Dépôt de garantie");
  assert.equal(tAdmin("fr", "upcoming"), "À venir");
});

test("other Latin-script admin translations preserve diacritics", () => {
  assert.equal(tAdmin("de", "availability"), "Verfügbarkeit");
  assert.equal(tAdmin("de", "confirm"), "Bestätigen");
  assert.equal(tAdmin("es", "latestReservations"), "Últimas reservas");
  assert.equal(tAdmin("es", "phone"), "Teléfono");
  assert.equal(tAdmin("it", "availability"), "Disponibilità");
});
