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

function DepenseForm({
  title,
  initial,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  title: string
  initial?: any
  onClose: () => void
  onSubmit: (formData: FormData) => Promise<void>
  submitting: boolean
  error: string
}) {
  const [dateDepense, setDateDepense] = useState(initial?.dateDepense ? new Date(initial.dateDepense).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [categorie, setCategorie] = useState(initial?.categorie || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [montant, setMontant] = useState(initial?.montantXof?.toString() || '')
  const [fournisseurNom, setFournisseurNom] = useState(initial?.fournisseurNom || '')
  const [fournisseurIfu, setFournisseurIfu] = useState(initial?.fournisseurIfu || '')
  const [justificatifType, setJustificatifType] = useState(initial?.justificatifType || '')
  const [justificatifFile, setJustificatifFile] = useState<File | null>(null)
  const [justificatifPreview, setJustificatifPreview] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setJustificatifFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setJustificatifPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setJustificatifPreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.append('dateDepense', dateDepense)
    fd.append('categorie', categorie)
    fd.append('description', description)
    fd.append('montant', montant)
    fd.append('fournisseurNom', fournisseurNom)
    fd.append('fournisseurIfu', fournisseurIfu)
    fd.append('justificatifType', justificatifType)
    if (justificatifFile) fd.append('justificatif', justificatifFile)
    await onSubmit(fd)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#004D2C] font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justificatif (photo ou PDF){initial?.justificatifUrl && ' — laisser vide pour conserver l\'actuel'}
            </label>
            {initial?.justificatifUrl && !justificatifFile && (
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8F5EE] text-[#006B3F] border border-[#006B3F]/20">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Justificatif existant
                </span>
                <a href={initial.justificatifUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-[#006B3F] hover:underline font-medium">Voir</a>
              </div>
            )}
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F] file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#E8F5EE] file:text-[#006B3F] file:text-xs file:font-medium"
            />
            {justificatifPreview && (
              <img src={justificatifPreview} alt="Aperçu" className="mt-2 max-h-32 rounded-lg border border-gray-200 object-cover" />
            )}
            {justificatifFile && !justificatifPreview && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4 text-[#006B3F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {justificatifFile.name}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={submitting || !categorie || !montant}
              className="flex-1 bg-[#006B3F] hover:bg-[#004D2C] disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
              {submitting ? 'Enregistrement...' : (initial ? 'Enregistrer' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function DepensesPage() {
  const [depenses, setDepenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editDepense, setEditDepense] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

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

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  async function handleAdd(fd: FormData) {
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/depenses', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        setShowForm(false)
        showSuccess('Dépense ajoutée avec succès.')
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

  async function handleEdit(fd: FormData) {
    if (!editDepense) return
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/depenses/${editDepense.id}`, { method: 'PATCH', body: fd })
      const data = await res.json()
      if (data.success) {
        setEditDepense(null)
        showSuccess('Dépense modifiée avec succès.')
        fetchDepenses()
      } else {
        setError(data.error || 'Erreur lors de la modification.')
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
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white rounded-xl px-4 py-3 text-sm font-medium shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#004D2C] font-bold text-2xl">Dépenses</h1>
          <p className="text-gray-500 text-sm mt-0.5">{depenses.length} dépense{depenses.length !== 1 ? 's' : ''} enregistrée{depenses.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setError(''); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Ajouter une dépense</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
          <div className="text-xs text-gray-400 mb-1 leading-tight">Total dépenses</div>
          <div className="text-base sm:text-xl font-bold text-[#004D2C]">{formatFCFA(totalDepenses)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
          <div className="text-xs text-gray-400 mb-1 leading-tight">Validées</div>
          <div className="text-base sm:text-xl font-bold text-green-700">{formatFCFA(depensesValidees)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
          <div className="text-xs text-gray-400 mb-1 leading-tight">En attente</div>
          <div className="text-base sm:text-xl font-bold text-yellow-600">{depenses.filter(d => d.statutValidation === 'EN_ATTENTE').length}</div>
        </div>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <DepenseForm
          title="Ajouter une dépense"
          onClose={() => setShowForm(false)}
          onSubmit={handleAdd}
          submitting={submitting}
          error={error}
        />
      )}

      {/* Formulaire édition */}
      {editDepense && (
        <DepenseForm
          title="Modifier la dépense"
          initial={editDepense}
          onClose={() => { setEditDepense(null); setError('') }}
          onSubmit={handleEdit}
          submitting={submitting}
          error={error}
        />
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
          <>
            {/* Mobile: cards */}
            <div className="lg:hidden divide-y divide-gray-50">
              {depenses.map(d => (
                <div key={d.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-800">
                        {CATEGORIES.find(c => c.value === d.categorie)?.label || d.categorie}
                      </div>
                      {d.description && <div className="text-xs text-gray-500 truncate">{d.description}</div>}
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(d.dateDepense).toLocaleDateString('fr-FR')}{d.fournisseurNom && ` · ${d.fournisseurNom}`}</div>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[d.statutValidation] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUT_LABELS[d.statutValidation] || d.statutValidation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-[#004D2C]">{formatFCFA(d.montantXof)}</span>
                      {d.justificatifUrl && (
                        <a href={d.justificatifUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8F5EE] text-[#006B3F] border border-[#006B3F]/20">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Justificatif
                        </a>
                      )}
                    </div>
                    <button onClick={() => { setError(''); setEditDepense(d) }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#006B3F] hover:bg-[#E8F5EE] px-3 py-1.5 rounded-lg transition-colors border border-[#006B3F]/30">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <table className="hidden lg:table w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Catégorie</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Montant</th>
                  <th className="px-6 py-3 font-medium">Statut</th>
                  <th className="px-6 py-3 font-medium">Justificatif</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {depenses.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.dateDepense).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {CATEGORIES.find(c => c.value === d.categorie)?.label || d.categorie}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{d.description || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#004D2C]">{formatFCFA(d.montantXof)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[d.statutValidation] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUT_LABELS[d.statutValidation] || d.statutValidation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {d.justificatifUrl ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8F5EE] text-[#006B3F] border border-[#006B3F]/20">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Joint
                          </span>
                          <a href={d.justificatifUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#006B3F] hover:underline font-medium">Voir</a>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => { setError(''); setEditDepense(d) }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#006B3F] hover:bg-[#E8F5EE] px-2.5 py-1.5 rounded-lg transition-colors border border-[#006B3F]/30">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
