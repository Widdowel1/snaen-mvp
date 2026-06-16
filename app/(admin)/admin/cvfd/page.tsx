import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

const STATUT_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  OUVERT: { label: 'Ouvert', color: 'bg-blue-100 text-blue-700', step: 1 },
  EN_ENQUETE: { label: 'En enquête', color: 'bg-yellow-100 text-yellow-800', step: 2 },
  MISE_EN_DEMEURE: { label: 'Mise en demeure', color: 'bg-orange-100 text-orange-700', step: 3 },
  REGULARISE: { label: 'Régularisé', color: 'bg-green-100 text-green-700', step: 4 },
  CLASSE: { label: 'Classé', color: 'bg-gray-100 text-gray-600', step: 5 },
  TRANSMIS_JUSTICE: { label: 'Transmis justice', color: 'bg-red-100 text-red-700', step: 6 },
}

export default async function CVFDPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'ADMIN') redirect('/login')

  const dossiers = await prisma.dossierCVFD.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const stats = {
    total: dossiers.length,
    actifs: dossiers.filter(d => ['OUVERT', 'EN_ENQUETE', 'MISE_EN_DEMEURE'].includes(d.statut)).length,
    regularises: dossiers.filter(d => d.statut === 'REGULARISE').length,
    justice: dossiers.filter(d => d.statut === 'TRANSMIS_JUSTICE').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold text-2xl">Dossiers CVFD</h1>
          <p className="text-gray-500 text-sm mt-0.5">Contrôle et Vérification des Fraudes Numériques</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#E8112D] hover:bg-red-700 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau dossier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total dossiers', value: stats.total, color: 'text-gray-900' },
          { label: 'Actifs', value: stats.actifs, color: 'text-orange-600' },
          { label: 'Régularisés', value: stats.regularises, color: 'text-green-700' },
          { label: 'Transmis justice', value: stats.justice, color: 'text-red-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Liste dossiers */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {dossiers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            Aucun dossier CVFD enregistré
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">Sujet</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Timeline</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Date détection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dossiers.map(d => {
                const config = STATUT_CONFIG[d.statut]
                const step = config?.step || 1
                return (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{d.sujetNom}</div>
                      {d.sujetEmail && <div className="text-xs text-gray-400">{d.sujetEmail}</div>}
                      {d.sujetTelephone && <div className="text-xs text-gray-400">{d.sujetTelephone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-32 truncate">{d.typeDetection}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5,6].map(s => (
                          <div key={s} className={`h-2 flex-1 rounded-sm ${s <= step ? 'bg-[#006B3F]' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Étape {step}/6</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100'}`}>
                        {config?.label || d.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(d.dateDetection).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
