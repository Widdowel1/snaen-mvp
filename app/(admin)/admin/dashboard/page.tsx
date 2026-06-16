import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import AdminCharts from '@/components/admin/AdminCharts'

function formatFCFA(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

export default async function AdminDashboardPage() {
  await getServerSession(authOptions)

  // Stats depuis la DB
  const [totalOperateurs, operateursActifs, dossiersCVFD] = await Promise.all([
    prisma.operateur.count(),
    prisma.operateur.count({ where: { statut: 'ACTIF' } }),
    prisma.dossierCVFD.count({ where: { statut: { in: ['OUVERT', 'EN_ENQUETE', 'MISE_EN_DEMEURE'] } } }),
  ])

  // Inscriptions récentes
  const dernieresInscriptions = await prisma.operateur.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: { id: true, nom: true, prenom: true, email: true, secteur: true, niveau: true, statut: true, createdAt: true },
  })

  // Stats par secteur
  const parSecteur = await prisma.operateur.groupBy({
    by: ['secteur'],
    _count: { secteur: true },
  })

  // Stats par niveau
  const parNiveau = await prisma.operateur.groupBy({
    by: ['niveau'],
    _count: { niveau: true },
  })

  // Recettes simulées (mock pour MVP)
  const recettesMois = 127450000
  const recettesMoisPrecedent = 103200000
  const variationRecettes = ((recettesMois - recettesMoisPrecedent) / recettesMoisPrecedent * 100).toFixed(1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 font-bold text-2xl">Tableau de bord DNEN</h1>
        <p className="text-gray-500 text-sm mt-0.5">Centre National d'Administration de l'Économie Numérique</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Opérateurs inscrits', value: totalOperateurs, sub: `${operateursActifs} actifs`, color: 'text-[#004D2C]' },
          { label: 'Recettes du mois', value: formatFCFA(recettesMois), sub: `+${variationRecettes}% vs mois préc.`, color: 'text-[#006B3F]' },
          { label: 'Dossiers CVFD actifs', value: dossiersCVFD, sub: 'En cours de traitement', color: 'text-[#E8112D]' },
          { label: 'Taux conformité', value: '78%', sub: 'Objectif : 90%', color: 'text-[#004D2C]' },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{k.label}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <AdminCharts
        parSecteur={parSecteur}
        parNiveau={parNiveau}
        dernieresInscriptions={dernieresInscriptions}
      />
    </div>
  )
}
