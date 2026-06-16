'use client'

import { useEffect, useState } from 'react'

const SECTEURS_LABELS: Record<string, string> = {
  DROPSHIPPING: 'Dropshipping',
  ECOMMERCE: 'E-Commerce',
  FREELANCE: 'Freelance',
  INFLUENCE: 'Influence / Content Creator',
  CONTENU: 'Création de Contenu',
  FORMATION: 'Formation en ligne',
  COACHING: 'Coaching',
  TRADING: 'Trading',
  CRYPTOACTIFS: 'Crypto-actifs',
  DEVELOPPEMENT: 'Développement web/app',
  AUTRE: 'Autre',
}

const NIVEAUX_LABELS: Record<string, string> = {
  STARTER: 'Starter',
  BUILDER: 'Builder',
  ACHIEVER: 'Achiever',
  CHAMPION: 'Champion',
  ELITE: 'Elite',
}

const STATUT_COLORS: Record<string, string> = {
  ACTIF: 'text-green-300',
  SUSPENDU: 'text-amber-300',
  RADIE: 'text-red-300',
  EN_ATTENTE: 'text-yellow-300',
}

interface ProfileData {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string | null
  ifu: string | null
  lan: string | null
  secteur: string
  niveau: string
  statut: string
  ville: string | null
  quartier: string | null
  description: string | null
  dateInscription: string
  scoreConformite: number
  stats: {
    totalDeclarations: number
    declarationsPayees: number
    totalFactures: number
    facturesPayees: number
  }
}

