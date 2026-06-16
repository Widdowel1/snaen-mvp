import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

function formatFCFA(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

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

  const STATUT_COLORS: Record<string, string> = {
    ACTIF: 'bg-green-100 text-green-700',
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    SUSPENDU: 'bg-red-100 text-red-700',
    RADIE: 'bg-gray-100 text-gray-600',
  }

  const NIVEAU_COLORS: Record<string, string> = {
    STARTER: 'bg-gray-100 text-gray-600',
    BUILDER: 'bg-blue-100 text-blue-700',
    ACHIEVER: 'bg-purple-100 text-purple-700',
    CHAMPION: 'bg-yellow-100 text-yellow-800',
    ELITE: 'bg-red-100 text-red-700',
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par secteur */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-gray-900 font-semibold mb-4">Répartition par secteur</h2>
          <div className="space-y-2.5">
            {parSecteur.sort((a, b) => b._count.secteur - a._count.secteur).slice(0, 8).map(s => (
              <div key={s.secteur} className="flex items-center gap-3">
                <div className="text-xs text-gray-500 w-28 truncate capitalize">{s.secteur.toLowerCase().replace('_', ' ')}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-[#006B3F] h-2 rounded-full" style={{ width: `${(s._count.secteur / (totalOperateurs || 1)) * 100}%` }} />
                </div>
                <div className="text-xs font-medium text-gray-700 w-6 text-right">{s._count.secteur}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par niveau */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-gray-900 font-semibold mb-4">Répartition par niveau</h2>
          <div className="space-y-2.5">
            {['STARTER', 'BUILDER', 'ACHIEVER', 'CHAMPION', 'ELITE'].map(niveau => {
              const count = parNiveau.find(n => n.niveau === niveau)?._count.niveau || 0
              return (
                <div key={niveau} className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium w-20 justify-center ${NIVEAU_COLORS[niveau]}`}>{niveau}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-[#FCD116] h-2 rounded-full" style={{ width: `${(count / (totalOperateurs || 1)) * 100}%` }} />
                  </div>
                  <div className="text-xs font-medium text-gray-700 w-6 text-right">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Dernières inscriptions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-semibold">Dernières inscriptions</h2>
          <a href="/admin/operateurs" className="text-[#006B3F] text-sm font-medium hover:underline">Voir tout →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="pb-3 font-medium">Opérateur</th>
                <th className="pb-3 font-medium">Secteur</th>
                <th className="pb-3 font-medium">Niveau</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dernieresInscriptions.map(op => (
                <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">
                    <div className="text-sm font-medium text-gray-800">{op.prenom} {op.nom}</div>
                    <div className="text-xs text-gray-400">{op.email}</div>
                  </td>
                  <td className="py-3 text-sm text-gray-500 capitalize">{op.secteur.toLowerCase().replace('_', ' ')}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${NIVEAU_COLORS[op.niveau]}`}>{op.niveau}</span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[op.statut]}`}>{op.statut}</span>
                  </td>
                  <td className="py-3 text-xs text-gray-400">{new Date(op.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
