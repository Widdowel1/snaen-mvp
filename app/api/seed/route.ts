import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function dateIlYA(mois: number, jour: number = 15) {
  const d = new Date('2026-06-16')
  d.setMonth(d.getMonth() - mois)
  d.setDate(jour)
  return d
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'snaen-seed-2026') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter } as any)

  try {
    const hashDemo = await bcrypt.hash('Demo1234!', 12)
    const hashAdmin = await bcrypt.hash('Admin1234!', 12)

    const demo = await prisma.operateur.upsert({
      where: { email: 'demo@snaen.bj' },
      update: {},
      create: {
        nom: 'AHOUNOU', prenom: 'Jean', email: 'demo@snaen.bj',
        telephone: '+22961234567', motDePasse: hashDemo,
        secteur: 'DROPSHIPPING', niveau: 'BUILDER', statut: 'ACTIF',
        scoreConformite: 78, ifu: 'BJ20240001234', lan: 'LAN-2024-A7B2C1',
        role: 'OPERATEUR', dateInscription: new Date('2024-01-15'),
      },
    })

    await prisma.operateur.upsert({
      where: { email: 'admin@cnaen.bj' },
      update: {},
      create: {
        nom: 'ADMIN', prenom: 'DNEN', email: 'admin@dnen.bj',
        telephone: '+22990000001', motDePasse: hashAdmin,
        secteur: 'AUTRE', niveau: 'ELITE', statut: 'ACTIF',
        scoreConformite: 100, role: 'ADMIN', dateInscription: new Date('2024-01-01'),
      },
    })

    // Factures 6 mois
    let factureCount = 0
    const clients = [
      { nom: 'Kofi MENSAH' }, { nom: 'Aissatou DIALLO' },
      { nom: 'Rodrigue HOUNSA' }, { nom: 'Marie AGOSSOU' },
    ]
    for (let mois = 5; mois >= 0; mois--) {
      for (let i = 0; i < rnd(8, 12); i++) {
        const client = clients[i % clients.length]
        const montant = rnd(50000, 400000)
        const dateEmission = dateIlYA(mois, rnd(1, 28))
        factureCount++
        const num = `F${dateEmission.getFullYear()}${String(dateEmission.getMonth()+1).padStart(2,'0')}-${String(factureCount).padStart(4,'0')}`
        await prisma.facture.create({
          data: {
            operateurId: demo.id, numero: num, clientNom: client.nom,
            dateEmission, dateEcheance: new Date(dateEmission.getTime() + 30*24*3600*1000),
            lignes: [{ description: 'Produits', quantite: 1, prixUnitaire: montant, total: montant }],
            montantHT: montant, tva: 0, montantTTC: montant,
            statut: mois > 0 ? (Math.random() > 0.3 ? 'PAYEE' : 'EMISE') : 'EMISE',
            modeLivraison: ['LIVRAISON_DOMICILE'], dgiSync: mois > 0,
          },
        })
      }
    }

    // Dépenses 6 mois
    const cats = ['STOCK_LOCAL','PUB_META','LIVRAISON_LOCAL','ABONNEMENT_OUTIL'] as const
    for (let mois = 5; mois >= 0; mois--) {
      for (let i = 0; i < rnd(3, 6); i++) {
        const montant = rnd(20000, 200000)
        await prisma.depense.create({
          data: {
            operateurId: demo.id, dateDepense: dateIlYA(mois, rnd(1,28)),
            categorie: cats[i % cats.length], montant, montantXof: montant,
            statutValidation: 'AUTO_VALIDEE',
          },
        })
      }
    }

    // Déclarations 6 mois
    const statutsDecl = ['PAYEE','PAYEE','PAYEE','PAYEE','EN_RETARD','CALCULEE']
    for (let mois = 5; mois >= 0; mois--) {
      const ca = rnd(1500000, 3500000)
      const benefice = Math.round(ca * 0.25)
      const taux = benefice * 12 > 3000000 ? 0.10 : 0.05
      const impot = Math.round(benefice * taux)
      const date = dateIlYA(mois)
      const periode = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`
      await prisma.declarationFiscale.create({
        data: {
          operateurId: demo.id, periode, caTotal: ca,
          depensesValidees: Math.round(ca * 0.15), beneficeNet: benefice,
          tauxApplique: taux, regime: 'FORFAIT_SECTORIEL',
          impotCalcule: impot, reductionNiveau: 0.10, impotFinal: Math.round(impot * 0.9),
          statut: statutsDecl[mois] as any,
          dateLimite: new Date(date.getTime() + 15*24*3600*1000),
          datePaiement: statutsDecl[mois] === 'PAYEE' ? new Date(date.getTime() + 10*24*3600*1000) : undefined,
        },
      })
    }

    // Formations existantes
    const formations = [
      { id: 'form-001', titre: 'Introduction au Dropshipping au Bénin', niveauMin: 'STARTER', dureeMin: 120, format: 'Vidéo + Quiz', gratuit: true },
      { id: 'form-002', titre: 'Fiscalité numérique — Comprendre votre LAN', niveauMin: 'STARTER', dureeMin: 60, format: 'Vidéo', gratuit: true },
      { id: 'form-003', titre: 'Marketing Meta et Google', niveauMin: 'BUILDER', dureeMin: 180, format: 'Ateliers', gratuit: false },
      { id: 'form-004', titre: 'Gestion financière e-commerce', niveauMin: 'ACHIEVER', dureeMin: 240, format: 'Coaching', gratuit: false },
      { id: 'form-005', titre: 'Scaling et internationalisation', niveauMin: 'CHAMPION', dureeMin: 300, format: 'Programme', gratuit: false },
    ]
    for (const f of formations) {
      await prisma.formation.upsert({
        where: { id: f.id }, update: {},
        create: { id: f.id, titre: f.titre, niveauMin: f.niveauMin as any, dureeMin: f.dureeMin, format: f.format, gratuit: f.gratuit, secteurs: ['DROPSHIPPING'] },
      })
    }

    // Nouvelles formations enrichies (upsert par titre)
    const nouvellesFormations = [
      {
        titre: "Introduction à la Licence d'Activité Numérique (LAN)",
        description: "Comprendre les obligations légales d'un opérateur numérique au Bénin selon la loi 2018-20.",
        format: 'video',
        dureeMin: 25,
        niveauMin: 'STARTER',
        gratuit: true,
        actif: true,
      },
      {
        titre: 'Émettre une facture normalisée conforme DGI',
        description: "Guide pratique pour créer des factures valides, respectant les normes de la Direction Générale des Impôts.",
        format: 'pdf',
        dureeMin: 15,
        niveauMin: 'STARTER',
        gratuit: true,
        actif: true,
      },
      {
        titre: 'Gérer ses dépenses déductibles fiscalement',
        description: "Quelles dépenses sont déductibles ? Comment les justifier ? Optimisez votre base imposable.",
        format: 'video',
        dureeMin: 30,
        niveauMin: 'STARTER',
        gratuit: true,
        actif: true,
      },
      {
        titre: 'Comprendre le régime fiscal des opérateurs numériques',
        description: "Bénéfice réel vs forfait sectoriel : comment est calculé votre impôt selon la loi béninoise.",
        format: 'pdf',
        dureeMin: 20,
        niveauMin: 'BUILDER',
        gratuit: true,
        actif: true,
      },
      {
        titre: 'Stratégies de croissance pour opérateurs numériques',
        description: "Comment passer du niveau Starter à Builder et bénéficier d'une réduction fiscale de 30%.",
        format: 'video',
        dureeMin: 45,
        niveauMin: 'BUILDER',
        gratuit: false,
        actif: true,
      },
      {
        titre: 'E-commerce au Bénin : opportunités et conformité',
        description: "Développer son activité e-commerce en conformité avec la réglementation béninoise.",
        format: 'live',
        dureeMin: 60,
        niveauMin: 'ACHIEVER',
        gratuit: false,
        actif: true,
      },
    ]
    for (const nf of nouvellesFormations) {
      const existing = await prisma.formation.findFirst({ where: { titre: nf.titre } })
      if (!existing) {
        await prisma.formation.create({
          data: {
            titre: nf.titre,
            description: nf.description,
            format: nf.format,
            dureeMin: nf.dureeMin,
            niveauMin: nf.niveauMin as any,
            gratuit: nf.gratuit,
            actif: nf.actif,
          },
        })
      }
    }
    await prisma.progressionFormation.upsert({
      where: { id: 'prog-001' }, update: {},
      create: { id: 'prog-001', operateurId: demo.id, formationId: 'form-001', progressionPct: 100, termine: true, dateDebut: new Date('2025-08-01'), dateFin: new Date('2025-08-20') },
    })
    await prisma.progressionFormation.upsert({
      where: { id: 'prog-002' }, update: {},
      create: { id: 'prog-002', operateurId: demo.id, formationId: 'form-002', progressionPct: 65, termine: false, dateDebut: new Date('2026-04-10') },
    })

    // CVFD
    const statutsCVFD = ['OUVERT','EN_ENQUETE','MISE_EN_DEMEURE','REGULARISE','CLASSE']
    for (let i = 0; i < 12; i++) {
      await prisma.dossierCVFD.create({
        data: {
          typeDetection: 'Activité non déclarée', sujetNom: `Operateur Demo ${i+1}`,
          description: 'Activité numérique sans LAN valide détectée.',
          statut: statutsCVFD[i % statutsCVFD.length] as any,
          dateDetection: dateIlYA(rnd(0,5), rnd(1,28)),
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Base de données peuplée avec succès !' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
