import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  try {
    const operateur = await prisma.operateur.findUnique({
      where: { id: user.id },
      include: {
        declarations: { select: { statut: true } },
        factures: { select: { statut: true } },
      },
    })

    if (!operateur) {
      return NextResponse.json({ error: 'Opérateur non trouvé' }, { status: 404 })
    }

    // Calcul score de conformité
    const totalDeclarations = operateur.declarations.length
    const declarationsPayees = operateur.declarations.filter((d) => d.statut === 'PAYEE').length
    const totalFactures = operateur.factures.length
    const facturesPayees = operateur.factures.filter((f) => f.statut === 'PAYEE').length

    let score = operateur.scoreConformite
    if (totalDeclarations > 0 || totalFactures > 0) {
      const scoreDeclarations = totalDeclarations > 0 ? Math.round((declarationsPayees / totalDeclarations) * 50) : 50
      const scoreFactures = totalFactures > 0 ? Math.round((facturesPayees / Math.max(totalFactures, 1)) * 30) : 30
      const scoreBase = operateur.statut === 'ACTIF' ? 20 : 0
      score = scoreDeclarations + scoreFactures + scoreBase
    }

    return NextResponse.json({
      id: operateur.id,
      nom: operateur.nom,
      prenom: operateur.prenom,
      email: operateur.email,
      telephone: operateur.telephone,
      ifu: operateur.ifu,
      lan: operateur.lan,
      secteur: operateur.secteur,
      niveau: operateur.niveau,
      statut: operateur.statut,
      ville: (operateur as any).ville ?? null,
      quartier: (operateur as any).quartier ?? null,
      description: (operateur as any).description ?? null,
      dateInscription: operateur.dateInscription.toISOString(),
      scoreConformite: score,
      stats: {
        totalDeclarations,
        declarationsPayees,
        totalFactures,
        facturesPayees,
      },
    })
  } catch (err) {
    console.error('[profile-get] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  try {
    const body = await req.json()

    // Seuls les champs non critiques sont modifiables
    const allowedFields: Record<string, unknown> = {}
    if (typeof body.telephone === 'string' && body.telephone.trim()) {
      allowedFields.telephone = body.telephone.trim()
    }
    if (typeof body.ville === 'string') {
      allowedFields.ville = body.ville.trim() || null
    }
    if (typeof body.quartier === 'string') {
      allowedFields.quartier = body.quartier.trim() || null
    }
    if (typeof body.description === 'string') {
      allowedFields.description = body.description.trim() || null
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json({ error: 'Aucun champ modifiable fourni' }, { status: 400 })
    }

    const updated = await prisma.operateur.update({
      where: { id: user.id },
      data: allowedFields as any,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        ifu: true,
        lan: true,
        secteur: true,
        niveau: true,
        statut: true,
      },
    })

    return NextResponse.json({ success: true, operateur: updated })
  } catch (err: any) {
    console.error('[profile-patch] error:', err)
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Ce numéro de téléphone est déjà utilisé' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
