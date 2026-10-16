// Pays proposés à l'inscription et au paramétrage :
// Couverture complète de l'Afrique (54 pays), de l'Arabie / Moyen-Orient et de l'Asie du Sud,
// plus Europe et Amérique.

import type { DeviseCode } from '@/lib/currency'

export type Pays = { code: string; nom: string; indicatif: string; devise: DeviseCode }

export const PAYS: Pays[] = [
  // --- AFRIQUE : ZONE FRANC CFA (UEMOA) ---
  { code: 'SN', nom: 'Sénégal', indicatif: '221', devise: 'XOF' },
  { code: 'CI', nom: "Côte d'Ivoire", indicatif: '225', devise: 'XOF' },
  { code: 'ML', nom: 'Mali', indicatif: '223', devise: 'XOF' },
  { code: 'BF', nom: 'Burkina Faso', indicatif: '226', devise: 'XOF' },
  { code: 'BJ', nom: 'Bénin', indicatif: '229', devise: 'XOF' },
  { code: 'TG', nom: 'Togo', indicatif: '228', devise: 'XOF' },
  { code: 'NE', nom: 'Niger', indicatif: '227', devise: 'XOF' },
  { code: 'GW', nom: 'Guinée-Bissau', indicatif: '245', devise: 'XOF' },

  // --- AFRIQUE : ZONE FRANC CFA (CEMAC) ---
  { code: 'CM', nom: 'Cameroun', indicatif: '237', devise: 'XAF' },
  { code: 'GA', nom: 'Gabon', indicatif: '241', devise: 'XAF' },
  { code: 'CG', nom: 'Congo', indicatif: '242', devise: 'XAF' },
  { code: 'TD', nom: 'Tchad', indicatif: '235', devise: 'XAF' },
  { code: 'CF', nom: 'Centrafrique', indicatif: '236', devise: 'XAF' },
  { code: 'GQ', nom: 'Guinée équatoriale', indicatif: '240', devise: 'XAF' },

  // --- AFRIQUE : NORD & MAGHREB ---
  { code: 'MA', nom: 'Maroc', indicatif: '212', devise: 'MAD' },
  { code: 'MR', nom: 'Mauritanie', indicatif: '222', devise: 'MRU' },
  { code: 'DZ', nom: 'Algérie', indicatif: '213', devise: 'DZD' },
  { code: 'TN', nom: 'Tunisie', indicatif: '216', devise: 'TND' },
  { code: 'EG', nom: 'Égypte', indicatif: '20', devise: 'EGP' },
  { code: 'LY', nom: 'Libye', indicatif: '218', devise: 'USD' },

  // --- AFRIQUE : OUEST & CENTRE ---
  { code: 'GN', nom: 'Guinée', indicatif: '224', devise: 'GNF' },
  { code: 'NG', nom: 'Nigeria', indicatif: '234', devise: 'NGN' },
  { code: 'GH', nom: 'Ghana', indicatif: '233', devise: 'GHS' },
  { code: 'GM', nom: 'Gambie', indicatif: '220', devise: 'XOF' },
  { code: 'SL', nom: 'Sierra Leone', indicatif: '232', devise: 'USD' },
  { code: 'LR', nom: 'Liberia', indicatif: '231', devise: 'USD' },
  { code: 'CV', nom: 'Cap-Vert', indicatif: '238', devise: 'USD' },
  { code: 'CD', nom: 'RD Congo', indicatif: '243', devise: 'USD' },
  { code: 'ST', nom: 'Sao Tomé-et-Principe', indicatif: '239', devise: 'USD' },

  // --- AFRIQUE : EST & CORNE DE L'AFRIQUE ---
  { code: 'KE', nom: 'Kenya', indicatif: '254', devise: 'USD' },
  { code: 'TZ', nom: 'Tanzanie', indicatif: '255', devise: 'USD' },
  { code: 'UG', nom: 'Ouganda', indicatif: '256', devise: 'USD' },
  { code: 'RW', nom: 'Rwanda', indicatif: '250', devise: 'USD' },
  { code: 'BI', nom: 'Burundi', indicatif: '257', devise: 'USD' },
  { code: 'ET', nom: 'Éthiopie', indicatif: '251', devise: 'USD' },
  { code: 'ER', nom: 'Érythrée', indicatif: '291', devise: 'USD' },
  { code: 'DJ', nom: 'Djibouti', indicatif: '253', devise: 'USD' },
  { code: 'SO', nom: 'Somalie', indicatif: '252', devise: 'USD' },
  { code: 'SD', nom: 'Soudan', indicatif: '249', devise: 'USD' },
  { code: 'SS', nom: 'Soudan du Sud', indicatif: '211', devise: 'USD' },

  // --- AFRIQUE : AUSTRALE & OCÉAN INDIEN ---
  { code: 'ZA', nom: 'Afrique du Sud', indicatif: '27', devise: 'USD' },
  { code: 'AO', nom: 'Angola', indicatif: '244', devise: 'USD' },
  { code: 'MZ', nom: 'Mozambique', indicatif: '258', devise: 'USD' },
  { code: 'ZM', nom: 'Zambie', indicatif: '260', devise: 'USD' },
  { code: 'ZW', nom: 'Zimbabwe', indicatif: '263', devise: 'USD' },
  { code: 'NA', nom: 'Namibie', indicatif: '264', devise: 'USD' },
  { code: 'BW', nom: 'Botswana', indicatif: '267', devise: 'USD' },
  { code: 'MW', nom: 'Malawi', indicatif: '265', devise: 'USD' },
  { code: 'MG', nom: 'Madagascar', indicatif: '261', devise: 'USD' },
  { code: 'MU', nom: 'Maurice', indicatif: '230', devise: 'USD' },
  { code: 'KM', nom: 'Comores', indicatif: '269', devise: 'USD' },
  { code: 'SC', nom: 'Seychelles', indicatif: '248', devise: 'USD' },
  { code: 'SZ', nom: 'Eswatini', indicatif: '268', devise: 'USD' },
  { code: 'LS', nom: 'Lesotho', indicatif: '266', devise: 'USD' },

  // --- PAYS ARABES & MOYEN-ORIENT ---
  { code: 'SA', nom: 'Arabie saoudite', indicatif: '966', devise: 'SAR' },
  { code: 'AE', nom: 'Émirats arabes unis', indicatif: '971', devise: 'AED' },
  { code: 'QA', nom: 'Qatar', indicatif: '974', devise: 'QAR' },
  { code: 'KW', nom: 'Koweït', indicatif: '965', devise: 'KWD' },
  { code: 'BH', nom: 'Bahreïn', indicatif: '973', devise: 'USD' },
  { code: 'OM', nom: 'Oman', indicatif: '968', devise: 'USD' },
  { code: 'YE', nom: 'Yémen', indicatif: '967', devise: 'USD' },
  { code: 'JO', nom: 'Jordanie', indicatif: '962', devise: 'USD' },
  { code: 'LB', nom: 'Liban', indicatif: '961', devise: 'USD' },
  { code: 'SY', nom: 'Syrie', indicatif: '963', devise: 'USD' },
  { code: 'IQ', nom: 'Irak', indicatif: '964', devise: 'USD' },
  { code: 'PS', nom: 'Palestine', indicatif: '970', devise: 'USD' },

  // --- ASIE DU SUD ---
  { code: 'IN', nom: 'Inde', indicatif: '91', devise: 'INR' },
  { code: 'PK', nom: 'Pakistan', indicatif: '92', devise: 'PKR' },
  { code: 'BD', nom: 'Bangladesh', indicatif: '880', devise: 'BDT' },
  { code: 'LK', nom: 'Sri Lanka', indicatif: '94', devise: 'USD' },
  { code: 'NP', nom: 'Népal', indicatif: '977', devise: 'USD' },
  { code: 'BT', nom: 'Bhoutan', indicatif: '975', devise: 'USD' },
  { code: 'MV', nom: 'Maldives', indicatif: '960', devise: 'USD' },
  { code: 'AF', nom: 'Afghanistan', indicatif: '93', devise: 'USD' },

  // --- ZONE EURO & AMÉRIQUE ---
  { code: 'FR', nom: 'France', indicatif: '33', devise: 'EUR' },
  { code: 'BE', nom: 'Belgique', indicatif: '32', devise: 'EUR' },
  { code: 'LU', nom: 'Luxembourg', indicatif: '352', devise: 'EUR' },
  { code: 'DE', nom: 'Allemagne', indicatif: '49', devise: 'EUR' },
  { code: 'ES', nom: 'Espagne', indicatif: '34', devise: 'EUR' },
  { code: 'IT', nom: 'Italie', indicatif: '39', devise: 'EUR' },
  { code: 'PT', nom: 'Portugal', indicatif: '351', devise: 'EUR' },
  { code: 'US', nom: 'États-Unis', indicatif: '1', devise: 'USD' },
  { code: 'CA', nom: 'Canada', indicatif: '1', devise: 'USD' },
]

export const AUTRE_PAYS = 'AUTRE'

export function trouverPays(code: string | null | undefined): Pays | undefined {
  return PAYS.find((p) => p.code === code)
}

export function paieEnDollars(codePays: string | null | undefined): boolean {
  return codePays === AUTRE_PAYS
}

export function nomPays(code: string, nomAutre?: string | null): string {
  if (code === AUTRE_PAYS) return nomAutre?.trim() || 'Autre pays'
  return trouverPays(code)?.nom ?? code
}

export const PAYS_PAR_DEFAUT = 'SN'
