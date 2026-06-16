import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calculerImpot, formatFCFA } from '@/lib/fiscal'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const user = session.user as any
  const operateurId = user?.id

  try {
    const now = new Date()
    const debutMoisCourant = new Date(now.getFullYear(), now.getMonth(), 1)
    const debutMoisPrecedent = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const finMoisPrecedent = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // CA mois courant
    const facturesMoisCourant = await prisma.facture.findMany({
      where: {
        operateurId,
        statut: { in: ['EMISE', 'PAYEE'] },
        dateEmission: { gte: debutMoisCourant },
      },
    })
    const caMoisCourant = facturesMoisCourant.reduce((sum, f) => sum + Number(f.montantTTC), 0)

    // CA mois précédent
    const facturesMoisPrecedent = await prisma.facture.findMany({
      where: {
        operateurId,
        statut: { in: ['EMISE', 'PAYEE'] },
        dateEmission: { gte: debutMoisPrecedent, lte: finMoisPrecedent },
      },
    })
    const caMoisPrecedent = facturesMoisPrecedent.reduce((sum, f) => sum + Number(f.montantTTC), 0)

    // Dépenses mois courant validées
    const depensesMoisCourant = await prisma.depense.findMany({
      where: {
        operateurId,
        dateDepense: { gte: debutMoisCourant },
        statutValidation: { in: ['AUTO_VALIDEE', 'VALIDEE'] },
      },
    })
    const totalDepenses = depensesMoisCourant.reduce((sum, d) => sum + Number(d.montantXof), 0)

    // Opérateur info
    const operateur = await prisma.operateur.findUnique({ where: { id: operateurId } })
    const secteur = operateur?.secteur || 'AUTRE'
    const niveau = operateur?.niveau || 'STARTER'

    // Calcul fiscal
    const fiscal = calculerImpot({
      caTotal: caMoisCourant,
      depensesValidees: totalDepenses,
      secteur,
      niveau,
    })

    // Date limite déclaration (15 du mois suivant)
    const dateLimite = new Date(now.getFullYear(), now.getMonth() + 1, 15)

    // CA 6 derniers mois
    const ca6mois = []
    for (let i = 5; i >= 0; i--) {
      const debut = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fin = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const factures = await prisma.facture.findMany({
        where: {
          operateurId,
          statut: { in: ['EMISE', 'PAYEE'] },
          dateEmission: { gte: debut, lte: fin },
        },
      })
      const total = factures.reduce((s, f) => s + Number(f.montantTTC), 0)
      ca6mois.push({
        mois: debut.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
        ca: total,
        label: formatFCFA(total),
      })
    }

    // 5 dernières factures
    const dernieresFactures = await prisma.facture.findMany({
      where: { operateurId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Counts globaux
    const [totalFactures, totalDeclarations] = await Promise.all([
      prisma.facture.count({ where: { operateurId } }),
      prisma.declarationFiscale.count({ where: { operateurId } }),
    ])
    const totalDepensesCount = await prisma.depense.count({ where: { operateurId } })

    // Alertes intelligentes
    const alertes: { type: string; message: string }[] = []

    const periodeActuelle = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const declarationActuelle = await prisma.declarationFiscale.findFirst({
      where: { operateurId, periode: periodeActuelle },
    })
    const joursAvantLimite = Math.ceil((dateLimite.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Déclaration mois courant non payée
    if (!declarationActuelle || declarationActuelle.statut !== 'PAYEE') {
      if (joursAvantLimite < 0) {
        alertes.push({ type: 'danger', message: `🚨 Déclaration fiscale de ${new Date(now.getFullYear(), now.getMonth(), 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })} EN RETARD de ${Math.abs(joursAvantLimite)} jour(s). Des pénalités peuvent s'appliquer.` })
      } else if (joursAvantLimite <= 5) {
        alertes.push({ type: 'warning', message: `⚠️ Votre déclaration fiscale est due dans ${joursAvantLimite} jour(s). Date limite : ${dateLimite.toLocaleDateString('fr-FR')}. Payez maintenant dans l'onglet Fiscal.` })
      }
    }

    // Anciennes déclarations en retard
    const declarationsAnciennes = await prisma.declarationFiscale.findMany({
      where: { operateurId, statut: { in: ['CALCULEE', 'EN_RETARD'] }, dateLimite: { lt: now } },
      orderBy: { periode: 'desc' },
      take: 1,
    })
    if (declarationsAnciennes.length > 0) {
      const d = declarationsAnciennes[0]
      alertes.push({ type: 'danger', message: `🚨 Déclaration de la période ${d.periode} non réglée et en retard. Risque de pénalités.` })
    }

    if (facturesMoisCourant.length === 0) {
      alertes.push({ type: 'info', message: `💡 Vous n'avez pas encore émis de facture ce mois-ci. Créez votre première facture pour alimenter votre déclaration fiscale.` })
    }

    // Si aucune donnée ce mois-ci, utiliser les données du mois précédent pour avoir quelque chose à afficher
    const caMoisAffiche = caMoisCourant > 0 ? caMoisCourant : caMoisPrecedent

    return NextResponse.json({
      caMoisCourant,
      caMoisPrecedent,
      caMoisAffiche,
      variationCA: caMoisPrecedent > 0 ? ((caMoisCourant - caMoisPrecedent) / caMoisPrecedent) * 100 : 0,
      beneficeNet: fiscal.beneficeNet,
      regime: fiscal.regime,
      impotDu: fiscal.impotFinal,
      dateLimite: dateLimite.toISOString(),
      tauxApplique: fiscal.tauxApplique,
      reductionNiveau: fiscal.reductionNiveau,
      niveau,
      ca6mois,
      totalFactures,
      totalDepenses: totalDepensesCount,
      totalDeclarations,
      dernieresFactures: dernieresFactures.map(f => ({
        id: f.id,
        numero: f.numero,
        clientNom: f.clientNom,
        montantTTC: Number(f.montantTTC),
        statut: f.statut,
        dateEmission: f.dateEmission,
      })),
      alertes,
    })
  } catch (err: any) {
    console.error('[dashboard-kpis] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
