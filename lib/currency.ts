// Devise de travail d'un GIE / Exploitation — un seul code par exploitation,
// pas de comptabilité multi-devises avec taux de change. Point d'entrée unique
// pour tout affichage de montant : respecte le nombre de décimales et le symbole
// de la devise choisie (Afrique, Monde Arabe, Asie du Sud, Europe, Amériques).

export type DeviseCode = 
  | 'XOF' 
  | 'XAF' 
  | 'MRU' 
  | 'MAD' 
  | 'GNF' 
  | 'DZD' 
  | 'TND' 
  | 'EGP' 
  | 'NGN' 
  | 'GHS' 
  | 'SAR' 
  | 'AED' 
  | 'QAR'
  | 'KWD'
  | 'INR' 
  | 'PKR' 
  | 'BDT' 
  | 'EUR' 
  | 'USD' 
  | 'AUCUNE'

export const DEVISES: Record<DeviseCode, { label: string; symbole: string; decimales: number }> = {
  // Afrique de l'Ouest & Centrale (Franc CFA)
  XOF: { label: 'Franc CFA — BCEAO (XOF)', symbole: 'FCFA', decimales: 0 },
  XAF: { label: 'Franc CFA — BEAC (XAF)', symbole: 'FCFA', decimales: 0 },
  GNF: { label: 'Franc guinéen (GNF)', symbole: 'GNF', decimales: 0 },
  NGN: { label: 'Naira nigérian (NGN)', symbole: '₦', decimales: 2 },
  GHS: { label: 'Cedi ghanéen (GHS)', symbole: 'GH₵', decimales: 2 },
  
  // Afrique du Nord & Maghreb
  MAD: { label: 'Dirham marocain (MAD)', symbole: 'MAD', decimales: 2 },
  MRU: { label: 'Ouguiya mauritanien (MRU)', symbole: 'MRU', decimales: 2 },
  DZD: { label: 'Dinar algérien (DZD)', symbole: 'DZD', decimales: 2 },
  TND: { label: 'Dinar tunisien (TND)', symbole: 'TND', decimales: 3 },
  EGP: { label: 'Livre égyptienne (EGP)', symbole: 'EGP', decimales: 2 },

  // Arabie & Moyen-Orient
  SAR: { label: 'Riyal saoudien (SAR)', symbole: 'SAR', decimales: 2 },
  AED: { label: 'Dirham des ÉAU (AED)', symbole: 'AED', decimales: 2 },
  QAR: { label: 'Riyal qatari (QAR)', symbole: 'QAR', decimales: 2 },
  KWD: { label: 'Dinar koweïtien (KWD)', symbole: 'KWD', decimales: 3 },

  // Asie du Sud
  INR: { label: 'Roupie indienne (INR)', symbole: '₹', decimales: 2 },
  PKR: { label: 'Roupie pakistanaise (PKR)', symbole: 'Rs', decimales: 2 },
  BDT: { label: 'Taka bangladais (BDT)', symbole: '৳', decimales: 2 },

  // International
  EUR: { label: 'Euro (EUR)', symbole: '€', decimales: 2 },
  USD: { label: 'Dollar US (USD)', symbole: '$', decimales: 2 },
  AUCUNE: { label: 'Sans unité (autre pays)', symbole: '', decimales: 2 },
}

export const DEVISE_PAR_DEFAUT: DeviseCode = 'XOF'

export function estDeviseValide(v: string | null | undefined): v is DeviseCode {
  return !!v && v in DEVISES
}

export function formatMontant(valeur: number | null | undefined, devise?: string | null): string {
  const code = estDeviseValide(devise) ? devise : DEVISE_PAR_DEFAUT
  const info = DEVISES[code] || DEVISES[DEVISE_PAR_DEFAUT]
  const nombre = Number(valeur ?? 0).toLocaleString('fr-FR', {
    minimumFractionDigits: info.decimales,
    maximumFractionDigits: info.decimales,
  })
  return info.symbole ? `${nombre} ${info.symbole}` : nombre
}

/** Unité à accoler à un montant déjà formaté : « 12 500 FCFA », ou rien pour un GIE sans unité (autre pays). */
export function uniteMontant(devise?: string | null): string {
  const code = estDeviseValide(devise) ? devise : DEVISE_PAR_DEFAUT
  const symbole = (DEVISES[code] || DEVISES[DEVISE_PAR_DEFAUT]).symbole
  return symbole ? ` ${symbole}` : ''
}
