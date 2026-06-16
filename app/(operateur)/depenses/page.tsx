'use client'

import { useEffect, useState } from 'react'

function formatFCFA(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

const CATEGORIES = [
  { value: 'STOCK_LOCAL', label: 'Stock local' },
  { value: 'STOCK_ETRANGER', label: 'Stock étranger' },
  { value: 'PUB_META', label: 'Publicité Meta' },
  { value: 'PUB_GOOGLE', label: 'Publicité Google' },
  { value: 'ABONNEMENT_OUTIL', label: 'Abonnement outil' },
  { value: 'LIVRAISON_LOCAL', label: 'Livraison locale' },
  { value: 'LIVRAISON_INTERNATIONAL', label: 'Livraison internationale' },
  { value: 'TELECOM', label: 'Télécom' },
  { value: 'MATERIEL', label: 'Matériel' },
  { value: 'PRESTATAIRE_SNAEN', label: 'Prestataire SNAEN' },
  { value: 'AUTRE', label: 'Autre' },
]

const JUSTIFICATIFS = [
  { value: 'FACTURE_NORMALISEE', label: 'Facture normalisée' },
  { value: 'FACTURE_ETRANGERE', label: 'Facture étrangère' },
  { value: 'RECU_MOBILE_MONEY', label: 'Reçu Mobile Money' },
  { value: 'RECU_EMAIL', label: 'Reçu email' },
  { value: 'AUTRE', label: 'Autre' },
]

const STATUT_COLORS: Record<string, string> = {
  AUTO_VALIDEE: 'bg-green-100 text-green-700',
  VALIDEE: 'bg-green-100 text-green-700',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  REJETEE: 'bg-red-100 text-red-700',
  AUDIT_REQUIS: 'bg-orange-100 text-orange-700',
}

const STATUT_LABELS: Record<string, string> = {
  AUTO_VALIDEE: 'Auto-validée', VALIDEE: 'Validée',
  EN_ATTENTE: 'En attente', REJETEE: 'Rejetée', AUDIT_REQUIS: 'Audit requis',
}

export default function DepensesPage() {
  const [depenses, setDepenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form
  const [dateDepense, setDateDepense] = useState(new Date().toISOString().slice(0, 10))
  const [categorie, setCategorie] = useState('')
  const [description, setDescription] = useState('')
  const [montant, setMontant] = useState('')
  const [fournisseurNom, setFournisseurNom] = useState('')
  const [fournisseurIfu, setFournisseurIfu] = useState('')
  const [justificatifType, setJustificatifType] = useState('')

  async function fetchDepenses() {
    setLoading(true)
    try {
      const res = await fetch('/api/depenses')
      const data = await res.json()
      setDepenses(data.depenses || [])
    } catch {
      setDepenses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDepenses() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!categorie || !montant || !dateDepense) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/depenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateDepense, categorie, description, montant, fournisseurNom, fournisseurIfu, justificatifType }),
      })
      const data = await res.json()
      if (data.success) {
        setShowForm(false)
        setCategorie(''); setMontant(''); setDescription(''); setFournisseurNom(''); setFournisseurIfu(''); setJustificatifType('')
        fetchDepenses()
      } else {
        setError(data.error || 'Erreur lors de l\'ajout.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalDepenses = depenses.reduce((s, d) => s + d.montantXof, 0)
  const depensesValidees = depenses.filter(d => ['AUTO_VALIDEE', 'VALIDEE'].includes(d.statutValidation)).reduce((s, d) => s + d.montantXof, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#004D2C] font-bold text-2xl">Dépenses</h1>
          <p className="text-gray-500 text-sm mt-0.5">{depenses.length} dépense{depenses.length !== 1 ? 's' : ''} enregistrée{depenses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter une dépense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-400 mb-1">Total dépenses</div>
          <div className="text-xl font-bold text-[#004D2C]">{formatFCFA(totalDepenses)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-400 mb-1">Validées (déductibles)</div>
          <div className="text-xl font-bold text-green-700">{formatFCFA(depensesValidees)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="text-xs text-gray-400 mb-1">En attente validation</div>
          <div className="text-xl font-bold text-yellow-600">{depenses.filter(d => d.statutValidation === 'EN_ATTENTE').length}</div>
        </div>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#004D2C] font-bold text-lg">Ajouter une dépense</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={dateDepense} onChange={e => setDateDepense(e.target.value)} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (XOF) *</label>
                  <input type="number" min="0" value={montant} onChange={e => setMontant(e.target.value)} required placeholder="25000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                <select value={categorie} onChange={e => setCategorie(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]">
                  <option value="">Choisir une catégorie</option>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Détail de la dépense"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                  <input value={fournisseurNom} onChange={e => setFournisseurNom(e.target.value)} placeholder="Nom du fournisseur"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IFU fournisseur</label>
                  <input value={fournisseurIfu} onChange={e => setFournisseurIfu(e.target.value)} placeholder="0012345678901"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de justificatif</label>
                <select value={justificatifType} onChange={e => setJustificatifType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]">
                  <option value="">Choisir</option>
                  {JUSTIFICATIFS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-[#006B3F] hover:bg-[#004D2C] disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
                  {submitting ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Chargement...</div>
        ) : depenses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">Aucune dépense enregistrée</p>
            <button onClick={() => setShowForm(true)} className="mt-2 text-[#006B3F] text-sm font-medium hover:underline">
              Ajouter votre première dépense →
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Catégorie</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Montant</th>
                <th className="px-6 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {depenses.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.dateDepense).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {CATEGORIES.find(c => c.value === d.categorie)?.label || d.categorie}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{d.description || '—'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#004D2C]">{formatFCFA(d.montantXof)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[d.statutValidation] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUT_LABELS[d.statutValidation] || d.statutValidation}
                    </span>
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
