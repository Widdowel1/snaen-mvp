'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function OperateurLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F5EE]">
        <div className="text-[#006B3F] text-sm font-medium">Chargement...</div>
      </div>
    )
  }

  if (!session) {
    redirect('/login')
    return null
  }

  const user = session.user as any
  const userName = user?.name || user?.email || 'Utilisateur'
  const niveau = user?.niveau || 'STARTER'

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        userName={userName}
        niveau={niveau}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Header
        userName={userName}
        niveau={niveau}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <main className="lg:ml-64 pt-14 min-h-screen">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
