import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nom, prenom, email, telephone, secteur, motDePasse, ifu, lan, cniUrl } = body

    if (!nom || !prenom || !email || !telephone || !secteur || !motDePasse || !lan) {
      return NextResponse.json({ success: false, message: 'Champs obligatoires manquants.' }, { status: 400 })
    }

    const existing = await prisma.operateur.findFirst({
      where: { OR: [{ email }, { telephone }] },
    })
    if (existing) {
      return NextResponse.json({ success: false, message: 'Cet email ou téléphone est déjà utilisé.' }, { status: 409 })
    }

    const hash = await bcrypt.hash(motDePasse, 12)

    const operateur = await prisma.operateur.create({
      data: {
        nom: nom.toUpperCase(),
        prenom,
        email: email.toLowerCase(),
        telephone,
        secteur,
        motDePasse: hash,
        ifu: ifu || null,
        lan,
        statut: 'EN_ATTENTE',
        role: 'OPERATEUR',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie.',
      lan: operateur.lan,
      id: operateur.id,
    })
  } catch (err: any) {
    console.error('[register] error:', err)
    return NextResponse.json({ success: false, message: 'Erreur serveur.' }, { status: 500 })
  }
}
