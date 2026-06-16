import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const operateur = await prisma.operateur.findUnique({
          where: { email: credentials.email },
        })
        if (!operateur) return null

        const valid = await bcrypt.compare(credentials.password, operateur.motDePasse)
        if (!valid) return null

        return {
          id: operateur.id,
          email: operateur.email,
          name: `${operateur.prenom} ${operateur.nom}`,
          role: operateur.role,
          niveau: operateur.niveau,
          secteur: operateur.secteur,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.niveau = (user as any).niveau
        token.secteur = (user as any).secteur
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).niveau = token.niveau
        ;(session.user as any).secteur = token.secteur
      }
      return session
    },
  },
}
