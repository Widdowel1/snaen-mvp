'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NIVEAUX_LABELS: Record<string, string> = {
  STARTER: 'Starter', BUILDER: 'Builder', ACHIEVER: 'Achiever',
  CHAMPION: 'Champion', ELITE: 'Elite',
}

const NIVEAUX_COLORS: Record<string, string> = {
  STARTER: 'bg-gray-400', BUILDER: 'bg-blue-500', ACHIEVER: 'bg-purple-500',
  CHAMPION: 'bg-[#FCD116] text-[#004D2C]', ELITE: 'bg-[#E8112D]',
}

interface SidebarProps {
  userName?: string
  niveau?: string
}

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { href: '/factures', label: 'Factures', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )},
  { href: '/depenses', label: 'Dépenses', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )},
  { href: '/fiscal', label: 'Fiscal', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )},
  { href: '/academie', label: 'Académie', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  )},
  { href: '/profil', label: 'Profil', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
]

export default function Sidebar({ userName, niveau = 'STARTER' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-30" style={{ background: '#004D2C' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="10" fill="#006B3F"/>
            <text x="8" y="28" fontFamily="Inter, Arial" fontWeight="700" fontSize="13" fill="#FCD116">SNAEN</text>
            <text x="10" y="42" fontFamily="Inter, Arial" fontWeight="400" fontSize="9" fill="#ffffff">Bénin</text>
          </svg>
          <div>
            <div className="text-white font-bold text-base leading-tight">SNAEN</div>
            <div className="text-white/60 text-xs">DNEN · Bénin</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'text-[#FCD116] border-l-2 border-[#FCD116] pl-2.5'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
              style={active ? { background: 'rgba(6,107,63,0.6)' } : {}}
            >
              <span className={active ? 'text-[#FCD116]' : 'text-white/60'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Badge niveau */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${NIVEAUX_COLORS[niveau] || 'bg-gray-400'} ${niveau === 'CHAMPION' ? '' : 'text-white'}`}>
              {NIVEAUX_LABELS[niveau] || niveau}
            </span>
          </div>
          {userName && (
            <div className="text-white/80 text-xs truncate">{userName}</div>
          )}
          <div className="mt-2">
            <div className="h-1 bg-white/20 rounded-full">
              <div className="h-1 bg-[#FCD116] rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="text-white/40 text-xs mt-1">45% vers le niveau suivant</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
