'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SECTEURS = [
  'DROPSHIPPING','ECOMMERCE','FREELANCE','INFLUENCE','CONTENU',
  'FORMATION','COACHING','TRADING','CRYPTOACTIFS','DEVELOPPEMENT','AUTRE',
]

const LABELS_SECTEUR: Record<string, string> = {
  DROPSHIPPING: 'Dropshipping', ECOMMERCE: 'E-commerce', FREELANCE: 'Freelance',
  INFLUENCE: 'Influence / Réseaux sociaux', CONTENU: 'Création de contenu',
  FORMATION: 'Formation en ligne', COACHING: 'Coaching', TRADING: 'Trading',
  CRYPTOACTIFS: 'Cryptoactifs', DEVELOPPEMENT: 'Développement logiciel', AUTRE: 'Autre',
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function generateLAN() {
  const year = new Date().getFullYear()
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `LAN-${year}-${uuid}`
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('+229')
  const [secteur, setSecteur] = useState('')
  const [motDePasse, setMotDePasse] = useState('')

  // Step 2 OTP
  const [generatedOTP] = useState(generateOTP)
  const [otpInput, setOtpInput] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)

  // Step 3 CNI
  const [cniFile, setCniFile] = useState<File | null>(null)
  const [cniUrl, setCniUrl] = useState('')

  // Step 4 IFU
  const [ifu, setIfu] = useState('')
  const [ifuVerified, setIfuVerified] = useState<boolean | null>(null)
  const [ifuLoading, setIfuLoading] = useState(false)

  // Step 5 Paiement
  const [lan, setLan] = useState('')
  const [paymentDone, setPaymentDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function nextStep() {
    setError('')
    setStep(s => s + 1)
  }

  // Step 1 -> 2
  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (!nom || !prenom || !email || !telephone || !secteur || !motDePasse) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    nextStep()
  }

  // Step 2 OTP
  function handleOTPVerify() {
    if (otpInput === generatedOTP) {
      setOtpVerified(true)
      setError('')
    } else {
      setError('Code OTP incorrect. Vérifiez le code affiché.')
    }
  }

  // Step 3 CNI upload (simulé)
  async function handleCNIUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCniFile(file)
    // Simulé : stocker le nom du fichier
    setCniUrl(`/uploads/${file.name}`)
  }

  // Step 4 IFU verify
  async function handleIFUVerify() {
    if (!ifu) return
    setIfuLoading(true)
    try {
      const res = await fetch('/api/operateurs/verify-ifu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ifu }),
      })
      const data = await res.json()
      setIfuVerified(data.valid)
    } catch {
      setIfuVerified(false)
    } finally {
      setIfuLoading(false)
    }
  }

  // Step 5 paiement simulé
  function handleSimulerPaiement() {
    const newLan = generateLAN()
    setLan(newLan)
    setPaymentDone(true)
  }

  // Soumission finale
  async function handleFinalSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/operateurs/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, telephone, secteur, motDePasse, ifu: ifu || undefined, lan, cniUrl }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.message || 'Erreur lors de l\'inscription.')
      }
    } catch {
      setError('Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8F5EE] px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#006B3F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[#004D2C] font-bold text-xl mb-2">Inscription réussie !</h2>
          <p className="text-gray-600 text-sm mb-2">Votre numéro LAN :</p>
          <div className="bg-[#E8F5EE] rounded-lg px-4 py-3 font-mono font-bold text-[#006B3F] text-lg mb-4">{lan}</div>
          <p className="text-gray-500 text-sm mb-6">Conservez ce numéro précieusement. Il identifie votre activité numérique.</p>
          <Link href="/login" className="block w-full bg-[#006B3F] text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-[#004D2C] transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#E8F5EE] px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-lg mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
            <rect width="56" height="56" rx="12" fill="#004D2C"/>
            <text x="8" y="28" fontFamily="Inter, Arial" fontWeight="700" fontSize="13" fill="#FCD116">SNAEN</text>
            <text x="12" y="42" fontFamily="Inter, Arial" fontWeight="400" fontSize="9" fill="#ffffff">Bénin</text>
          </svg>
          <div className="text-left">
            <div className="text-[#004D2C] font-bold text-lg">Inscription Opérateur</div>
            <div className="text-[#006B3F] text-xs">DNEN — République du Bénin</div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex gap-1.5">
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-[#006B3F]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>Infos</span><span>OTP</span><span>CNI</span><span>IFU</span><span>Paiement</span>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            <h2 className="text-[#004D2C] font-bold text-lg mb-4">Étape 1 — Informations personnelles</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input value={nom} onChange={e => setNom(e.target.value)} required placeholder="AGOSSOU"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input value={prenom} onChange={e => setPrenom(e.target.value)} required placeholder="Kofi"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="kofi@email.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
              <input value={telephone} onChange={e => setTelephone(e.target.value)} required placeholder="+22961000000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité *</label>
              <select value={secteur} onChange={e => setSecteur(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]">
                <option value="">Choisir un secteur</option>
                {SECTEURS.map(s => <option key={s} value={s}>{LABELS_SECTEUR[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <input type="password" value={motDePasse} onChange={e => setMotDePasse(e.target.value)} required placeholder="Min. 8 caractères"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
            </div>
            <button type="submit" className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
              Continuer →
            </button>
          </form>
        )}

        {/* Step 2 OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-[#004D2C] font-bold text-lg mb-4">Étape 2 — Vérification OTP</h2>
            <div className="bg-[#E8F5EE] border border-[#006B3F]/20 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Code OTP simulé envoyé au {telephone} :</p>
              <div className="text-3xl font-mono font-bold text-[#006B3F] tracking-widest">{generatedOTP}</div>
              <p className="text-xs text-gray-400 mt-1">(En production, ce code serait envoyé par SMS)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entrez le code OTP *</label>
              <input value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="123456" maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F] text-center text-xl tracking-widest font-mono" />
            </div>
            {!otpVerified ? (
              <button onClick={handleOTPVerify} className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
                Valider le code
              </button>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-[#006B3F] text-sm font-medium mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Code validé avec succès !
                </div>
                <button onClick={nextStep} className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
                  Continuer →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 CNI */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-[#004D2C] font-bold text-lg mb-4">Étape 3 — Pièce d'identité (CNI)</h2>
            <p className="text-sm text-gray-600">Téléversez une copie de votre Carte Nationale d'Identité (recto).</p>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <input type="file" accept="image/*,.pdf" onChange={handleCNIUpload} className="hidden" id="cni-upload" />
              <label htmlFor="cni-upload" className="cursor-pointer">
                {cniFile ? (
                  <div className="text-[#006B3F]">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-medium">{cniFile.name}</p>
                    <p className="text-xs text-gray-400">Cliquer pour changer</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm">Cliquer pour téléverser</p>
                    <p className="text-xs">PNG, JPG ou PDF (max 5 Mo)</p>
                  </div>
                )}
              </label>
            </div>
            <button onClick={() => { if (cniFile) nextStep(); else setError('Veuillez téléverser votre CNI.') }}
              className="w-full bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
              Continuer →
            </button>
            <button onClick={nextStep} className="w-full text-gray-400 text-sm underline hover:text-gray-600">
              Passer cette étape (optionnel en MVP)
            </button>
          </div>
        )}

        {/* Step 4 IFU */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-[#004D2C] font-bold text-lg mb-4">Étape 4 — Identifiant Fiscal Unique (IFU)</h2>
            <p className="text-sm text-gray-600">Entrez votre IFU si vous en avez un. Cette étape est optionnelle.</p>
            <div className="flex gap-2">
              <input value={ifu} onChange={e => setIfu(e.target.value)} placeholder="Ex: 0012345678901"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B3F]" />
              <button onClick={handleIFUVerify} disabled={!ifu || ifuLoading}
                className="bg-[#006B3F] hover:bg-[#004D2C] disabled:opacity-50 text-white font-semibold rounded-lg px-4 text-sm transition-colors">
                {ifuLoading ? '...' : 'Vérifier'}
              </button>
            </div>
            {ifuVerified === true && (
              <div className="flex items-center gap-2 text-[#006B3F] text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                IFU vérifié et valide
              </div>
            )}
            {ifuVerified === false && (
              <div className="text-red-600 text-sm">IFU non reconnu dans la base DGI.</div>
            )}
            <div className="flex gap-3 mt-2">
              <button onClick={nextStep} className="flex-1 bg-[#006B3F] hover:bg-[#004D2C] text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
                {ifu && ifuVerified ? 'Continuer →' : 'Passer et continuer →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5 Paiement */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-[#004D2C] font-bold text-lg mb-4">Étape 5 — Frais d'inscription</h2>
            <div className="bg-[#E8F5EE] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Licence Annuelle Numérique (LAN)</span>
                <span className="font-bold text-[#004D2C]">25 000 FCFA</span>
              </div>
              <div className="text-xs text-gray-500">Valable 12 mois · Renouvelable</div>
            </div>

            {!paymentDone ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-medium">Choisir le mode de paiement :</p>
                {['MTN MoMo (+229)', 'Moov Money (+229)', 'Celtiis Cash (+229)'].map(mode => (
                  <button key={mode} onClick={handleSimulerPaiement}
                    className="w-full border-2 border-gray-200 hover:border-[#006B3F] hover:bg-[#E8F5EE] rounded-xl p-4 text-left flex items-center gap-3 transition-colors">
                    <div className="w-8 h-8 bg-[#FCD116] rounded-full flex items-center justify-center text-xs font-bold text-[#004D2C]">
                      {mode.slice(0,1)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{mode}</div>
                      <div className="text-xs text-gray-400">Paiement simulé (MVP)</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 font-semibold text-sm">Paiement de 25 000 FCFA simulé</p>
                </div>
                <div className="bg-[#E8F5EE] rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Votre numéro LAN :</p>
                  <div className="font-mono font-bold text-[#006B3F] text-lg">{lan}</div>
                </div>
                <button onClick={handleFinalSubmit} disabled={submitting}
                  className="w-full bg-[#006B3F] hover:bg-[#004D2C] disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
                  {submitting ? 'Finalisation...' : 'Finaliser l\'inscription'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          Déjà inscrit ?{' '}
          <Link href="/login" className="text-[#006B3F] hover:underline font-medium">Se connecter</Link>
        </div>
      </div>
    </div>
  )
}
