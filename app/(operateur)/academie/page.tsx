import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

const NIVEAUX_ORDER = ['STARTER', 'BUILDER', 'ACHIEVER', 'CHAMPION', 'ELITE']

function niveauIndex(n: string) {
  return NIVEAUX_ORDER.indexOf(n)
}

const FORMAT_ICONS: Record<string, string> = {
  video: '🎬', pdf: '📄', live: '🔴', quiz: '📝', default: '📚',
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
            const formatIcon = FORMAT_ICONS[formation.format?.toLowerCase()] || FORMAT_ICONS.default

            return (
              <div key={formation.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  locked ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-[#006B3F]/30 hover:shadow-md'
                }`}>
                {/* Header */}
                <div className={`p-4 ${locked ? 'bg-gray-50' : 'bg-[#E8F5EE]'}`}>
                  <div className="flex items-start justify-between">
                    <div className="text-2xl">{formatIcon}</div>
                    <div className="flex gap-1.5">
                      {termine && (
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">✓ Terminé</span>
                      )}
                      {locked && (
                        <span className="bg-gray-200 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">🔒 {formation.niveauMin}</span>
                      )}
                      {formation.gratuit && !locked && (
                        <span className="bg-[#006B3F] text-white text-xs font-medium px-2 py-0.5 rounded-full">Gratuit</span>
                      )}
                    </div>
                  </div>
                  <h3 className={`font-bold mt-2 text-sm leading-snug ${locked ? 'text-gray-400' : 'text-[#004D2C]'}`}>
                    {formation.titre}
                  </h3>
                </div>

                <div className="p-4">
                  {formation.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">{formation.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span>⏱ {formation.dureeMin} min</span>
                    <span className="capitalize">{formation.format}</span>
                  </div>

                  {!locked && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progression</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 bg-[#006B3F] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  {locked ? (
                    <div className="mt-3 text-center text-xs text-gray-400">
                      Disponible à partir du niveau {formation.niveauMin}
                    </div>
                  ) : (
                    <button className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                      termine
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-[#006B3F] hover:bg-[#004D2C] text-white'
                    }`}>
                      {termine ? 'Revoir la formation' : pct > 0 ? 'Continuer' : 'Commencer'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
