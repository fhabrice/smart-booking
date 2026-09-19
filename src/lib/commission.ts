/**
 * Commission interne de la plateforme — Smart Booking RDC
 * ---------------------------------------------------------------------------
 * RÈGLE MÉTIER (interne, à ne jamais afficher dans l'interface) :
 *
 *   Quand un client règle une réservation, le paiement part DIRECTEMENT sur
 *   le numéro de paiement / le compte que le prestataire a fourni lors de
 *   son inscription (`ProviderAccount.payoutMethod` + `payoutNumber`).
 *
 *   Sur chaque paiement, la plateforme prélève une commission de service de
 *   `PLATFORM_COMMISSION_RATE` (4 %) ; le solde (96 %) revient au prestataire.
 *
 *   Les comptes de collecte de la plateforme ne figurent volontairement PAS
 *   dans ce module (ni dans aucun code livré au navigateur) : ils sont
 *   enregistrés côté base de données uniquement — table `platform_accounts`
 *   de `supabase-schema.sql`, protégée par RLS (accès rôle service/admin).
 *   Ne jamais les rendre côté client ni les afficher sur la plateforme.
 */

/** Taux de commission de service prélevé sur chaque paiement (4 %). */
export const PLATFORM_COMMISSION_RATE = 0.04

export interface PaymentSplit {
  /** Part de commission plateforme en USD (arrondie au dollar le plus proche). */
  platformFeeUSD: number
  /** Part nette reversée au prestataire en USD. */
  providerNetUSD: number
}

/**
 * Répartition d'un paiement (acompte ou solde) entre la plateforme et le
 * prestataire. Calcul montant entier, déterministe :
 *   commission = round(montant × 4 %), net = montant − commission.
 */
export function splitPayment(amountUSD: number): PaymentSplit {
  const safe = Number.isFinite(amountUSD) && amountUSD > 0 ? amountUSD : 0
  const platformFeeUSD = Math.round(safe * PLATFORM_COMMISSION_RATE)
  return { platformFeeUSD, providerNetUSD: safe - platformFeeUSD }
}

/** Compte de réception des paiements déclaré par un prestataire. */
export interface PaymentDestination {
  method?: string
  number?: string
}

/**
 * Résout le compte sur lequel le client doit verser le paiement :
 * le numéro de paiement fourni à l'inscription, sinon le téléphone du compte.
 */
export function resolvePaymentDestination(account?: {
  payoutMethod?: string
  payoutNumber?: string
  phone?: string
}): PaymentDestination {
  if (!account) return {}
  if (account.payoutNumber?.trim()) {
    return { method: account.payoutMethod, number: account.payoutNumber.trim() }
  }
  if (account.phone?.trim()) {
    return { method: account.payoutMethod ?? "Mobile Money", number: account.phone.trim() }
  }
  return {}
}
