import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)


function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function dateIlYA(mois: number, jour: number = 15) {
  const d = new Date('2026-06-16')
  d.setMonth(d.getMonth() - mois)
  d.setDate(jour)
  return d
}

async function main() {
  console.log('🌱 Seeding SNAEN MVP...')

  const hashDemo = await bcrypt.hash('Demo1234!', 12)
  const hashAdmin = await bcrypt.hash('Admin1234!', 12)

  // Opérateur démo
  const demo = await prisma.operateur.upsert({
    where: { email: 'demo@snaen.bj' },
    update: {},
    create: {
      nom: 'AHOUNOU',
      prenom: 'Jean',
      email: 'demo@snaen.bj',
      telephone: '+22961234567',
      motDePasse: hashDemo,
      secteur: 'DROPSHIPPING',
      niveau: 'BUILDER',
      statut: 'ACTIF',
      scoreConformite: 78,
      ifu: 'BJ20240001234',
      lan: 'LAN-2024-A7B2C1',
      role: 'OPERATEUR',
      dateInscription: new Date('2024-01-15'),
    },
  })

  // Admin démo
  await prisma.operateur.upsert({
    where: { email: 'admin@cnaen.bj' },
    update: {},
    create: {
      nom: 'ADMIN',
      prenom: 'CNAEN',
      email: 'admin@cnaen.bj',
      telephone: '+22990000001',
      motDePasse: hashAdmin,
      secteur: 'AUTRE',
      niveau: 'ELITE',
      statut: 'ACTIF',
      scoreConformite: 100,
      role: 'ADMIN',
      dateInscription: new Date('2024-01-01'),
    },
  })

  // Clients fictifs
  const clients = [
    { nom: 'Kofi MENSAH', email: 'kofi@gmail.com', tel: '+22962345678' },
    { nom: 'Aïssatou DIALLO', email: 'aissatou@yahoo.fr', tel: '+22963456789' },
    { nom: 'Rodrigue HOUNSA', email: null, tel: '+22964567890' },
    { nom: 'Marie AGOSSOU', email: 'marie.a@gmail.com', tel: '+22965678901' },
    { nom: 'Brice ADJOVI', email: 'brice@hotmail.com', tel: null },
    { nom: 'Fatoumata BARRY', email: null, tel: '+22966789012' },
    { nom: 'Eustache KPODJI', email: 'eustache@gmail.com', tel: '+22967890123' },
    { nom: 'Odile SOGBOSSI', email: null, tel: '+22968901234' },
  ]

  let factureCount = 0

  // 6 mois de factures
  for (let mois = 5; mois >= 0; mois--) {
    const nbFactures = rnd(8, 15)
    for (let i = 0; i < nbFactures; i++) {
      const client = clients[i % clients.length]
      const montantHT = rnd(50000, 450000)
      const tva = 0
      const jour = rnd(1, 28)
      const dateEmission = dateIlYA(mois, jour)
      const statuts = mois > 0 ? ['EMISE', 'PAYEE', 'PAYEE', 'EMISE'] : ['EMISE']
      const statut = statuts[rnd(0, statuts.length - 1)]

      factureCount++
      const num = `F${dateEmission.getFullYear()}${String(dateEmission.getMonth()+1).padStart(2,'0')}-${String(factureCount).padStart(4,'0')}`

      await prisma.facture.create({
        data: {
          operateurId: demo.id,
          numero: num,
          clientNom: client.nom,
          clientEmail: client.email ?? undefined,
          clientTelephone: client.tel ?? undefined,
          dateEmission,
          dateEcheance: new Date(dateEmission.getTime() + 30 * 24 * 3600 * 1000),
          lignes: [
            {
              description: 'Produits électroniques',
              quantite: rnd(1, 5),
              prixUnitaire: Math.round(montantHT / rnd(1, 5)),
              total: montantHT,
            },
          ],
          montantHT,
          tva,
          montantTTC: montantHT,
          statut: statut as any,
          modeLivraison: ['LIVRAISON_DOMICILE'],
          dgiSync: mois > 0,
          dgiReference: mois > 0 ? `DGI-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}` : undefined,
          dgiSyncAt: mois > 0 ? dateEmission : undefined,
        },
      })
    }
  }

  // 6 mois de dépenses
  const categories = ['STOCK_LOCAL', 'STOCK_ETRANGER', 'PUB_META', 'PUB_GOOGLE', 'LIVRAISON_LOCAL', 'ABONNEMENT_OUTIL']
  const validations = ['AUTO_VALIDEE', 'VALIDEE', 'AUTO_VALIDEE', 'AUTO_VALIDEE']

  for (let mois = 5; mois >= 0; mois--) {
    const nbDepenses = rnd(4, 8)
    for (let i = 0; i < nbDepenses; i++) {
      const cat = categories[i % categories.length]
      const montant = cat.includes('STOCK') ? rnd(80000, 300000) : rnd(20000, 80000)
      await prisma.depense.create({
        data: {
          operateurId: demo.id,
          dateDepense: dateIlYA(mois, rnd(1, 28)),
          categorie: cat as any,
          montant,
          montantXof: montant,
          description: cat === 'PUB_META' ? 'Campagne Facebook Ads' : cat === 'STOCK_LOCAL' ? 'Stock fournisseur local' : undefined,
          statutValidation: validations[rnd(0, validations.length - 1)] as any,
          justificatifType: 'RECU_MOBILE_MONEY' as any,
        },
      })
    }
  }

  // Déclarations fiscales 6 mois
  const statutsDecl = ['PAYEE', 'PAYEE', 'PAYEE', 'PAYEE', 'EN_RETARD', 'CALCULEE']
  for (let mois = 5; mois >= 0; mois--) {
    const caTotal = rnd(1500000, 4000000)
    const benefice = Math.round(caTotal * 0.25)
    const beneficeAnnuel = benefice * 12
    const taux = beneficeAnnuel > 3000000 ? 0.10 : 0.05
    const impotCalcule = Math.round(benefice * taux)
    const impotFinal = Math.round(impotCalcule * 0.9)
    const date = dateIlYA(mois)
    const periode = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`

    await prisma.declarationFiscale.create({
      data: {
        operateurId: demo.id,
        periode,
        caTotal,
        depensesValidees: Math.round(caTotal * 0.15),
        beneficeNet: benefice,
        tauxApplique: taux,
        regime: 'FORFAIT_SECTORIEL',
        impotCalcule,
        reductionNiveau: 0.10,
        impotFinal,
        statut: statutsDecl[mois] as any,
        dateLimite: new Date(date.getTime() + 15 * 24 * 3600 * 1000),
        datePaiement: statutsDecl[mois] === 'PAYEE' ? new Date(date.getTime() + 10 * 24 * 3600 * 1000) : undefined,
      },
    })
  }

  // Formations
  const formations = await Promise.all([
    prisma.formation.upsert({
      where: { id: 'form-001' },
      update: {},
      create: {
        id: 'form-001',
        titre: 'Introduction au Dropshipping au Bénin',
        description: 'Maîtrisez les bases du dropshipping : sourcing, fournisseurs, logistique et marketing digital pour le marché béninois.',
        niveauMin: 'STARTER',
        dureeMin: 120,
        format: 'Vidéo + Quiz',
        gratuit: true,
        secteurs: ['DROPSHIPPING', 'ECOMMERCE'],
      },
    }),
    prisma.formation.upsert({
      where: { id: 'form-002' },
      update: {},
      create: {
        id: 'form-002',
        titre: 'Fiscalité numérique — Comprendre votre LAN',
        description: 'Tout ce que vous devez savoir sur vos obligations fiscales en tant qu\'opérateur numérique sous le régime DNEN.',
        niveauMin: 'STARTER',
        dureeMin: 60,
        format: 'Vidéo + Documents',
        gratuit: true,
        secteurs: ['DROPSHIPPING', 'ECOMMERCE', 'FREELANCE', 'INFLUENCE', 'CONTENU', 'FORMATION', 'COACHING', 'AUTRE'],
      },
    }),
    prisma.formation.upsert({
      where: { id: 'form-003' },
      update: {},
      create: {
        id: 'form-003',
        titre: 'Marketing sur Meta et Google pour opérateurs numériques',
        description: 'Créez des campagnes publicitaires efficaces avec un budget maîtrisé. Facebook Ads, Instagram, Google Ads.',
        niveauMin: 'BUILDER',
        dureeMin: 180,
        format: 'Ateliers pratiques',
        gratuit: false,
        secteurs: ['DROPSHIPPING', 'ECOMMERCE', 'INFLUENCE', 'FORMATION'],
      },
    }),
    prisma.formation.upsert({
      where: { id: 'form-004' },
      update: {},
      create: {
        id: 'form-004',
        titre: 'Gestion financière pour e-commerçants',
        description: 'Gérez votre trésorerie, lisez vos bilans, anticipez les déclarations. Formation spéciale e-commerce Afrique.',
        niveauMin: 'ACHIEVER',
        dureeMin: 240,
        format: 'Vidéo + Coaching',
        gratuit: false,
        secteurs: ['ECOMMERCE', 'DROPSHIPPING', 'FREELANCE'],
      },
    }),
    prisma.formation.upsert({
      where: { id: 'form-005' },
      update: {},
      create: {
        id: 'form-005',
        titre: 'Scaling et internationalisation de votre business',
        description: 'Passez de l\'opérateur local à l\'entrepreneur régional. Stratégies d\'expansion en Afrique de l\'Ouest.',
        niveauMin: 'CHAMPION',
        dureeMin: 300,
        format: 'Programme intensif',
        gratuit: false,
        secteurs: ['ECOMMERCE', 'DROPSHIPPING', 'FORMATION', 'COACHING'],
      },
    }),
  ])

  // Progressions formations pour Jean AHOUNOU
  await prisma.progressionFormation.upsert({
    where: { id: 'prog-001' },
    update: {},
    create: {
      id: 'prog-001',
      operateurId: demo.id,
      formationId: 'form-001',
      progressionPct: 100,
      termine: true,
      dateDebut: new Date('2025-08-01'),
      dateFin: new Date('2025-08-20'),
    },
  })

  await prisma.progressionFormation.upsert({
    where: { id: 'prog-002' },
    update: {},
    create: {
      id: 'prog-002',
      operateurId: demo.id,
      formationId: 'form-002',
      progressionPct: 65,
      termine: false,
      dateDebut: new Date('2026-04-10'),
    },
  })

  await prisma.progressionFormation.upsert({
    where: { id: 'prog-003' },
    update: {},
    create: {
      id: 'prog-003',
      operateurId: demo.id,
      formationId: 'form-003',
      progressionPct: 30,
      termine: false,
      dateDebut: new Date('2026-05-15'),
    },
  })

  // Dossiers CVFD
  const typesDossiers = ['Activité non déclarée', 'Fraude fiscale présumée', 'Faux documents LAN']
  for (let i = 0; i < 12; i++) {
    const statuts = ['OUVERT', 'EN_ENQUETE', 'MISE_EN_DEMEURE', 'REGULARISE', 'CLASSE']
    await prisma.dossierCVFD.create({
      data: {
        typeDetection: typesDossiers[i % typesDossiers.length],
        sujetNom: `Sujet ${i + 1} Demo`,
        sujetTelephone: `+2296${rnd(1000000, 9999999)}`,
        description: `Activité numérique détectée sur les réseaux sociaux sans LAN valide. Volume estimé ${rnd(500, 5000)} abonnés.`,
        statut: statuts[i % statuts.length] as any,
        dateDetection: dateIlYA(rnd(0, 5), rnd(1, 28)),
      },
    })
  }

  console.log('✅ Seed terminé avec succès!')
  console.log('  📧 Opérateur: demo@snaen.bj / Demo1234!')
  console.log('  📧 Admin: admin@cnaen.bj / Admin1234!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
