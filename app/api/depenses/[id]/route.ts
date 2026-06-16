import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  return `data:${file.type};base64,${base64}`
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  try {
    const existing = await prisma.depense.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Dépense introuvable' }, { status: 404 })
    if (existing.operateurId !== user.id) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

    const contentType = req.headers.get('content-type') || ''
    let dateDepense: string | undefined
    let categorie: string | undefined
    let description: string | undefined
    let montant: string | undefined
    let fournisseurNom: string | undefined
    let fournisseurIfu: string | undefined
    let justificatifType: string | undefined
    let justificatifUrl: string | undefined = existing.justificatifUrl || undefined

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      dateDepense = formData.get('dateDepense') as string || undefined
      categorie = formData.get('categorie') as string || undefined
      description = formData.get('description') as string || undefined
      montant = formData.get('montant') as string || undefined
      fournisseurNom = formData.get('fournisseurNom') as string || undefined
      fournisseurIfu = formData.get('fournisseurIfu') as string || undefined
      justificatifType = formData.get('justificatifType') as string || undefined

      const file = formData.get('justificatif') as File | null
      if (file && file.size > 0) {
        justificatifUrl = await fileToDataUrl(file)
      }
    } else {
      const body = await req.json()
      dateDepense = body.dateDepense
      categorie = body.categorie
      description = body.description
      montant = body.montant
      fournisseurNom = body.fournisseurNom
      fournisseurIfu = body.fournisseurIfu
      justificatifType = body.justificatifType
    }

    const montantNum = montant ? parseFloat(montant) : Number(existing.montant)
    const autoValidees = ['PUB_META', 'PUB_GOOGLE', 'ABONNEMENT_OUTIL']
    const statutValidation = (categorie && autoValidees.includes(categorie)) ? 'AUTO_VALIDEE' : 'EN_ATTENTE'

    const updated = await prisma.depense.update({
      where: { id },
      data: {
        dateDepense: dateDepense ? new Date(dateDepense) : existing.dateDepense,
        categorie: (categorie || existing.categorie) as any,
        description: description !== undefined ? (description || null) : existing.description,
        montant: montantNum,
        montantXof: montantNum,
        fournisseurNom: fournisseurNom !== undefined ? (fournisseurNom || null) : existing.fournisseurNom,
        fournisseurIfu: fournisseurIfu !== undefined ? (fournisseurIfu || null) : existing.fournisseurIfu,
        justificatifType: (justificatifType !== undefined ? (justificatifType || null) : existing.justificatifType) as any,
        justificatifUrl: justificatifUrl || existing.justificatifUrl || null,
        statutValidation: statutValidation as any,
      },
    })

    return NextResponse.json({
      success: true,
      depense: { ...updated, montant: Number(updated.montant), montantXof: Number(updated.montantXof) },
    })
  } catch (err: any) {
    console.error('[depenses-patch] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
