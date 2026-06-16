import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ContextGuide from '@/components/ui/ContextGuide'
import FormationCard from './FormationModal'

const NIVEAUX_ORDER = ['STARTER', 'BUILDER', 'ACHIEVER', 'CHAMPION', 'ELITE']

function niveauIndex(n: string) {
  return NIVEAUX_ORDER.indexOf(n)
}

export default async function AcademiePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = session.user as any
  const operateur = await prisma.operateur.findUnique({
    where: { id: user.id },
    include: { progressions: true },
  })

  const formations = await prisma.formation.findMany({
    where: { actif: true },
    orderBy: [{ niveauMin: 'asc' }, { titre: 'asc' }],
  })

  const userNiveauIdx = niveauIndex(operateur?.niveau || 'STARTER')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#004D2C] font-bold text-2xl">Académie SNAEN</h1>
        <p className="text-gray-500 text-sm mt-0.5">Formations certifiantes pour booster votre activité numérique</p>
      </div>

      <ContextGuide message="Complétez les formations pour augmenter votre niveau et bénéficier de réductions fiscales." />

      {/* Badge niveau */}
      <div className="bg-gradient-to-r from-[#004D2C] to-[#006B3F] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/70 text-sm">Votre niveau actuel</div>
            <div className="text-2xl font-bold mt-0.5">{operateur?.niveau || 'STARTER'}</div>
            <div className="text-white/60 text-xs mt-1">
              {formations.filter(f => niveauIndex(f.niveauMin) <= userNiveauIdx).length} formation{formations.filter(f => niveauIndex(f.niveauMin) <= userNiveauIdx).length > 1 ? 's' : ''} disponible{formations.filter(f => niveauIndex(f.niveauMin) <= userNiveauIdx).length > 1 ? 's' : ''}
            </div>
          </div>
          <div className="text-5xl font-bold text-white/20">{userNiveauIdx + 1}/5</div>
        </div>
      </div>

      {/* Catalogue formations */}
      {formations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          Aucune formation disponible pour le moment
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formations.map(formation => {
            const reqNiveauIdx = niveauIndex(formation.niveauMin)
            const locked = reqNiveauIdx > userNiveauIdx
            const progression = operateur?.progressions.find(p => p.formationId === formation.id)
            const pct = progression?.progressionPct || 0
            const termine = progression?.termine || false

            return (
              <FormationCard
                key={formation.id}
                formation={{
                  id: formation.id,
                  titre: formation.titre,
                  description: formation.description,
                  format: formation.format,
                  dureeMin: formation.dureeMin,
                  niveauMin: formation.niveauMin,
                  gratuit: formation.gratuit,
                }}
                locked={locked}
                pct={pct}
                termine={termine}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
