'use client'

import { useEffect, useState } from 'react'

function formatFCFA(n: number) {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

function StatutBadge({ statut }: { statut: string }) {
  const c: Record<string, string> = {
    CALCULEE: 'bg-blue-100 text-blue-700',
    PAYEE: 'bg-green-100 text-green-700',
    EN_RETARD: 'bg-red-100 text-red-700',
  }
  const l: Record<string, string> = { CALCULEE: 'À payer', PAYEE: 'Payée', EN_RETARD: 'En retard' }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c[statut] || 'bg-gray-100'}`}>{l[statut] || statut}</span>
}

function AttestationButton({ declarationId }: { declarationId: string }) {
  return (
    <a
      href={`/api/fiscal/attestation/${declarationId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 bg-[#E8F5EE] hover:bg-[#006B3F] text-[#006B3F] hover:text-white border border-[#006B3F]/30 hover:border-[#006B3F] rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap"
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Attestation
    </a>
  )
}

export default function FiscalPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modePaiement, setModePaiement] = useState('')
  const [paying, setPaying] = useState(false)
  const [payResult, setPayResult] = useState<string | null>(null)
  const [paidDeclarationId, setPaidDeclarationId] = useState<string | null>(null)

  async function fetchFiscal() {
    setLoading(true)
    try {
      const res = await fetch('/api/fiscal')
      const d = await res.json()
      setData(d)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFiscal() }, [])

  async function handlePayer() {
    if (!modePaiement) return
    setPaying(true)
    try {
      const moisCourant = data?.historique?.[0]
      const res = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periode: moisCourant?.periode, modePaiement }),
      })
      const d = await res.json()
      if (d.success) {
        setPayResult(d.message + ' · Réf: ' + d.reference)
        setPaidDeclarationId(d.declarationId || null)
        fetchFiscal()
      }
    } catch {
      setPayResult('Erreur lors du paiement simulé.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Chargement...</div>

  const moisCourant = data?.historique?.[0]
  const isPaye = moisCourant?.statut === 'PAYEE'
  // Use the declarationId from post-payment state first, then from API (for already-paid months)
  const currentDeclarationId = paidDeclarationId || (isPaye ? moisCourant?.declarationId : null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#004D2C] font-bold text-2xl">Fiscal</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestion de vos déclarations et paiements fiscaux</p>
      </div>

      {/* Déclaration mois courant */}
      {moisCourant && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[#004D2C] font-semibold text-lg capitalize">{moisCourant.label}</h2>
              <p className="text-gray-400 text-sm">Déclaration du mois en cours</p>
            </div>
            <StatutBadge statut={moisCourant.statut} />
          </div>

          {/* Détail calcul */}
          <div className="bg-[#E8F5EE] rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Chiffre d'affaires total</span>
              <span className="font-semibold text-[#004D2C]">{formatFCFA(moisCourant.caTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Dépenses validées</span>
              <span className="font-semibold text-gray-700">— {formatFCFA(moisCourant.depensesValidees)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#006B3F]/20 pt-2">
              <span className="text-gray-600 font-medium">Bénéfice net</span>
              <span className="font-bold text-[#006B3F]">{formatFCFA(moisCourant.beneficeNet)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Régime :
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${moisCourant.regime === 'BENEFICE_REEL' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {moisCourant.regime === 'BENEFICE_REEL' ? 'Bénéfice réel' : 'Forfait sectoriel'}
                </span>
              </span>
              <span className="text-sm text-gray-500">Taux : {(moisCourant.tauxApplique * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Impôt calculé</span>
              <span className="font-semibold">{formatFCFA(moisCourant.impotCalcule)}</span>
            </div>
            {moisCourant.reductionNiveau > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Réduction niveau ({(moisCourant.reductionNiveau * 100).toFixed(0)}%)</span>
                <span>— {formatFCFA(moisCourant.impotCalcule * moisCourant.reductionNiveau)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#004D2C] border-t border-[#006B3F]/20 pt-2">
              <span>Impôt final à payer</span>
              <span className="text-[#E8112D]">{formatFCFA(moisCourant.impotFinal)}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-gray-400">
              Date limite : <span className="font-medium">{new Date(moisCourant.dateLimite).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              {currentDeclarationId && (
                <AttestationButton declarationId={currentDeclarationId} />
              )}
              {!isPaye && (
                <button onClick={() => { setPayResult(null); setModePaiement(''); setShowModal(true) }}
                  className="bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors">
                  Payer maintenant
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historique */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[#004D2C] font-semibold mb-4">Historique des 6 derniers mois</h2>

        {/* Mobile: cards */}
        <div className="lg:hidden space-y-3">
          {(data?.historique || []).map((h: any, i: number) => (
            <div key={h.periode} className={`rounded-xl border p-4 space-y-2 ${i === 0 ? 'border-[#006B3F]/30 bg-[#E8F5EE]/40' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 capitalize">{h.label}</span>
                <StatutBadge statut={h.statut} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CA</span>
                <span className="font-medium">{formatFCFA(h.caTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bénéfice net</span>
                <span className="font-medium text-[#006B3F]">{formatFCFA(h.beneficeNet)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Impôt : </span>
                  <span className="text-sm font-bold text-[#E8112D]">{formatFCFA(h.impotFinal)}</span>
                </div>
                {h.statut === 'PAYEE' && h.declarationId && (
                  <AttestationButton declarationId={h.declarationId} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <tr>
                <th className="pb-3 font-medium">Période</th>
                <th className="pb-3 font-medium">CA</th>
                <th className="pb-3 font-medium">Bénéfice</th>
                <th className="pb-3 font-medium">Impôt</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Attestation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.historique || []).map((h: any, i: number) => (
                <tr key={h.periode} className={`hover:bg-gray-50 transition-colors ${i === 0 ? 'font-medium' : ''}`}>
                  <td className="py-3 text-sm capitalize">{h.label}</td>
                  <td className="py-3 text-sm">{formatFCFA(h.caTotal)}</td>
                  <td className="py-3 text-sm text-[#006B3F]">{formatFCFA(h.beneficeNet)}</td>
                  <td className="py-3 text-sm font-bold text-[#E8112D]">{formatFCFA(h.impotFinal)}</td>
                  <td className="py-3"><StatutBadge statut={h.statut} /></td>
                  <td className="py-3">
                    {h.statut === 'PAYEE' && h.declarationId ? (
                      <AttestationButton declarationId={h.declarationId} />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal paiement */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#004D2C] font-bold text-lg">Payer {formatFCFA(moisCourant?.impotFinal || 0)}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {payResult ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm text-center">
                  <svg className="w-6 h-6 mx-auto mb-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {payResult}
                </div>
                {paidDeclarationId && (
                  <a
                    href={`/api/fiscal/attestation/${paidDeclarationId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#004D2C] hover:bg-[#006B3F] text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Télécharger l&apos;attestation fiscale
                  </a>
                )}
                <button onClick={() => { setShowModal(false); setPayResult(null); setModePaiement('') }}
                  className="w-full text-gray-400 text-sm hover:text-gray-600 hover:underline">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Choisissez votre opérateur Mobile Money :</p>
                <div className="space-y-2">
                  {[
                    { id: 'mtn', label: 'MTN MoMo', color: 'bg-yellow-400', text: '#004D2C' },
                    { id: 'moov', label: 'Moov Money', color: 'bg-blue-600', text: 'white' },
                    { id: 'celtiis', label: 'Celtiis Cash', color: 'bg-red-600', text: 'white' },
                  ].map(op => (
                    <button key={op.id} onClick={() => setModePaiement(op.label)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-colors ${
                        modePaiement === op.label ? 'border-[#006B3F] bg-[#E8F5EE]' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className={`w-9 h-9 ${op.color} rounded-full flex items-center justify-center text-xs font-bold`}
                        style={{ color: op.text }}>
                        {op.label.slice(0, 1)}
                      </div>
                      <span className="font-medium text-sm">{op.label}</span>
                      {modePaiement === op.label && (
                        <svg className="w-4 h-4 text-[#006B3F] ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <button onClick={handlePayer} disabled={!modePaiement || paying}
                  className="mt-4 w-full bg-[#006B3F] hover:bg-[#004D2C] disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
                  {paying ? 'Traitement en cours...' : `Confirmer le paiement — ${formatFCFA(moisCourant?.impotFinal || 0)}`}
                </button>
                <p className="mt-2 text-center text-xs text-gray-400">Paiement simulé — MVP Démonstration</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
