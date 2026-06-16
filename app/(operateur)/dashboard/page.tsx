'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ContextGuide from '@/components/ui/ContextGuide'

function formatFCFA(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

function StatutBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    EMISE: 'bg-blue-100 text-blue-700',
    PAYEE: 'bg-green-100 text-green-700',
    ANNULEE: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = { EMISE: 'Émise', PAYEE: 'Payée', ANNULEE: 'Annulée' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[statut] || 'bg-gray-100 text-gray-600'}`}>
      {labels[statut] || statut}
    </span>
  )
}

const NIVEAUX = ['STARTER', 'BUILDER', 'ACHIEVER', 'CHAMPION', 'ELITE']
const NIVEAUX_LABELS: Record<string, string> = {
  STARTER: 'Starter', BUILDER: 'Builder', ACHIEVER: 'Achiever',
  CHAMPION: 'Champion', ELITE: 'Elite',
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard/kpis')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Impossible de charger les données.'); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#006B3F] text-sm">Chargement du tableau de bord...</div>
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
  }

  const currentNiveauIndex = NIVEAUX.indexOf(data?.niveau || 'STARTER')
  const progressPct = Math.min(((currentNiveauIndex + 1) / NIVEAUX.length) * 100, 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#004D2C] font-bold text-2xl">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de votre activité numérique</p>
      </div>

      <ContextGuide message="Votre tableau de bord affiche vos KPIs en temps réel. Cliquez sur une carte pour plus de détails." />

      {/* Alertes */}
      {data?.alertes?.length > 0 && (
        <div className="space-y-2">
          {data.alertes.map((a: any, i: number) => (
            <div key={i} className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
              a.type === 'danger' ? 'bg-red-50 border border-red-200 text-red-800' :
              a.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
              'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA mois courant */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">CA mois courant</div>
          <div className="text-2xl font-bold text-[#004D2C]">{formatFCFA(data?.caMoisCourant || 0)}</div>
          <div className={`text-xs mt-1 ${(data?.variationCA || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(data?.variationCA || 0) >= 0 ? '↑' : '↓'} {Math.abs(data?.variationCA || 0).toFixed(1)}% vs mois précédent
          </div>
        </div>

        {/* Bénéfice net */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Bénéfice net estimé</div>
          <div className="text-2xl font-bold text-[#006B3F]">{formatFCFA(data?.beneficeNet || 0)}</div>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              data?.regime === 'BENEFICE_REEL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
            }`}>
              {data?.regime === 'BENEFICE_REEL' ? 'Bénéfice réel' : 'Forfait sectoriel'}
            </span>
          </div>
        </div>

        {/* Impôt dû */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Impôt du mois</div>
          <div className="text-2xl font-bold text-[#E8112D]">{formatFCFA(data?.impotDu || 0)}</div>
          {data?.dateLimite && (
            <div className="text-xs text-gray-400 mt-1">
              Limite : {new Date(data.dateLimite).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>

        {/* Niveau */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Niveau actuel</div>
          <div className="text-2xl font-bold text-[#004D2C]">{NIVEAUX_LABELS[data?.niveau || 'STARTER']}</div>
          <div className="mt-2">
            <div className="h-1.5 bg-gray-100 rounded-full">
              <div className="h-1.5 bg-[#FCD116] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {NIVEAUX[Math.min(currentNiveauIndex + 1, NIVEAUX.length - 1)] !== data?.niveau
                ? `→ ${NIVEAUX_LABELS[NIVEAUX[currentNiveauIndex + 1] || 'ELITE']}`
                : 'Niveau maximum atteint'}
            </div>
          </div>
        </div>
      </div>

      {/* Graphique CA 6 mois */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[#004D2C] font-semibold mb-4">Chiffre d'affaires — 6 derniers mois</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.ca6mois || []} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(v)} />
              <Tooltip
                formatter={(value) => [formatFCFA(Number(value)), 'CA']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="ca" stroke="#006B3F" strokeWidth={2.5} dot={{ fill: '#006B3F', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dernières factures */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#004D2C] font-semibold">Dernières factures</h2>
          <a href="/factures" className="text-[#006B3F] text-sm font-medium hover:underline">Voir tout →</a>
        </div>
        {data?.dernieresFactures?.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">Aucune facture émise pour l'instant</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-3 font-medium">N°</th>
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Montant TTC</th>
                  <th className="pb-3 font-medium">Statut</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.dernieresFactures?.map((f: any) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm font-mono text-gray-500">{f.numero}</td>
                    <td className="py-3 text-sm font-medium text-gray-800">{f.clientNom}</td>
                    <td className="py-3 text-sm font-bold text-[#004D2C]">{formatFCFA(f.montantTTC)}</td>
                    <td className="py-3"><StatutBadge statut={f.statut} /></td>
                    <td className="py-3 text-sm text-gray-400">{new Date(f.dateEmission).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
