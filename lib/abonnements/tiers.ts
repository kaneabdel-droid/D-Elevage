export type TierElevage = 'standard' | 'medium' | 'premium'

export interface ForfaitInfo {
  id: TierElevage
  nom: string
  prixMensuelFcfa: number
  prixAnnuelFcfa: number
  quotaUtilisateurs: number
  modulesInclus: string[]
  description: string
}

export const FORFAITS_ELEVAGE: Record<TierElevage, ForfaitInfo> = {
  standard: {
    id: 'standard',
    nom: 'Standard',
    prixMensuelFcfa: 5000,
    prixAnnuelFcfa: 50000,
    quotaUtilisateurs: 3, // 1 Admin + 2 Utilisateurs
    description: 'Gestion essentielle de l’atelier d’élevage et du suivi de troupeau',
    modulesInclus: [
      'Bandes & Sujets en cohortes',
      'Stocks d’aliments & médicaments',
      'Alertes de latence médicale',
      'Suivi quotidien des mortalités & ponte',
      'Achats, ventes & dépenses de base',
      'Jusqu’à 3 utilisateurs',
    ],
  },
  medium: {
    id: 'medium',
    nom: 'Médium',
    prixMensuelFcfa: 10000,
    prixAnnuelFcfa: 100000,
    quotaUtilisateurs: 5, // 1 Admin + 4 Utilisateurs
    description: 'Pour fermes structurées avec gestion des parcs et prévisions',
    modulesInclus: [
      'Tout le forfait Standard',
      'Bâtiments, enclos & capacités d’accueil',
      'Suivi généalogique & identification par boucle',
      'Gestion des équipements & matériels d’élevage',
      'Prévisions de production',
      'Jusqu’à 5 utilisateurs',
    ],
  },
  premium: {
    id: 'premium',
    nom: 'Prémium Agro-Pastoral',
    prixMensuelFcfa: 15000,
    prixAnnuelFcfa: 150000,
    quotaUtilisateurs: 7, // 1 Admin + 6 Utilisateurs
    description: 'Gestion agro-pastorale complète : élevage + volet végétal intégré',
    modulesInclus: [
      'Tout le forfait Médium',
      'Volet végétal complet : parcelles maraîchères, fruitières, fourragères',
      'Suivi des productions, récoltes, variétés & calendrier cultural',
      'Stocks de récoltes, semences & alimentation fourragère du cheptel',
      'Ventes végétales, facturation & reçus de vente',
      'Indice de Consommation (IC) par bande & marges nettes',
      'Comptabilité analytique & Trésorerie multi-comptes',
      'Jusqu’à 7 utilisateurs & Support prioritaire 7j/7',
    ],
  },
}
