'use client'

import { useState } from 'react'

interface Formation {
  id: string
  titre: string
  description: string | null
  format: string
  dureeMin: number
  niveauMin: string
  gratuit: boolean
}

interface FormationCardProps {
  formation: Formation
  locked: boolean
  pct: number
  termine: boolean
}

const FORMAT_ICONS: Record<string, string> = {
  video: '🎬', pdf: '📄', live: '🔴', quiz: '📝', default: '📚',
}

function FormationModal({
  formation,
  initialPct,
  initialTermine,
  onClose,
}: {
  formation: Formation
  initialPct: number
  initialTermine: boolean
  onClose: (newPct: number, newTermine: boolean) => void
}) {
  const [pct, setPct] = useState(initialPct)
  const [termine, setTermine] = useState(initialTermine)
  const [loading, setLoading] = useState(false)
  const [simulatingProgress, setSimulatingProgress] = useState(false)

  const formatIcon = FORMAT_ICONS[formation.format?.toLowerCase()] || FORMAT_ICONS.default

  async function handleMarkDone() {
    setLoading(true)
    try {
      await fetch(`/api/academie/${formation.id}/progression`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressionPct: 100, termine: true }),
      })
      setPct(100)
      setTermine(true)
      onClose(100, true)
    } catch {
      // silently ignore for demo
    } finally {
      setLoading(false)
    }
  }

  function handleSimulateProgress() {
    if (simulatingProgress || termine) return
    setSimulatingProgress(true)
    let current = pct
    const interval = setInterval(() => {
      current = Math.min(current + Math.floor(Math.random() * 15) + 5, 95)
      setPct(current)
      if (current >= 95) clearInterval(interval)
    }, 400)
    setTimeout(() => {
      clearInterval(interval)
      setSimulatingProgress(false)
    }, 3000)
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(pct, termine) }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004D2C] to-[#006B3F] p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{formatIcon}</span>
              <span className="text-sm font-semibold opacity-80 capitalize">{formation.format}</span>
            </div>
            <button
              onClick={() => onClose(pct, termine)}
              className="text-white/70 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>
          <h2 className="text-white font-bold text-base mt-3 leading-snug">{formation.titre}</h2>
          <div className="flex items-center gap-3 mt-2 text-white/60 text-xs">
            <span>⏱ {formation.dureeMin} min</span>
            <span>•</span>
            <span>{formation.niveauMin}</span>
            {formation.gratuit && (
              <>
                <span>•</span>
                <span className="bg-[#FCD116] text-[#004D2C] font-semibold px-2 py-0.5 rounded-full text-xs">
                  Gratuit
                </span>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {formation.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{formation.description}</p>
          )}

          {/* Contenu simulé */}
          <div className="bg-[#E8F5EE] border border-[#006B3F]/15 rounded-xl p-4">
            {formation.format === 'video' || formation.format === 'live' ? (
              <div className="aspect-video bg-[#004D2C] rounded-lg flex flex-col items-center justify-center text-white gap-2 mb-3">
                <div className="text-4xl">{formatIcon}</div>
                <div className="text-xs opacity-60">
                  {formation.format === 'live' ? 'Session live — Prochainement' : 'Contenu vidéo disponible après activation'}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-lg p-4 mb-3 min-h-[80px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-1">{formatIcon}</div>
                  <div className="text-xs text-gray-400">
                    {formation.format === 'pdf' ? 'Document PDF — 12 pages' : 'Contenu interactif'}
                  </div>
                </div>
              </div>
            )}
            <div className="text-xs text-[#004D2C] font-medium mb-1">Résumé pédagogique</div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Cette formation couvre les fondamentaux essentiels pour tout opérateur numérique béninois.
              À l&apos;issue de ce module, vous aurez une maîtrise complète des obligations légales,
              des procédures administratives et des bonnes pratiques du secteur.
            </p>
          </div>

          {/* Barre de progression */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Votre progression</span>
              <span className="font-semibold text-[#004D2C]">{pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-2 bg-[#006B3F] rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            {!termine && pct < 95 && (
              <button
                onClick={handleSimulateProgress}
                disabled={simulatingProgress}
                className="mt-2 text-xs text-[#006B3F] underline disabled:no-underline disabled:text-gray-400"
              >
                {simulatingProgress ? 'Simulation en cours…' : 'Simuler la lecture'}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => onClose(pct, termine)}
              className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
            {termine ? (
              <div className="flex-1 bg-green-100 text-green-700 rounded-xl py-2.5 text-sm font-semibold text-center">
                ✓ Formation terminée
              </div>
            ) : (
              <button
                onClick={handleMarkDone}
                disabled={loading}
                className="flex-1 bg-[#006B3F] hover:bg-[#004D2C] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {loading ? 'Enregistrement…' : 'Marquer comme terminé'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FormationCard({ formation, locked, pct: initialPct, termine: initialTermine }: FormationCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [pct, setPct] = useState(initialPct)
  const [termine, setTermine] = useState(initialTermine)

  const formatIcon = FORMAT_ICONS[formation.format?.toLowerCase()] || FORMAT_ICONS.default

  function handleClose(newPct: number, newTermine: boolean) {
    setPct(newPct)
    setTermine(newTermine)
    setShowModal(false)
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
          locked ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-[#006B3F]/30 hover:shadow-md'
        }`}
      >
        {/* Header */}
        <div className={`p-4 ${locked ? 'bg-gray-50' : 'bg-[#E8F5EE]'}`}>
          <div className="flex items-start justify-between">
            <div className="text-2xl">{formatIcon}</div>
            <div className="flex gap-1.5">
              {termine && (
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">✓ Terminé</span>
              )}
              {locked && (
                <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">🔒 {formation.niveauMin}</span>
              )}
              {formation.gratuit && !locked && (
                <span className="bg-[#006B3F] text-white text-xs font-medium px-2 py-0.5 rounded-full">Gratuit</span>
              )}
            </div>
          </div>
          <h3 className={`font-bold mt-2 text-sm leading-snug ${locked ? 'text-gray-400' : 'text-[#004D2C]'}`}>
            {formation.titre}
          </h3>
        </div>

        <div className="p-4">
          {formation.description && (
            <p className="text-gray-500 text-xs mb-3 line-clamp-2">{formation.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span>⏱ {formation.dureeMin} min</span>
            <span className="capitalize">{formation.format}</span>
          </div>

          {!locked && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progression</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div className="h-1.5 bg-[#006B3F] rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {locked ? (
            <div className="mt-3 text-center text-xs text-gray-400">
              Disponible à partir du niveau {formation.niveauMin}
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                termine
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-[#006B3F] hover:bg-[#004D2C] text-white'
              }`}
            >
              {termine ? 'Revoir la formation' : pct > 0 ? 'Continuer' : 'Commencer'}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <FormationModal
          formation={formation}
          initialPct={pct}
          initialTermine={termine}
          onClose={handleClose}
        />
      )}
    </>
  )
}
