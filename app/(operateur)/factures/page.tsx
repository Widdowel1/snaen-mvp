'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function formatFCFA(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

function StatutBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    EMISE: 'bg-blue-100 text-blue-700 border border-blue-200',
    PAYEE: 'bg-green-100 text-green-700 border border-green-200',
    ANNULEE: 'bg-red-100 text-red-700 border border-red-200',
  }
  const labels: Record<string, string> = { EMISE: 'Émise', PAYEE: 'Payée', ANNULEE: 'Annulée' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[statut] || 'bg-gray-100 text-gray-600'}`}>
      {labels[statut] || statut}
    </span>
  )
}

export default function FacturesPage() {
  const [factures, setFactures] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statut, setStatut] = useState('TOUS')

  async function fetchFactures() {
    setLoading(true)
    try {
      const params = statut !== 'TOUS' ? `?statut=${statut}` : ''
      const res = await fetch(`/api/factures${params}`)
      const data = await res.json()
      setFactures(data.factures || [])
      setTotal(data.total || 0)
    } catch {
      setFactures([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFactures() }, [statut])

  const caTTC = factures.filter(f => f.statut !== 'ANNULEE').reduce((s, f) => s + f.montantTTC, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#004D2C] font-bold text-2xl">Factures</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} facture{total !== 1 ? 's' : ''} au total</p>
        </div>
        <Link
          href="/factures/nouvelle"
          className="inline-flex items-center gap-2 bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle facture
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total émises', value: factures.filter(f => f.statut === 'EMISE').length, color: 'text-blue-700' },
          { label: 'Payées', value: factures.filter(f => f.statut === 'PAYEE').length, color: 'text-green-700' },
          { label: 'CA TTC', value: formatFCFA(caTTC), color: 'text-[#004D2C]' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex gap-2 flex-wrap">
          {['TOUS', 'EMISE', 'PAYEE', 'ANNULEE'].map(s => (
            <button
              key={s}
              onClick={() => setStatut(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statut === s
                  ? 'bg-[#006B3F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'TOUS' ? 'Toutes' : s === 'EMISE' ? 'Émises' : s === 'PAYEE' ? 'Payées' : 'Annulées'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Chargement...</div>
        ) : factures.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-300 mb-3">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Aucune facture trouvée</p>
            <Link href="/factures/nouvelle" className="mt-3 inline-flex text-[#006B3F] text-sm font-medium hover:underline">
              Créer votre première facture →
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">Numéro</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Montant TTC</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Date émission</th>
                <th className="px-6 py-3 font-medium">Échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {factures.map(f => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">{f.numero}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{f.clientNom}</div>
                    {f.clientEmail && <div className="text-xs text-gray-400">{f.clientEmail}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-[#004D2C]">{formatFCFA(f.montantTTC)}</td>
                  <td className="px-6 py-4"><StatutBadge statut={f.statut} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(f.dateEmission).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {f.dateEcheance ? new Date(f.dateEcheance).toLocaleDateString('fr-FR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
