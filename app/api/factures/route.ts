import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

function generateNumeroFacture(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `FAC-${year}-${random}`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  const { searchParams } = new URL(req.url)
  const statut = searchParams.get('statut')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  try {
    const where: any = { operateurId: user.id }
    if (statut && statut !== 'TOUS') where.statut = statut

    const [factures, total] = await Promise.all([
      prisma.facture.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.facture.count({ where }),
    ])

    return NextResponse.json({
      factures: factures.map(f => ({
        ...f,
        montantHT: Number(f.montantHT),
        tva: Number(f.tva),
        montantTTC: Number(f.montantTTC),
      })),
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (err: any) {
    console.error('[factures-get] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  try {
    const body = await req.json()
    const {
      clientNom, clientEmail, clientTelephone, clientIfu,
      lignes, dateEcheance, modeLivraison,
    } = body

    if (!clientNom || !lignes || lignes.length === 0) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
    }

    // Calcul montants
    let montantHT = 0
    for (const ligne of lignes) {
      montantHT += (ligne.quantite || 1) * (ligne.prixUnitaire || 0)
    }
    const tvaRate = 0 // TVA 0% pour micro-opérateurs DNEN
    const tva = montantHT * tvaRate
    const montantTTC = montantHT + tva

    const numero = generateNumeroFacture()

    const facture = await prisma.facture.create({
      data: {
        numero,
        operateurId: user.id,
        clientNom,
        clientEmail: clientEmail || null,
        clientTelephone: clientTelephone || null,
        clientIfu: clientIfu || null,
        dateEmission: new Date(),
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
        lignes,
        montantHT,
        tva,
        montantTTC,
        statut: 'EMISE',
        modeLivraison: modeLivraison || [],
      },
    })

    return NextResponse.json({
      success: true,
      facture: {
        ...facture,
        montantHT: Number(facture.montantHT),
        tva: Number(facture.tva),
        montantTTC: Number(facture.montantTTC),
      },
    }, { status: 201 })
  } catch (err: any) {
    console.error('[factures-post] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
