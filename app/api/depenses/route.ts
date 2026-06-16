import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  try {
    const depenses = await prisma.depense.findMany({
      where: { operateurId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({
      depenses: depenses.map(d => ({
        ...d,
        montant: Number(d.montant),
        montantXof: Number(d.montantXof),
      })),
    })
  } catch (err: any) {
    console.error('[depenses-get] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  try {
    const body = await req.json()
    const { dateDepense, categorie, description, montant, devise, fournisseurNom, fournisseurIfu, justificatifType } = body

    if (!dateDepense || !categorie || !montant) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
    }

    const montantNum = parseFloat(montant)
    const montantXof = montantNum // En MVP, on considère tout en XOF

    // Auto-validation pour certaines catégories
    const autoValidees = ['PUB_META', 'PUB_GOOGLE', 'ABONNEMENT_OUTIL']
    const statutValidation = autoValidees.includes(categorie) ? 'AUTO_VALIDEE' : 'EN_ATTENTE'

    const depense = await prisma.depense.create({
      data: {
        operateurId: user.id,
        dateDepense: new Date(dateDepense),
        categorie,
        description: description || null,
        montant: montantNum,
        montantXof,
        devise: devise || 'XOF',
        fournisseurNom: fournisseurNom || null,
        fournisseurIfu: fournisseurIfu || null,
        justificatifType: justificatifType || null,
        statutValidation,
      },
    })

    return NextResponse.json({
      success: true,
      depense: { ...depense, montant: Number(depense.montant), montantXof: Number(depense.montantXof) },
    }, { status: 201 })
  } catch (err: any) {
    console.error('[depenses-post] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
