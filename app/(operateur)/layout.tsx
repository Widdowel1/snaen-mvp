import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default async function OperateurLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const user = session.user as any
  const userName = user?.name || user?.email || 'Utilisateur'
  const niveau = user?.niveau || 'STARTER'

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userName={userName} niveau={niveau} />
      <Header userName={userName} niveau={niveau} />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
