'use client'

import { signOut } from 'next-auth/react'

const NIVEAUX_LABELS: Record<string, string> = {
  STARTER: 'Starter', BUILDER: 'Builder', ACHIEVER: 'Achiever',
  CHAMPION: 'Champion', ELITE: 'Elite',
}

interface HeaderProps {
  userName?: string
  niveau?: string
  onMenuClick?: () => void
}

export default function Header({ userName, niveau = 'STARTER', onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-20">
      {/* Left: hamburger mobile + titre */}
      <div className="flex items-center gap-3">
        {/* Hamburger mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-[#006B3F] rounded-lg hover:bg-[#E8F5EE] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Logo SNAEN visible sur mobile uniquement */}
        <div className="lg:hidden flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="10" fill="#004D2C"/>
            <text x="8" y="28" fontFamily="Inter, Arial" fontWeight="700" fontSize="13" fill="#FCD116">SNAEN</text>
          </svg>
          <span className="text-[#004D2C] font-bold text-sm">SNAEN</span>
        </div>
        {/* Titre desktop */}
        <div className="hidden lg:block text-xs text-gray-400">
          SNAEN · Système National d'Administration de l'Économie Numérique
        </div>
      </div>

      {/* Right: user */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#004D2C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {userName?.slice(0, 1)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-800 leading-tight max-w-[120px] truncate">{userName}</div>
            <div className="text-xs text-[#006B3F] font-medium">{NIVEAUX_LABELS[niveau] || niveau}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="hidden sm:block ml-1 p-2 text-gray-400 hover:text-[#E8112D] rounded-lg hover:bg-red-50 transition-colors"
          title="Se déconnecter"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
