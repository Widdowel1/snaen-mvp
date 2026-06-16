import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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
    let dateDepense: string
    let categorie: string
    let description: string | undefined
    let montant: string
    let devise: string | undefined
    let fournisseurNom: string | undefined
    let fournisseurIfu: string | undefined
    let justificatifType: string | undefined
    let justificatifUrl: string | undefined

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      dateDepense = formData.get('dateDepense') as string
      categorie = formData.get('categorie') as string
      description = formData.get('description') as string || undefined
      montant = formData.get('montant') as string
      devise = formData.get('devise') as string || undefined
      fournisseurNom = formData.get('fournisseurNom') as string || undefined
      fournisseurIfu = formData.get('fournisseurIfu') as string || undefined
      justificatifType = formData.get('justificatifType') as string || undefined

      // Gestion upload fichier
      const file = formData.get('justificatif') as File | null
      if (file && file.size > 0) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'justificatifs')
        await mkdir(uploadDir, { recursive: true })

        const ext = file.name.split('.').pop() || 'bin'
        const filename = `${user.id}-${Date.now()}.${ext}`
        const filepath = path.join(uploadDir, filename)

        const bytes = await file.arrayBuffer()
        await writeFile(filepath, Buffer.from(bytes))
        justificatifUrl = `/uploads/justificatifs/${filename}`
      }
    } else {
      const body = await req.json()
      dateDepense = body.dateDepense
      categorie = body.categorie
      description = body.description
      montant = body.montant
      devise = body.devise
      fournisseurNom = body.fournisseurNom
      fournisseurIfu = body.fournisseurIfu
      justificatifType = body.justificatifType
    }

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
        categorie: categorie as any,
        description: description || null,
        montant: montantNum,
        montantXof,
        devise: devise || 'XOF',
        fournisseurNom: fournisseurNom || null,
        fournisseurIfu: fournisseurIfu || null,
        justificatifType: (justificatifType || null) as any,
        justificatifUrl: justificatifUrl || null,
        statutValidation: statutValidation as any,
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
