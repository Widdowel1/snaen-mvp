'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Email ou mot de passe incorrect.')
      } else {
        // fetch session to know role
        const res = await fetch('/api/auth/session')
        const session = await res.json()
        const role = session?.user?.role
        if (role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#E8F5EE] px-4">
      {/* Header institutionnel */}
      <div className="w-full max-w-md mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Logo SVG SNAEN */}
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="56" height="56" rx="12" fill="#004D2C"/>
            <text x="8" y="28" fontFamily="Inter, Arial" fontWeight="700" fontSize="13" fill="#FCD116">SNAEN</text>
            <text x="12" y="42" fontFamily="Inter, Arial" fontWeight="400" fontSize="9" fill="#ffffff">Bénin</text>
            <rect x="8" y="46" width="12" height="4" rx="1" fill="#006B3F"/>
            <rect x="20" y="46" width="12" height="4" rx="1" fill="#FCD116"/>
            <rect x="32" y="46" width="12" height="4" rx="1" fill="#E8112D"/>
          </svg>
          <div className="text-left">
            <div className="text-[#004D2C] font-bold text-xl leading-tight">SNAEN</div>
            <div className="text-[#006B3F] text-xs font-medium">République du Bénin</div>
          </div>
        </div>
        <h1 className="text-[#004D2C] font-bold text-base leading-snug">
          Système National d'Administration<br/>de l'Économie Numérique
        </h1>
        <p className="text-[#006B3F] text-sm mt-1">
          Dispositif National de l'Économie Numérique (DNEN)
        </p>
      </div>

      {/* Formulaire */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-[#004D2C] font-bold text-xl mb-1">Connexion</h2>
        <p className="text-gray-500 text-sm mb-6">Accédez à votre espace opérateur</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#006B3F] hover:bg-[#004D2C] disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Pas encore inscrit ?{' '}
          <Link href="/register" className="text-[#006B3F] font-medium hover:underline">
            Créer un compte opérateur
          </Link>
        </div>

        {/* Bande drapeau Bénin */}
        <div className="mt-6 flex rounded-lg overflow-hidden h-1.5">
          <div className="flex-1 bg-[#006B3F]" />
          <div className="flex-1 bg-[#FCD116]" />
          <div className="flex-1 bg-[#E8112D]" />
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        MVP — Démonstration · DNEN © 2026
      </p>
    </div>
  )
}
