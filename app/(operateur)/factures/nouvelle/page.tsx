'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function formatFCFA(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

interface Ligne {
  description: string
  quantite: number
  prixUnitaire: number
}

export default function NouvelleFacturePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)
  const [dgiSyncing, setDgiSyncing] = useState(false)

  // Client
  const [clientNom, setClientNom] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientTelephone, setClientTelephone] = useState('')
  const [clientIfu, setClientIfu] = useState('')
  const [dateEcheance, setDateEcheance] = useState('')
  const [modeLivraison, setModeLivraison] = useState<string[]>([])

  // Lignes
  const [lignes, setLignes] = useState<Ligne[]>([
    { description: '', quantite: 1, prixUnitaire: 0 },
  ])

  function updateLigne(i: number, field: keyof Ligne, value: string | number) {
    setLignes(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  function addLigne() {
    setLignes(prev => [...prev, { description: '', quantite: 1, prixUnitaire: 0 }])
  }

  function removeLigne(i: number) {
    if (lignes.length <= 1) return
    setLignes(prev => prev.filter((_, idx) => idx !== i))
  }

  const montantHT = lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0)
  const tva = 0
  const montantTTC = montantHT + tva

  function toggleLivraison(mode: string) {
    setModeLivraison(prev =>
      prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
    )
  }

  async function handleDgiSync() {
    setDgiSyncing(true)
    await new Promise(r => setTimeout(r, 1500))
    setDgiSyncing(false)
    alert('Synchronisation DGI simulée — Référence : DGI-' + Math.random().toString(36).slice(2, 10).toUpperCase())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!clientNom) { setError('Le nom du client est obligatoire.'); return }
    if (lignes.some(l => !l.description || l.prixUnitaire <= 0)) {
      setError('Toutes les lignes doivent avoir une description et un prix.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/factures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientNom, clientEmail, clientTelephone, clientIfu, lignes, dateEcheance: dateEcheance || null, modeLivraison }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(data.facture)
      } else {
        setError(data.error || 'Erreur lors de la création.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#006B3F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[#004D2C] font-bold text-xl mb-2">Facture créée !</h2>
          <p className="text-gray-500 text-sm mb-1">Numéro : <span className="font-mono font-bold text-[#006B3F]">{success.numero}</span></p>
          <p className="text-gray-500 text-sm mb-6">Montant TTC : <span className="font-bold text-[#004D2C]">{formatFCFA(success.montantTTC)}</span></p>
          <div className="flex gap-3">
            <button onClick={() => { setSuccess(null); setClientNom(''); setLignes([{ description: '', quantite: 1, prixUnitaire: 0 }]) }}
              className="flex-1 border border-[#006B3F] text-[#006B3F] rounded-xl py-2.5 text-sm font-semibold hover:bg-[#E8F5EE] transition-colors">
              Nouvelle facture
            </button>
            <button onClick={() => router.push('/factures')}
              className="flex-1 bg-[#006B3F] hover:bg-[#004D2C] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors">
              Voir mes factures
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-[#004D2C] font-bold text-2xl">Nouvelle facture</h1>
          <p className="text-gray-500 text-sm">Créer et envoyer une facture</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Informations client */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[#004D2C] font-semibold mb-4">Informations client</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom / Raison sociale *</label>
              <input value={clientNom} onChange={e => setClientNom(e.target.value)} required placeholder="Client SARL"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input value={clientTelephone} onChange={e => setClientTelephone(e.target.value)} placeholder="+22961..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IFU client (optionnel)</label>
              <input value={clientIfu} onChange={e => setClientIfu(e.target.value)} placeholder="0012345678901"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
              <input type="date" value={dateEcheance} onChange={e => setDateEcheance(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode de livraison</label>
            <div className="flex gap-2 flex-wrap">
              {['Livraison locale', 'Livraison internationale', 'Dématérialisé', 'Retrait en main propre'].map(m => (
                <button key={m} type="button" onClick={() => toggleLivraison(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    modeLivraison.includes(m)
                      ? 'bg-[#006B3F] text-white border-[#006B3F]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-[#006B3F]'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lignes de facturation */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-[#004D2C] font-semibold mb-4">Lignes de facturation</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium uppercase tracking-wide px-1">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-center">Qté</div>
              <div className="col-span-3 text-right">Prix unitaire</div>
              <div className="col-span-1" />
            </div>
            {lignes.map((ligne, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <input value={ligne.description} onChange={e => updateLigne(i, 'description', e.target.value)}
                    placeholder="Service ou produit" required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
                </div>
                <div className="col-span-2">
                  <input type="number" min="1" value={ligne.quantite} onChange={e => updateLigne(i, 'quantite', parseFloat(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
                </div>
                <div className="col-span-3">
                  <input type="number" min="0" value={ligne.prixUnitaire} onChange={e => updateLigne(i, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removeLigne(i)} className="text-red-300 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="col-span-12 text-right text-xs text-gray-400 pr-8">
                  = {formatFCFA(ligne.quantite * ligne.prixUnitaire)}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addLigne}
            className="mt-3 flex items-center gap-1.5 text-[#006B3F] text-sm font-medium hover:underline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une ligne
          </button>

          {/* Totaux */}
          <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Sous-total HT</span>
              <span>{formatFCFA(montantHT)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>TVA (0% — micro-opérateur DNEN)</span>
              <span>{formatFCFA(tva)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#004D2C] border-t border-gray-200 pt-2">
              <span>Total TTC</span>
              <span>{formatFCFA(montantTTC)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={handleDgiSync} disabled={dgiSyncing}
            className="flex items-center gap-2 border border-[#006B3F] text-[#006B3F] hover:bg-[#E8F5EE] rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50">
            {dgiSyncing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Sync DGI
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-[#006B3F] hover:bg-[#004D2C] disabled:opacity-60 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
            {loading ? 'Création en cours...' : 'Créer la facture'}
          </button>
        </div>
      </form>
    </div>
  )
}
