/**
 * Cancellation and retention rules from the Conditions Générales de Vente.
 *
 * Article 2  - Réservation et paiement
 *   Balance due at the latest 15 days before arrival. On non-payment the
 *   owner may cancel "sans remboursement des sommes déjà versées".
 *
 * Article 9  - Annulation
 *   Annulation par le locataire:
 *     - Plus de 60 jours avant l'arrivée      : retenue de l'acompte
 *     - Entre 60 et 15 jours avant l'arrivée  : 50 % du montant du séjour
 *     - Moins de 15 jours / non-présentation  : 100 % du montant du séjour
 *   Annulation par le loueur (force majeure):
 *     - report du séjour ou remboursement des sommes versées
 *
 * Every function here is pure so the rules stay testable and auditable.
 * Amounts are integer cents throughout; never introduce floats.
 */

/** Article 2: the balance falls due this many days before arrival. */
export const BALANCE_DUE_DAYS_BEFORE_ARRIVAL = 15;

/** Article 9 tier boundaries, in days before arrival. */
export const CANCELLATION_EARLY_TIER_DAYS = 60;
export const CANCELLATION_LATE_TIER_DAYS = 15;

/** Article 9 retention rate for the 60-15 day tier. */
export const CANCELLATION_MID_TIER_RATE = 0.5;

/** Identifier stored on reservation events so retention decisions stay auditable. */
export const CANCELLATION_POLICY_VERSION = "cgv-2026-article-9";

export type CancellationTier =
  | "OVER_60_DAYS"
  | "BETWEEN_60_AND_15_DAYS"
  | "UNDER_15_DAYS";

export type CancellationCause =
  /** Article 9, annulation par le locataire - the sliding scale applies. */
  | "CUSTOMER"
  /** Article 2, balance unpaid - all sums already paid are retained. */
  | "BALANCE_UNPAID"
  /** Article 9, annulation par le loueur - everything paid is refunded. */
  | "OWNER_FORCE_MAJEURE";

export type RetentionBasis =
  | "DEPOSIT"
  | "HALF_OF_STAY"
  | "FULL_STAY"
  | "ALL_SUMS_PAID"
  | "NONE";

export interface RetentionInput {
  cause: CancellationCause;
  /** Start of the arrival day. */
  arrivalDate: Date;
  /** Moment the cancellation is recorded. */
  now: Date;
  /** Stay total in cents. Excludes the caution, which is never part of it. */
  totalAmountTtcCents: number;
  /** The acompte snapshot stored on the reservation (Article 2: 50%). */
  depositAmountCents: number;
  /** Sums already received for the stay, in cents. */
  paidAmountCents: number;
}

export interface RetentionOutcome {
  tier: CancellationTier;
  basis: RetentionBasis;
  /** Days between `now` and arrival; negative once arrival has passed. */
  daysUntilArrival: number;
  /** What the CGV entitles the owner to keep, before capping by sums paid. */
  entitlementCents: number;
  /** What is actually kept: the entitlement capped by what was paid. */
  retainedCents: number;
  /** What must be returned to the customer. */
  refundableCents: number;
  /**
   * Entitlement not covered by sums already paid. Article 9 can leave the
   * customer owing money (e.g. cancelling inside 15 days having paid only the
   * acompte). Surfaced for the admin; never auto-charged.
   */
  outstandingCents: number;
  policyVersion: string;
}

const DAY_MS = 86_400_000;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Whole days from `now` to `arrivalDate`, compared date-to-date so a
 * cancellation at 23:00 counts the same as one at 08:00 on the same day.
 * Negative once arrival has passed (no-show).
 */
export function getDaysUntilArrival(arrivalDate: Date, now: Date) {
  return Math.round(
    (startOfDay(arrivalDate).getTime() - startOfDay(now).getTime()) / DAY_MS
  );
}

/**
 * Article 9 tier. Boundaries read inclusively in the customer's favour:
 * exactly 60 days out is "plus de 60 jours", exactly 15 days out falls in the
 * "entre 60 et 15 jours" band rather than the 100% band.
 */
export function getCancellationTier(daysUntilArrival: number): CancellationTier {
  if (daysUntilArrival >= CANCELLATION_EARLY_TIER_DAYS) {
    return "OVER_60_DAYS";
  }

  if (daysUntilArrival >= CANCELLATION_LATE_TIER_DAYS) {
    return "BETWEEN_60_AND_15_DAYS";
  }

  return "UNDER_15_DAYS";
}

function getCustomerEntitlement(
  tier: CancellationTier,
  input: Pick<RetentionInput, "totalAmountTtcCents" | "depositAmountCents">
): { entitlementCents: number; basis: RetentionBasis } {
  switch (tier) {
    case "OVER_60_DAYS":
      // "retenue de l'acompte" - the stored acompte, not a recomputed rate,
      // so historic reservations keep the terms they were sold under.
      return {
        entitlementCents: Math.min(
          input.depositAmountCents,
          input.totalAmountTtcCents
        ),
        basis: "DEPOSIT",
      };
    case "BETWEEN_60_AND_15_DAYS":
      return {
        entitlementCents: Math.round(
          input.totalAmountTtcCents * CANCELLATION_MID_TIER_RATE
        ),
        basis: "HALF_OF_STAY",
      };
    case "UNDER_15_DAYS":
      return {
        entitlementCents: input.totalAmountTtcCents,
        basis: "FULL_STAY",
      };
  }
}

/**
 * Resolve what is retained and what must be refunded for a cancellation.
 * Pure: callers persist the result, this decides nothing about money movement.
 */
export function calculateRetention(input: RetentionInput): RetentionOutcome {
  const daysUntilArrival = getDaysUntilArrival(input.arrivalDate, input.now);
  const tier = getCancellationTier(daysUntilArrival);
  const paidAmountCents = Math.max(0, input.paidAmountCents);

  let entitlementCents: number;
  let basis: RetentionBasis;

  switch (input.cause) {
    case "OWNER_FORCE_MAJEURE":
      // Article 9: "rembourser les sommes versées, sans autre indemnité."
      entitlementCents = 0;
      basis = "NONE";
      break;
    case "BALANCE_UNPAID":
      // Article 2: "sans remboursement des sommes déjà versées."
      entitlementCents = paidAmountCents;
      basis = "ALL_SUMS_PAID";
      break;
    case "CUSTOMER": {
      const resolved = getCustomerEntitlement(tier, input);
      entitlementCents = resolved.entitlementCents;
      basis = resolved.basis;
      break;
    }
  }

  const retainedCents = Math.min(entitlementCents, paidAmountCents);

  return {
    tier,
    basis,
    daysUntilArrival,
    entitlementCents,
    retainedCents,
    refundableCents: paidAmountCents - retainedCents,
    outstandingCents: Math.max(0, entitlementCents - paidAmountCents),
    policyVersion: CANCELLATION_POLICY_VERSION,
  };
}

/**
 * Article 2: the balance is overdue once the 15-day mark has passed and the
 * stay is not fully paid. Gate for the owner's right to cancel without refund.
 */
export function isBalanceOverdue({
  arrivalDate,
  now,
  totalAmountTtcCents,
  paidAmountCents,
}: {
  arrivalDate: Date;
  now: Date;
  totalAmountTtcCents: number;
  paidAmountCents: number;
}) {
  if (paidAmountCents >= totalAmountTtcCents) {
    return false;
  }

  return (
    getDaysUntilArrival(arrivalDate, now) < BALANCE_DUE_DAYS_BEFORE_ARRIVAL
  );
}
