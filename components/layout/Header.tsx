'use client'

import { signOut } from 'next-auth/react'

const NIVEAUX_LABELS: Record<string, string> = {
  STARTER: 'Starter', BUILDER: 'Builder', ACHIEVER: 'Achiever',
  CHAMPION: 'Champion', ELITE: 'Elite',
}

interface HeaderProps {
  userName?: string
  niveau?: string
  title?: string
}

export default function Header({ userName, niveau = 'STARTER', title }: HeaderProps) {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
      {/* Left: titre page */}
      <div>
        {title && <h1 className="text-[#004D2C] font-semibold text-base">{title}</h1>}
        <div className="text-xs text-gray-400">
          SNAEN · Système National d'Administration de l'Économie Numérique
        </div>
      </div>

      {/* Right: user + notif + logout */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 text-gray-400 hover:text-[#006B3F] rounded-lg hover:bg-[#E8F5EE] transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E8112D] rounded-full" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 bg-[#004D2C] rounded-full flex items-center justify-center text-white text-sm font-bold">
            {userName?.slice(0, 1)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-800 leading-tight">{userName || 'Utilisateur'}</div>
            <div className="text-xs text-[#006B3F] font-medium">{NIVEAUX_LABELS[niveau] || niveau}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="ml-2 p-2 text-gray-400 hover:text-[#E8112D] rounded-lg hover:bg-red-50 transition-colors"
          title="Se déconnecter"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
