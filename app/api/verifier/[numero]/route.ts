import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params

  try {
    const facture = await prisma.facture.findFirst({
      where: { numero },
      include: { operateur: true },
    })

    if (!facture) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      facture: {
        id: facture.id,
        numero: facture.numero,
        dateEmission: facture.dateEmission.toISOString(),
        montantTTC: Number(facture.montantTTC),
        statut: facture.statut,
        clientNom: facture.clientNom,
        clientEmail: facture.clientEmail,
        operateur: {
          nom: facture.operateur.nom,
          prenom: facture.operateur.prenom,
          lan: facture.operateur.lan,
          ifu: facture.operateur.ifu,
          email: facture.operateur.email,
        },
      },
    })
  } catch (err) {
    console.error('[verifier-get] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
