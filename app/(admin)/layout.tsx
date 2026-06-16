import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/admin/operateurs', label: 'Opérateurs', icon: '👥' },
  { href: '/admin/recouvrement', label: 'Recouvrement', icon: '💰' },
  { href: '/admin/cvfd', label: 'CVFD', icon: '🔍' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  const user = session.user as any
  if (user?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar admin */}
      <aside className="fixed left-0 top-0 h-full w-60 flex flex-col z-30" style={{ background: '#1a1a2e' }}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
              <rect width="56" height="56" rx="10" fill="#004D2C"/>
              <text x="8" y="28" fontFamily="Inter, Arial" fontWeight="700" fontSize="13" fill="#FCD116">SNAEN</text>
              <text x="10" y="42" fontFamily="Inter, Arial" fontWeight="400" fontSize="9" fill="#ffffff">Bénin</text>
            </svg>
            <div>
              <div className="text-white font-bold text-sm">DNEN</div>
              <div className="text-white/50 text-xs">Admin</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNavItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm font-medium transition-colors">
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-white/60 text-xs truncate">{user?.name || user?.email}</div>
          <div className="text-[#FCD116] text-xs font-medium">Administrateur DNEN</div>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-60 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
        <div className="text-xs text-gray-400">SNAEN · Centre National d'Administration de l'Économie Numérique</div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
      </header>

      <main className="ml-60 pt-14 flex-1 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
