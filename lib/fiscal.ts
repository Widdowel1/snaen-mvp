export const MARGES_FORFAITAIRES: Record<string, number> = {
  DROPSHIPPING:  0.25,
  ECOMMERCE:     0.25,
  FREELANCE:     0.70,
  INFLUENCE:     0.80,
  CONTENU:       0.80,
  FORMATION:     0.75,
  COACHING:      0.75,
  TRADING:       1.00,
  CRYPTOACTIFS:  1.00,
  DEVELOPPEMENT: 0.65,
  AUTRE:         0.60,
}

export const TRANCHES_IMPOSITION = [
  { min: 0,        max: 600000,   taux: 0.00, libelle: 'Seuil de tolérance' },
  { min: 600001,   max: 3000000,  taux: 0.05, libelle: 'Micro-opérateur' },
  { min: 3000001,  max: 10000000, taux: 0.10, libelle: 'Opérateur standard' },
  { min: 10000001, max: 30000000, taux: 0.15, libelle: 'Opérateur confirmé' },
  { min: 30000001, max: Infinity, taux: 0.20, libelle: 'Opérateur senior' },
]

export const REDUCTIONS_NIVEAU: Record<string, number> = {
  STARTER:  0.00,
  BUILDER:  0.10,
  ACHIEVER: 0.15,
  CHAMPION: 0.20,
  ELITE:    0.25,
}

export function calculerImpot(params: {
  caTotal: number
  depensesValidees: number
  secteur: string
  niveau: string
}) {
  const { caTotal, depensesValidees, secteur, niveau } = params

  let beneficeNet: number
  let regime: 'BENEFICE_REEL' | 'FORFAIT_SECTORIEL'

  if (depensesValidees > 0 && depensesValidees / caTotal > 0.20) {
    beneficeNet = caTotal - depensesValidees
    regime = 'BENEFICE_REEL'
  } else {
    const marge = MARGES_FORFAITAIRES[secteur] ?? 0.60
    beneficeNet = caTotal * marge
    regime = 'FORFAIT_SECTORIEL'
  }

  const beneficeAnnuel = beneficeNet * 12
  const tranche = TRANCHES_IMPOSITION.find(
    t => beneficeAnnuel >= t.min && beneficeAnnuel <= t.max
  ) ?? TRANCHES_IMPOSITION[0]

  const impotCalcule = beneficeNet * tranche.taux
  const reductionNiveau = REDUCTIONS_NIVEAU[niveau] ?? 0
  const impotFinal = impotCalcule * (1 - reductionNiveau)

  return {
    beneficeNet: Math.round(beneficeNet),
    regime,
    tauxApplique: tranche.taux,
    impotCalcule: Math.round(impotCalcule),
    reductionNiveau,
    impotFinal: Math.round(impotFinal),
    libelleTranche: tranche.libelle,
  }
}

export function calculerNiveau(params: { caAnnuel: number; moisConformite: number }): string {
  const { caAnnuel, moisConformite } = params
  if (moisConformite >= 36 && caAnnuel >= 50000000) return 'ELITE'
  if (moisConformite >= 24 && caAnnuel >= 20000000) return 'CHAMPION'
  if (moisConformite >= 12 && caAnnuel >= 5000000)  return 'ACHIEVER'
  if (moisConformite >= 6  && caAnnuel >= 1000000)  return 'BUILDER'
  return 'STARTER'
}

export function formatFCFA(montant: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(montant)) + ' FCFA'
}
