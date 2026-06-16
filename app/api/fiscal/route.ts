import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calculerImpot } from '@/lib/fiscal'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  try {
    const operateur = await prisma.operateur.findUnique({ where: { id: user.id } })
    if (!operateur) return NextResponse.json({ error: 'Opérateur introuvable' }, { status: 404 })

    // Historique 6 mois
    const historique = []
    const now = new Date()

    for (let i = 0; i < 6; i++) {
      const debut = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fin = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const periode = `${debut.getFullYear()}-${String(debut.getMonth() + 1).padStart(2, '0')}`

      const factures = await prisma.facture.findMany({
        where: { operateurId: user.id, statut: { in: ['EMISE', 'PAYEE'] }, dateEmission: { gte: debut, lte: fin } },
      })
      const depenses = await prisma.depense.findMany({
        where: { operateurId: user.id, dateDepense: { gte: debut, lte: fin }, statutValidation: { in: ['AUTO_VALIDEE', 'VALIDEE'] } },
      })

      const caTotal = factures.reduce((s, f) => s + Number(f.montantTTC), 0)
      const depensesValidees = depenses.reduce((s, d) => s + Number(d.montantXof), 0)
      const fiscal = calculerImpot({ caTotal, depensesValidees, secteur: operateur.secteur, niveau: operateur.niveau })

      // Récupérer la déclaration existante si elle existe
      const declaration = await prisma.declarationFiscale.findFirst({
        where: { operateurId: user.id, periode },
      })

      historique.push({
        periode,
        label: debut.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }),
        caTotal,
        depensesValidees,
        ...fiscal,
        statut: declaration?.statut || (i === 0 ? 'CALCULEE' : caTotal > 0 ? 'PAYEE' : 'CALCULEE'),
        dateLimite: new Date(debut.getFullYear(), debut.getMonth() + 2, 15).toISOString(),
        datePaiement: declaration?.datePaiement?.toISOString() || null,
        declarationId: declaration?.id || null,
      })
    }

    return NextResponse.json({ historique, operateur: { secteur: operateur.secteur, niveau: operateur.niveau } })
  } catch (err: any) {
    console.error('[fiscal-get] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  try {
    const { periode, modePaiement } = await req.json()

    // Simuler le paiement
    await new Promise(r => setTimeout(r, 500))

    const now = new Date()
    const [year, month] = periode.split('-').map(Number)
    const debut = new Date(year, month - 1, 1)
    const fin = new Date(year, month, 0, 23, 59, 59)
    const dateLimite = new Date(year, month + 1, 15)

    const operateur = await prisma.operateur.findUnique({ where: { id: user.id } })
    if (!operateur) return NextResponse.json({ error: 'Opérateur introuvable' }, { status: 404 })

    const factures = await prisma.facture.findMany({
      where: { operateurId: user.id, statut: { in: ['EMISE', 'PAYEE'] }, dateEmission: { gte: debut, lte: fin } },
    })
    const depenses = await prisma.depense.findMany({
      where: { operateurId: user.id, dateDepense: { gte: debut, lte: fin }, statutValidation: { in: ['AUTO_VALIDEE', 'VALIDEE'] } },
    })

    const caTotal = factures.reduce((s, f) => s + Number(f.montantTTC), 0)
    const depensesValidees = depenses.reduce((s, d) => s + Number(d.montantXof), 0)
    const fiscal = calculerImpot({ caTotal, depensesValidees, secteur: operateur.secteur, niveau: operateur.niveau })

    // Upsert déclaration
    const existing = await prisma.declarationFiscale.findFirst({ where: { operateurId: user.id, periode } })
    let declarationId: string

    if (existing) {
      await prisma.declarationFiscale.update({
        where: { id: existing.id },
        data: { statut: 'PAYEE', datePaiement: now },
      })
      declarationId = existing.id
    } else {
      const created = await prisma.declarationFiscale.create({
        data: {
          operateurId: user.id,
          periode,
          caTotal,
          depensesValidees,
          beneficeNet: fiscal.beneficeNet,
          tauxApplique: fiscal.tauxApplique,
          regime: fiscal.regime,
          impotCalcule: fiscal.impotCalcule,
          reductionNiveau: fiscal.reductionNiveau,
          impotFinal: fiscal.impotFinal,
          statut: 'PAYEE',
          dateLimite,
          datePaiement: now,
        },
      })
      declarationId = created.id
    }

    return NextResponse.json({
      success: true,
      message: `Paiement de ${new Intl.NumberFormat('fr-FR').format(fiscal.impotFinal)} FCFA simulé via ${modePaiement}`,
      reference: 'SNAEN-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      declarationId,
    })
  } catch (err: any) {
    console.error('[fiscal-post] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
