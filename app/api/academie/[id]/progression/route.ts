import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: formationId } = await params
  const user = session.user as any
  const operateurId: string = user.id

  let body: { progressionPct?: number; termine?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { progressionPct, termine } = body

  if (progressionPct !== undefined && (typeof progressionPct !== 'number' || progressionPct < 0 || progressionPct > 100)) {
    return NextResponse.json({ error: 'progressionPct doit être un entier entre 0 et 100' }, { status: 400 })
  }

  // Verify formation exists
  const formation = await prisma.formation.findUnique({ where: { id: formationId } })
  if (!formation) {
    return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 })
  }

  // Upsert progression
  const existing = await prisma.progressionFormation.findFirst({
    where: { operateurId, formationId },
  })

  let progression
  if (existing) {
    progression = await prisma.progressionFormation.update({
      where: { id: existing.id },
      data: {
        ...(progressionPct !== undefined ? { progressionPct } : {}),
        ...(termine !== undefined ? { termine } : {}),
        ...(termine === true ? { dateFin: new Date() } : {}),
      },
    })
  } else {
    progression = await prisma.progressionFormation.create({
      data: {
        operateurId,
        formationId,
        progressionPct: progressionPct ?? 0,
        termine: termine ?? false,
        dateDebut: new Date(),
        ...(termine === true ? { dateFin: new Date() } : {}),
      },
    })
  }

  return NextResponse.json({ success: true, progression })
}
