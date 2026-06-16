import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #f0faf4 0%, #e8f5ee 100%)' }}>
      {/* Logo SNAEN */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <svg width="64" height="64" viewBox="0 0 56 56" fill="none">
          <rect width="56" height="56" rx="12" fill="#006B3F"/>
          <text x="5" y="28" fontFamily="Inter, Arial" fontWeight="700" fontSize="13" fill="#FCD116">SNAEN</text>
          <text x="7" y="42" fontFamily="Inter, Arial" fontWeight="400" fontSize="9" fill="#ffffff">Bénin</text>
        </svg>
        <div className="text-center">
          <div className="text-[#004D2C] font-bold text-lg leading-tight">SNAEN</div>
          <div className="text-gray-400 text-xs">DNEN · Bénin</div>
        </div>
      </div>

      {/* Drapeau Bénin décoratif */}
      <div className="flex gap-1 mb-8 opacity-30">
        <div className="w-3 h-16 rounded-sm" style={{ background: '#006B3F' }} />
        <div className="w-3 h-16 rounded-sm" style={{ background: '#FCD116' }} />
        <div className="w-3 h-16 rounded-sm" style={{ background: '#E8112D' }} />
      </div>

      {/* Contenu 404 */}
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-[#006B3F] opacity-20 leading-none mb-2">404</div>
        <h1 className="text-2xl font-bold text-[#004D2C] mb-3">Page introuvable</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Retournez au tableau de bord pour continuer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: '#006B3F' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour au tableau de bord
          </Link>
          <Link
            href="/aide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-[#006B3F] bg-white border border-[#006B3F]/20 hover:border-[#006B3F]/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Centre d&apos;aide
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-xs text-gray-400 text-center">
        SNAEN · Système Numérique d&apos;Administration de l&apos;Économie Numérique
      </div>
    </div>
  )
}
