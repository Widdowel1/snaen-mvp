'use client'

import { useState } from 'react'

interface FAQ {
  question: string
  reponse: string
}

interface Module {
  id: string
  titre: string
  icon: React.ReactNode
  faqs: FAQ[]
}

const modules: Module[] = [
  {
    id: 'dashboard',
    titre: 'Module Tableau de bord',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    faqs: [
      {
        question: 'Comment est calculé mon chiffre d\'affaires ?',
        reponse: 'Votre chiffre d\'affaires correspond à la somme de toutes vos factures émises et payées pour le mois en cours. Seules les factures au statut "Payée" sont comptabilisées.',
      },
      {
        question: 'Que signifie "Bénéfice réel" vs "Forfait sectoriel" ?',
        reponse: 'Si vos dépenses justifiées dépassent 20 % de votre chiffre d\'affaires, le régime réel s\'applique (impôt calculé sur CA – dépenses). Dans le cas contraire, un forfait sectoriel basé sur votre secteur d\'activité est utilisé.',
      },
      {
        question: 'Pourquoi mon niveau ne progresse-t-il pas ?',
        reponse: 'Le niveau est calculé sur votre chiffre d\'affaires annuel et votre ancienneté de conformité fiscale. Déclarez à temps chaque mois et augmentez votre CA pour progresser.',
      },
      {
        question: 'Que faire si je vois une alerte rouge ?',
        reponse: 'Les alertes rouges indiquent des déclarations fiscales en retard. Rendez-vous dans le module Fiscal pour régulariser votre situation et éviter des pénalités supplémentaires.',
      },
    ],
  },
  {
    id: 'factures',
    titre: 'Module Factures',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    faqs: [
      {
        question: 'Comment créer une facture normalisée ?',
        reponse: 'Cliquez sur "Nouvelle facture", remplissez les informations du client (nom, IFU si disponible) et ajoutez vos lignes de produits ou services avec les montants correspondants. La facture est automatiquement normalisée.',
      },
      {
        question: 'Qu\'est-ce que la synchronisation DGI ?',
        reponse: 'La facture est transmise au système de la Direction Générale des Impôts pour validation officielle. Une fois synchronisée, la facture reçoit un numéro officiel et est légalement opposable.',
      },
      {
        question: 'Puis-je annuler une facture ?',
        reponse: 'Oui, vous pouvez annuler une facture tant qu\'elle n\'a pas été marquée comme payée. Une facture annulée ne peut pas être réactivée ; il faut en créer une nouvelle.',
      },
      {
        question: 'Comment télécharger ma facture en PDF ?',
        reponse: 'Cliquez sur le bouton "PDF" dans la liste des factures ou dans le détail d\'une facture. Le PDF généré est normalisé et prêt à être envoyé à votre client.',
      },
      {
        question: 'La facture est-elle légalement valide ?',
        reponse: 'Oui, toutes les factures SNAEN sont normalisées conformément aux exigences de la DGI et synchronisées avec le système fiscal béninois. Elles sont légalement valides.',
      },
    ],
  },
  {
    id: 'depenses',
    titre: 'Module Dépenses',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    faqs: [
      {
        question: 'Quels justificatifs sont acceptés ?',
        reponse: 'Les justificatifs acceptés sont : factures normalisées avec IFU, reçus Mobile Money (MTN, Moov, Celtiis), factures étrangères et reçus email. Tout document prouvant la dépense est recevable.',
      },
      {
        question: 'Pourquoi ma dépense est "En attente" ?',
        reponse: 'Les dépenses sans justificatif IFU ou de montant élevé sont soumises à une validation manuelle par le DNEN. Joindre un justificatif accélère le processus de validation.',
      },
      {
        question: 'Comment uploader un justificatif ?',
        reponse: 'Lors de l\'ajout d\'une dépense, cliquez sur "Joindre un justificatif" et sélectionnez une photo (JPG, PNG) ou un fichier PDF depuis votre appareil. La taille maximale est de 5 Mo.',
      },
      {
        question: 'Les dépenses réduisent-elles mon impôt ?',
        reponse: 'Oui. Si vos dépenses dépassent 20 % de votre chiffre d\'affaires, vous passez automatiquement en régime réel : votre bénéfice imposable devient CA – dépenses, ce qui réduit votre impôt.',
      },
    ],
  },
  {
    id: 'fiscal',
    titre: 'Module Fiscal',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    faqs: [
      {
        question: 'Quand dois-je déclarer ?',
        reponse: 'La déclaration est mensuelle. Vous devez payer votre impôt avant le 15 du mois suivant la période concernée. Par exemple, l\'impôt de janvier est dû avant le 15 février.',
      },
      {
        question: 'Comment payer mon impôt ?',
        reponse: 'Cliquez sur "Payer maintenant" dans le module Fiscal et choisissez votre opérateur Mobile Money : MTN Mobile Money, Moov Money ou Celtiis. Le paiement est confirmé instantanément.',
      },
      {
        question: 'Que faire si je suis en retard ?',
        reponse: 'Contactez le DNEN pour un plan de régularisation. Des pénalités de retard peuvent s\'appliquer. Plus tôt vous régularisez, moins les pénalités seront importantes.',
      },
      {
        question: 'Comment obtenir une attestation de paiement ?',
        reponse: 'Après chaque paiement validé, un bouton "Télécharger l\'attestation" apparaît automatiquement dans le module Fiscal. L\'attestation est disponible immédiatement.',
      },
      {
        question: 'Mon attestation est-elle infalsifiable ?',
        reponse: 'Oui, chaque attestation contient un code de vérification SHA-256 unique et un QR code officiel. La validité peut être vérifiée en ligne sur le portail de la DGI ou en scannant le QR code.',
      },
    ],
  },
  {
    id: 'academie',
    titre: 'Module Académie',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    faqs: [
      {
        question: 'Les formations sont-elles gratuites ?',
        reponse: 'Les formations de niveau Starter et Builder sont entièrement gratuites. Les niveaux supérieurs (Achiever, Champion, Elite) donnent accès à des formations premium à tarif préférentiel.',
      },
      {
        question: 'Comment débloquer les formations avancées ?',
        reponse: 'Atteignez le niveau requis en maintenant votre conformité fiscale (déclarations à temps) et en augmentant votre chiffre d\'affaires annuel. Chaque niveau débloque de nouvelles formations.',
      },
      {
        question: 'Est-ce que je reçois un certificat ?',
        reponse: 'Oui, à la complétion de chaque formation vous recevez un certificat PDF téléchargeable. Ce certificat est signé par le DNEN et atteste de votre montée en compétences numériques.',
      },
    ],
  },
  {
    id: 'compte',
    titre: 'Mon Compte & LAN',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    faqs: [
      {
        question: 'Qu\'est-ce que la LAN ?',
        reponse: 'La Licence d\'Activité Numérique (LAN) est votre autorisation officielle d\'exercer dans l\'économie numérique béninoise, délivrée par le DNEN. Elle vous confère un statut légal reconnu.',
      },
      {
        question: 'Comment renouveler ma LAN ?',
        reponse: 'La LAN est renouvelable annuellement. Vous recevrez une notification 30 jours avant la date d\'expiration. Le renouvellement se fait directement depuis votre espace Profil.',
      },
      {
        question: 'Que faire si j\'oublie mon mot de passe ?',
        reponse: 'Contactez le support DNEN à l\'adresse support@dnen.bj en indiquant votre IFU et votre email d\'inscription. Un lien de réinitialisation vous sera envoyé sous 24 h.',
      },
      {
        question: 'Comment améliorer mon score de conformité ?',
        reponse: 'Déclarez et payez votre impôt à temps chaque mois, joignez des justificatifs à vos dépenses et complétez les formations de l\'Académie. Chaque action positive améliore votre score.',
      },
    ],
  },
]

function AccordionItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 py-4 text-left focus:outline-none group"
      >
        <span className="text-sm font-medium text-gray-800 group-hover:text-[#006B3F] transition-colors leading-snug">
          {faq.question}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          {faq.reponse}
        </div>
      )}
    </div>
  )
}

function ModuleAccordion({ module }: { module: Module }) {
  const [moduleOpen, setModuleOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => { setModuleOpen(v => !v); setOpenFaq(null) }}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#006B3F]">{module.icon}</span>
          <span className="font-semibold text-[#004D2C]">{module.titre}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {module.faqs.length} question{module.faqs.length > 1 ? 's' : ''}
          </span>
        </div>
        <svg
          className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${moduleOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {moduleOpen && (
        <div className="px-6 pb-2 border-t border-gray-50">
          {module.faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              faq={faq}
              isOpen={openFaq === idx}
              onToggle={() => setOpenFaq(openFaq === idx ? null : idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AidePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* En-tête */}
      <div>
        <h1 className="text-[#004D2C] font-bold text-2xl">Aide & Guide d&apos;utilisation</h1>
        <p className="text-gray-500 text-sm mt-1">Trouvez des réponses à toutes vos questions</p>
      </div>

      {/* Recherche rapide visuelle */}
      <div className="bg-gradient-to-br from-[#006B3F] to-[#004D2C] rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-lg">Besoin d&apos;aide personnalisée ?</div>
            <p className="text-white/80 text-sm mt-1">
              Si vous ne trouvez pas de réponse ci-dessous, contactez le support DNEN à{' '}
              <a href="mailto:support@dnen.bj" className="underline text-[#FCD116] hover:text-white transition-colors">
                support@dnen.bj
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Accordéons modules */}
      <div className="space-y-3">
        {modules.map(module => (
          <ModuleAccordion key={module.id} module={module} />
        ))}
      </div>

      {/* Bas de page */}
      <div className="text-center text-xs text-gray-400 pb-4">
        SNAEN · Système Numérique d&apos;Administration de l&apos;Économie Numérique · DNEN Bénin
      </div>
    </div>
  )
}
