import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#004D2C] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FCD116] rounded-lg flex items-center justify-center">
              <span className="text-[#004D2C] font-black text-sm">SN</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">SNAEN</div>
              <div className="text-[#FCD116] text-xs">République du Bénin</div>
            </div>
          </div>
          <Link
            href="/login"
            className="bg-[#FCD116] hover:bg-yellow-400 text-[#004D2C] font-bold rounded-lg px-5 py-2 text-sm transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Bande drapeau décorative */}
      <div className="flex h-2">
        <div className="flex-1 bg-[#006B3F]" />
        <div className="flex-1 bg-[#FCD116]" />
        <div className="flex-1 bg-[#E8112D]" />
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#004D2C] to-[#006B3F] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6 text-[#FCD116]">
            <span className="w-2 h-2 bg-[#FCD116] rounded-full inline-block" />
            Plateforme Officielle — DNEN 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
            Plateforme officielle de<br />
            <span className="text-[#FCD116]">l&apos;Économie Numérique</span><br />
            du Bénin
          </h1>
          <p className="text-white/80 text-lg mb-3">
            Direction Nationale de l&apos;Économie Numérique (DNEN)
          </p>
          <p className="text-white/60 text-sm mb-10 max-w-2xl mx-auto">
            Gérez votre Licence d&apos;Activité Numérique (LAN), vos déclarations fiscales,
            vos factures normalisées et votre conformité réglementaire depuis une seule plateforme.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#FCD116] hover:bg-yellow-400 text-[#004D2C] font-bold rounded-xl px-8 py-4 text-base transition-colors shadow-lg"
          >
            Accéder à la plateforme
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <div className="mt-4 text-white/40 text-xs">
            Programme Prioritaire Vision 2045 — Bénin Révélé
          </div>
        </div>
      </section>

      {/* Bande drapeau décorative */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-[#006B3F]" />
        <div className="flex-1 bg-[#FCD116]" />
        <div className="flex-1 bg-[#E8112D]" />
      </div>

      {/* Stats */}
      <section className="py-16 px-6 bg-[#E8F5EE]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-[#004D2C] font-bold text-2xl mb-10">
            L&apos;économie numérique béninoise en chiffres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '847', label: 'Opérateurs enregistrés', color: 'text-[#006B3F]', icon: '👥' },
              { value: '127 450 000', label: 'FCFA de recettes fiscales', color: 'text-[#004D2C]', icon: '💰' },
              { value: '11', label: 'Secteurs numériques', color: 'text-[#006B3F]', icon: '📊' },
              { value: '98%', label: 'Taux de conformité', color: 'text-[#004D2C]', icon: '✅' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#006B3F]/10 shadow-sm p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-black ${stat.color} leading-none mb-1`}>{stat.value}</div>
                <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 blocs fonctionnels */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-[#004D2C] font-bold text-2xl mb-3">
            Une plateforme pour tous les acteurs
          </h2>
          <p className="text-center text-gray-500 text-sm mb-12">
            SNAEN centralise la gestion de l&apos;économie numérique du Bénin
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧑‍💼',
                title: 'Pour les opérateurs numériques',
                color: 'border-[#006B3F]',
                bg: 'bg-[#E8F5EE]',
                items: [
                  'Gestion de votre LAN (Licence Annuelle Numérique)',
                  'Émission de factures normalisées DGI',
                  'Déclarations fiscales simplifiées',
                  'Suivi de vos dépenses déductibles',
                  'Formations et montée en niveau',
                ],
              },
              {
                icon: '👮',
                title: 'Pour les agents DNEN',
                color: 'border-[#FCD116]',
                bg: 'bg-yellow-50',
                items: [
                  'Tableau de bord de surveillance',
                  'Gestion des dossiers CVFD',
                  'Suivi des non-conformités',
                  'Accès aux déclarations fiscales',
                  'Rapports sectoriels automatisés',
                ],
              },
              {
                icon: '🏛️',
                title: 'Pour le gouvernement',
                color: 'border-[#E8112D]',
                bg: 'bg-red-50',
                items: [
                  "Vue consolidée de l'économie numérique",
                  'Statistiques fiscales en temps réel',
                  'Conformité au Programme Vision 2045',
                  'Intégration DGI automatique',
                  'Indicateurs de développement digital',
                ],
              },
            ].map((bloc, i) => (
              <div key={i} className={`${bloc.bg} rounded-2xl border-t-4 ${bloc.color} p-6 shadow-sm`}>
                <div className="text-4xl mb-3">{bloc.icon}</div>
                <h3 className="text-[#004D2C] font-bold text-base mb-4">{bloc.title}</h3>
                <ul className="space-y-2">
                  {bloc.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-[#006B3F] font-bold mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#004D2C] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-white font-black text-3xl mb-4">
            Rejoignez l&apos;économie numérique officielle du Bénin
          </h2>
          <p className="text-white/70 text-sm mb-8">
            Inscrivez-vous en 5 minutes. Obtenez votre LAN et commencez à opérer en conformité avec la loi béninoise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#FCD116] hover:bg-yellow-400 text-[#004D2C] font-bold rounded-xl px-8 py-3.5 text-sm transition-colors"
            >
              S&apos;inscrire gratuitement
            </Link>
            <Link
              href="/login"
              className="border-2 border-white/30 hover:border-white text-white font-bold rounded-xl px-8 py-3.5 text-sm transition-colors"
            >
              Accéder à la plateforme
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003820] py-6 px-6 text-center">
        <div className="flex h-0.5 max-w-xs mx-auto mb-4">
          <div className="flex-1 bg-[#006B3F]" />
          <div className="flex-1 bg-[#FCD116]" />
          <div className="flex-1 bg-[#E8112D]" />
        </div>
        <p className="text-white/50 text-xs">
          SNAEN © 2026 — DNEN — République du Bénin — Programme Prioritaire Vision 2045
        </p>
        <p className="text-white/30 text-xs mt-1">
          Système National d&apos;Administration de l&apos;Économie Numérique
        </p>
      </footer>
    </div>
  )
}
