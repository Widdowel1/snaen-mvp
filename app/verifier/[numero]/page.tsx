import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'

function formatFCFA(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const STATUT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  EMISE:   { label: 'ÉMISE',   bg: 'bg-blue-100',   text: 'text-blue-800' },
  PAYEE:   { label: 'PAYÉE',   bg: 'bg-green-100',  text: 'text-green-800' },
  ANNULEE: { label: 'ANNULÉE', bg: 'bg-red-100',    text: 'text-red-800' },
}

export default async function VerifierPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero } = await params

  const facture = await prisma.facture.findFirst({
    where: { numero },
    include: { operateur: true },
  })

  const statutInfo = facture ? (STATUT_LABELS[facture.statut] ?? { label: facture.statut, bg: 'bg-gray-100', text: 'text-gray-800' }) : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Bande drapeau */}
      <div className="flex h-2">
        <div className="flex-1 bg-[#006B3F]" />
        <div className="flex-1 bg-[#FCD116]" />
        <div className="flex-1 bg-[#E8112D]" />
      </div>

      {/* Header */}
      <header className="bg-[#004D2C] py-4 px-6 shadow-md">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <div className="bg-[#FCD116] rounded-lg px-3 py-1.5 leading-none">
            <span className="text-[#004D2C] font-black text-lg">SNAEN</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Vérification de document</p>
            <p className="text-white/60 text-xs">DNEN — République du Bénin</p>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          {facture ? (
            /* Document trouvé */
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Bande statut */}
              <div className="bg-[#004D2C] px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-300 font-bold text-lg">✓ Document authentique</p>
                  <p className="text-white/70 text-sm">Ce document est reconnu et enregistré dans le système SNAEN</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Numéro + statut */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Numéro de facture</p>
                    <p className="font-mono font-bold text-[#004D2C] text-xl">{facture.numero}</p>
                  </div>
                  {statutInfo && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statutInfo.bg} ${statutInfo.text}`}>
                      {statutInfo.label}
                    </span>
                  )}
                </div>

                <div className="h-px bg-gray-100" />

                {/* Montant */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Montant TTC</p>
                  <p className="text-2xl font-bold text-[#E8112D]">{formatFCFA(Number(facture.montantTTC))}</p>
                </div>

                {/* Date */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Date d'émission</p>
                  <p className="text-gray-800 font-medium">{formatDate(facture.dateEmission)}</p>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Émetteur */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Émetteur</p>
                  <div className="bg-[#F0F7F3] rounded-xl p-4 space-y-1">
                    <p className="font-semibold text-[#004D2C]">
                      {facture.operateur.prenom} {facture.operateur.nom}
                    </p>
                    {facture.operateur.lan && (
                      <p className="text-sm text-gray-600 font-mono">LAN : {facture.operateur.lan}</p>
                    )}
                    {facture.operateur.ifu && (
                      <p className="text-sm text-gray-600 font-mono">IFU : {facture.operateur.ifu}</p>
                    )}
                    <p className="text-sm text-gray-500">{facture.operateur.email}</p>
                  </div>
                </div>

                {/* Client */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Client</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-800">{facture.clientNom}</p>
                    {facture.clientEmail && (
                      <p className="text-sm text-gray-500">{facture.clientEmail}</p>
                    )}
                    {facture.clientIfu && (
                      <p className="text-sm text-gray-500 font-mono">IFU : {facture.clientIfu}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Document non trouvé */
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-[#E8112D] px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-300 flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">✗ Document non reconnu</p>
                  <p className="text-red-100 text-sm">Aucun document portant ce numéro n'a été trouvé</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-amber-800 mb-1">⚠ Avertissement</p>
                  <p className="text-sm text-amber-700">
                    Ce document n'est pas enregistré dans le Système National de Archivage de l'Économie Numérique (SNAEN).
                    Il pourrait s'agir d'un document falsifié ou d'un numéro incorrect.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Numéro recherché : <span className="font-mono font-semibold text-gray-700">{numero}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Si vous pensez qu'il s'agit d'une erreur, contactez l'émetteur du document ou signalez-le à la DNEN.
                </p>
              </div>
            </div>
          )}

          {/* Lien plateforme */}
          <div className="text-center mt-6">
            <Link
              href="/login"
              className="inline-block bg-[#004D2C] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#006B3F] transition-colors"
            >
              Accéder à la plateforme SNAEN
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center">
        <p className="text-xs text-gray-400">SNAEN — DNEN — République du Bénin</p>
        <p className="text-xs text-gray-300 mt-0.5">Programme Prioritaire Vision 2045 — Bénin Révélé</p>
      </footer>

      {/* Bande drapeau bas */}
      <div className="flex h-2">
        <div className="flex-1 bg-[#006B3F]" />
        <div className="flex-1 bg-[#FCD116]" />
        <div className="flex-1 bg-[#E8112D]" />
      </div>
    </div>
  )
}