interface EditForm {
  telephone: string
  ville: string
  quartier: string
  description: string
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<EditForm>({ telephone: '', ville: '', quartier: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/operateurs/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return }
        setProfile(data)
        setForm({
          telephone: data.telephone ?? '',
          ville: data.ville ?? '',
          quartier: data.quartier ?? '',
          description: data.description ?? '',
        })
        setLoading(false)
      })
      .catch(() => { setError('Erreur de connexion'); setLoading(false) })
  }, [])

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/operateurs/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error ?? 'Erreur lors de la sauvegarde', false)
      } else {
        setProfile((prev) => prev ? { ...prev, ...form } : prev)
        setShowModal(false)
        showToast('Profil mis à jour avec succès', true)
      }
    } catch {
      showToast('Erreur de connexion', false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          {error ?? 'Profil non disponible'}
        </div>
      </div>
    )
  }

  const score = profile.scoreConformite
  const scoreColor = score >= 70 ? 'text-[#006B3F]' : score >= 40 ? 'text-amber-600' : 'text-[#E8112D]'
  const scoreBarColor = score >= 70 ? 'bg-[#006B3F]' : score >= 40 ? 'bg-amber-500' : 'bg-[#E8112D]'

  return (
    <div className="max-w-2xl space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.ok ? 'bg-[#006B3F]' : 'bg-[#E8112D]'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[#004D2C] font-bold text-2xl">Mon Profil</h1>
          <p className="text-gray-500 text-sm mt-1">Licence d'Activité Numérique et informations personnelles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#004D2C] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#006B3F] transition-colors"
        >
          Modifier
        </button>
      </div>

      {/* Carte LAN */}
      <div className="bg-gradient-to-br from-[#004D2C] to-[#006B3F] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Licence d'Activité Numérique</div>
            <div className="text-2xl font-bold font-mono tracking-widest">
              {profile.lan ?? 'En cours d\'attribution'}
            </div>
            <div className="text-white/80 text-sm mt-1">{profile.prenom} {profile.nom}</div>
          </div>
          <span className="bg-[#FCD116] text-[#004D2C] inline-flex items-center px-3 py-1 rounded-full text-xs font-bold">
            {NIVEAUX_LABELS[profile.niveau] ?? profile.niveau}
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
          <div>
            <div className="text-white/50 text-xs">Secteur</div>
            <div className="text-white font-medium">{SECTEURS_LABELS[profile.secteur] ?? profile.secteur}</div>
          </div>
          <div>
            <div className="text-white/50 text-xs">Statut</div>
            <div className={`font-bold ${STATUT_COLORS[profile.statut] ?? 'text-white'}`}>
              {profile.statut.replace('_', ' ')}
            </div>
          </div>
          <div>
            <div className="text-white/50 text-xs">Membre depuis</div>
            <div className="text-white font-medium">
              {new Date(profile.dateInscription).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="mt-4 flex rounded-lg overflow-hidden h-1">
          <div className="flex-1 bg-[#006B3F]" />
          <div className="flex-1 bg-[#FCD116]" />
          <div className="flex-1 bg-[#E8112D]" />
        </div>
      </div>

      {/* Informations */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-[#004D2C] font-semibold">Informations personnelles</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Prénom</label>
            <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">{profile.prenom}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
            <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">{profile.nom}</div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">{profile.email}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
          <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">
            {profile.telephone ?? <span className="text-gray-400 italic">Non renseigné</span>}
          </div>
        </div>
        {profile.ifu && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">IFU</label>
            <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono bg-gray-50 flex items-center justify-between">
              {profile.ifu}
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vérifié</span>
            </div>
          </div>
        )}
        {(profile.ville || profile.quartier) && (
          <div className="grid grid-cols-2 gap-4">
            {profile.ville && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">{profile.ville}</div>
              </div>
            )}
            {profile.quartier && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Quartier</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">{profile.quartier}</div>
              </div>
            )}
          </div>
        )}
        {profile.description && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description de l'activité</label>
            <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">{profile.description}</div>
          </div>
        )}
      </div>

      {/* Score conformité */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[#004D2C] font-semibold mb-4">Score de conformité</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className={`text-4xl font-bold ${scoreColor}`}>{score}</div>
          <div className="flex-1">
            <div className="h-3 bg-gray-100 rounded-full mb-1">
              <div className={`h-3 ${scoreBarColor} rounded-full transition-all`} style={{ width: `${score}%` }} />
            </div>
            <div className="text-xs text-gray-400">Score sur 100</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className={`rounded-xl p-3 ${profile.stats.declarationsPayees >= profile.stats.totalDeclarations && profile.stats.totalDeclarations > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
            <div className={`text-lg font-bold ${profile.stats.declarationsPayees >= profile.stats.totalDeclarations && profile.stats.totalDeclarations > 0 ? 'text-green-700' : 'text-amber-700'}`}>
              {profile.stats.declarationsPayees}/{profile.stats.totalDeclarations}
            </div>
            <div className={`text-xs ${profile.stats.declarationsPayees >= profile.stats.totalDeclarations && profile.stats.totalDeclarations > 0 ? 'text-green-600' : 'text-amber-600'}`}>
              Déclarations
            </div>
          </div>
          <div className={`rounded-xl p-3 ${profile.stats.facturesPayees > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className={`text-lg font-bold ${profile.stats.facturesPayees > 0 ? 'text-green-700' : 'text-gray-500'}`}>
              {profile.stats.facturesPayees}/{profile.stats.totalFactures}
            </div>
            <div className={`text-xs ${profile.stats.facturesPayees > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              Factures payées
            </div>
          </div>
          <div className={`rounded-xl p-3 ${profile.statut === 'ACTIF' ? 'bg-green-50' : 'bg-amber-50'}`}>
            <div className={`text-lg font-bold ${profile.statut === 'ACTIF' ? 'text-green-700' : 'text-amber-700'}`}>
              {profile.statut === 'ACTIF' ? '✓' : '!'}
            </div>
            <div className={`text-xs ${profile.statut === 'ACTIF' ? 'text-green-600' : 'text-amber-600'}`}>
              Compte actif
            </div>
          </div>
        </div>
      </div>

      {/* Modal modifier */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[#004D2C] font-bold text-lg">Modifier le profil</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                Seuls les champs de contact peuvent être modifiés. Pour modifier l'email ou l'IFU, contactez la DNEN.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004D2C]"
                  placeholder="+229 61 XX XX XX"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={form.ville}
                    onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004D2C]"
                    placeholder="Cotonou"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quartier</label>
                  <input
                    type="text"
                    value={form.quartier}
                    onChange={(e) => setForm((f) => ({ ...f, quartier: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004D2C]"
                    placeholder="Akpakpa"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description de l'activité</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004D2C] resize-none"
                  placeholder="Décrivez votre activité numérique..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#004D2C] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#006B3F] transition-colors disabled:opacity-60"
              >
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
