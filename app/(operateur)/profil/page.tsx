'use client'

import { useSession } from 'next-auth/react'

const SECTEURS_LABELS: Record<string, string> = {
  DROPSHIPPING: 'Dropshipping', ECOMMERCE: 'E-Commerce', FREELANCE: 'Freelance',
  INFLUENCE: 'Influence / Content Creator', CONTENU: 'Création de Contenu',
  FORMATION: 'Formation en ligne', COACHING: 'Coaching', TRADING: 'Trading',
  CRYPTOACTIFS: 'Crypto-actifs', DEVELOPPEMENT: 'Développement web/app', AUTRE: 'Autre',
}

const NIVEAUX_LABELS: Record<string, string> = {
  STARTER: 'Starter', BUILDER: 'Builder', ACHIEVER: 'Achiever', CHAMPION: 'Champion', ELITE: 'Elite',
}

export default function ProfilPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const niveau = user?.niveau || 'BUILDER'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-[#004D2C] font-bold text-2xl">Mon Profil</h1>
        <p className="text-gray-500 text-sm mt-1">Licence d'Activité Numérique et informations personnelles</p>
      </div>

      {/* Carte LAN */}
      <div className="bg-gradient-to-br from-[#004D2C] to-[#006B3F] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Licence d'Activité Numérique</div>
            <div className="text-2xl font-bold font-mono tracking-widest">LAN-2024-A7B2C1</div>
            <div className="text-white/80 text-sm mt-1">{user?.name || 'Jean AHOUNOU'}</div>
          </div>
          <span className="bg-blue-500 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white">
            {NIVEAUX_LABELS[niveau]}
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
          <div>
            <div className="text-white/50 text-xs">Secteur</div>
            <div className="text-white font-medium">{SECTEURS_LABELS[user?.secteur] || 'Dropshipping'}</div>
          </div>
          <div>
            <div className="text-white/50 text-xs">Statut</div>
            <div className="text-green-300 font-bold">Actif</div>
          </div>
          <div>
            <div className="text-white/50 text-xs">Valide jusqu'au</div>
            <div className="text-white font-medium">31/12/2026</div>
          </div>
        </div>
        <div className="mt-4 flex rounded-lg overflow-hidden h-1">
          <div className="flex-1 bg-[#006B3F]" /><div className="flex-1 bg-[#FCD116]" /><div className="flex-1 bg-[#E8112D]" />
        </div>
      </div>

      {/* Informations */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-[#004D2C] font-semibold">Informations personnelles</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Prénom</label>
            <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">Jean</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
            <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">AHOUNOU</div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">{user?.email || 'demo@snaen.bj'}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Téléphone</label>
          <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">+229 61 23 45 67</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">IFU</label>
          <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono bg-gray-50 flex items-center justify-between">
            BJ20240001234
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vérifié</span>
          </div>
        </div>
      </div>

      {/* Score conformité */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[#004D2C] font-semibold mb-4">Score de conformité</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-bold text-[#006B3F]">78</div>
          <div className="flex-1">
            <div className="h-3 bg-gray-100 rounded-full mb-1">
              <div className="h-3 bg-[#006B3F] rounded-full" style={{ width: '78%' }} />
            </div>
            <div className="text-xs text-gray-400">Score sur 100</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Déclarations', value: '5/6', ok: true },
            { label: 'Paiements', value: '4/5', ok: true },
            { label: 'Justificatifs', value: '3/5', ok: false },
          ].map(item => (
            <div key={item.label} className={`rounded-xl p-3 ${item.ok ? 'bg-green-50' : 'bg-amber-50'}`}>
              <div className={`text-lg font-bold ${item.ok ? 'text-green-700' : 'text-amber-700'}`}>{item.value}</div>
              <div className={`text-xs ${item.ok ? 'text-green-600' : 'text-amber-600'}`}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
