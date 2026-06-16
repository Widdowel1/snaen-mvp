'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const MOIS_RECETTES = [
  { mois: 'Jan', recettes: 98 },
  { mois: 'Fév', recettes: 103 },
  { mois: 'Mar', recettes: 112 },
  { mois: 'Avr', recettes: 118 },
  { mois: 'Mai', recettes: 122 },
  { mois: 'Jun', recettes: 127 },
]

const NIVEAU_COLORS: Record<string, string> = {
  STARTER: '#9CA3AF',
  BUILDER: '#3B82F6',
  ACHIEVER: '#8B5CF6',
  CHAMPION: '#F59E0B',
  ELITE: '#EF4444',
}

const PIE_COLORS = ['#006B3F', '#FCD116', '#E8112D', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#6366F1', '#EC4899', '#14B8A6', '#6B7280']

interface AdminChartsProps {
  parSecteur: Array<{ secteur: string; _count: { secteur: number } }>
  parNiveau: Array<{ niveau: string; _count: { niveau: number } }>
  dernieresInscriptions: Array<{
    id: string
    nom: string
    prenom: string
    email: string
    secteur: string
    niveau: string
    statut: string
    createdAt: Date | string
  }>
}

const STATUT_COLORS: Record<string, string> = {
  ACTIF: 'bg-green-100 text-green-700',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  SUSPENDU: 'bg-red-100 text-red-700',
  RADIE: 'bg-gray-100 text-gray-600',
}

const NIVEAU_BADGE_COLORS: Record<string, string> = {
  STARTER: 'bg-gray-100 text-gray-600',
  BUILDER: 'bg-blue-100 text-blue-700',
  ACHIEVER: 'bg-purple-100 text-purple-700',
  CHAMPION: 'bg-yellow-100 text-yellow-800',
  ELITE: 'bg-red-100 text-red-700',
}

function formatM(value: number) {
  return `${value}M`
}

export default function AdminCharts({ parSecteur, parNiveau, dernieresInscriptions }: AdminChartsProps) {
  const secteurData = parSecteur.map(s => ({
    name: s.secteur.toLowerCase().replace('_', ' '),
    count: s._count.secteur,
  }))

  const niveauData = ['STARTER', 'BUILDER', 'ACHIEVER', 'CHAMPION', 'ELITE'].map(n => ({
    niveau: n,
    count: parNiveau.find(p => p.niveau === n)?._count.niveau || 0,
    fill: NIVEAU_COLORS[n],
  }))

  return (
    <div className="space-y-6">
      {/* Graphique 1 — Recettes par mois */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[#004D2C] font-semibold mb-1">Recettes fiscales par mois</h2>
        <p className="text-gray-400 text-xs mb-4">Millions FCFA — 6 derniers mois</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MOIS_RECETTES} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} tickFormatter={formatM} />
            <Tooltip
              formatter={(v) => [`${v}M FCFA`, 'Recettes']}
              contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
            />
            <Bar dataKey="recettes" fill="#006B3F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 2 — Pie par secteur */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[#004D2C] font-semibold mb-1">Opérateurs par secteur</h2>
          <p className="text-gray-400 text-xs mb-4">Répartition sectorielle</p>
          {secteurData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={secteurData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {secteurData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [v, 'Opérateurs']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Graphique 3 — Barres horizontales par niveau */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[#004D2C] font-semibold mb-1">Opérateurs par niveau</h2>
          <p className="text-gray-400 text-xs mb-4">Progression STARTER → ELITE</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={niveauData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="niveau" tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                formatter={(v) => [v, 'Opérateurs']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {niveauData.map((entry) => (
                  <Cell key={entry.niveau} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau dernières inscriptions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#004D2C] font-semibold">Dernières inscriptions</h2>
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
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${NIVEAU_BADGE_COLORS[op.niveau]}`}>{op.niveau}</span>
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
