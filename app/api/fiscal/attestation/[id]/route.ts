import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import crypto from 'crypto'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 40, color: '#222' },
  headerBand: { flexDirection: 'row', height: 5, marginBottom: 20 },
  bandGreen: { flex: 1, backgroundColor: '#006B3F' },
  bandYellow: { flex: 1, backgroundColor: '#FCD116' },
  bandRed: { flex: 1, backgroundColor: '#E8112D' },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  logoBox: { backgroundColor: '#004D2C', padding: 10, borderRadius: 6, width: 80 },
  logoText: { color: '#FCD116', fontFamily: 'Helvetica-Bold', fontSize: 14 },
  logoSub: { color: '#ffffff', fontSize: 7, marginTop: 2 },
  ministereText: { textAlign: 'right', fontSize: 7, color: '#666' },
  titleSection: { backgroundColor: '#004D2C', padding: 14, borderRadius: 6, marginBottom: 16, textAlign: 'center' },
  titleMain: { color: '#FCD116', fontFamily: 'Helvetica-Bold', fontSize: 14, textAlign: 'center', marginBottom: 4 },
  titleSub: { color: '#ffffff', fontSize: 8, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#006B3F', marginVertical: 12 },
  infoBox: { backgroundColor: '#F5F9F7', borderRadius: 4, padding: 10, marginBottom: 10 },
  infoTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#004D2C', marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 130, color: '#666', fontSize: 8 },
  value: { flex: 1, color: '#222', fontSize: 8 },
  amountBox: { backgroundColor: '#E8F5EE', borderRadius: 6, padding: 14, marginBottom: 12, textAlign: 'center' },
  amountLabel: { fontSize: 8, color: '#666', marginBottom: 4, textAlign: 'center' },
  amountValue: { fontFamily: 'Helvetica-Bold', fontSize: 20, color: '#004D2C', textAlign: 'center', marginBottom: 4 },
  amountLettres: { fontSize: 8, color: '#006B3F', textAlign: 'center', fontStyle: 'italic' },
  codeBox: { backgroundColor: '#F5F5F5', borderRadius: 4, padding: 8, marginBottom: 12 },
  codeLabel: { fontSize: 7, color: '#666', marginBottom: 3, textTransform: 'uppercase' },
  codeValue: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: '#004D2C', letterSpacing: 1 },
  qrSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  qrImage: { width: 80, height: 80 },
  qrInfo: { flex: 1 },
  signatureBox: { borderTop: '1 dashed #999', paddingTop: 8, marginBottom: 12 },
  sigText: { fontSize: 7, color: '#666', textAlign: 'center' },
  footer: { marginTop: 'auto', borderTop: '1 solid #EEE', paddingTop: 8 },
  footerBand: { flexDirection: 'row', height: 2, marginBottom: 6 },
  footerText: { textAlign: 'center', fontSize: 7, color: '#999' },
  refBadge: { backgroundColor: '#004D2C', color: '#FCD116', fontFamily: 'Helvetica-Bold', fontSize: 7, padding: '3 8', borderRadius: 3, alignSelf: 'center', marginTop: 4 },
})

function formatFCFA(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
}

function nombreEnLettres(n: number): string {
  const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const dizaines = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']

  if (n === 0) return 'zéro'
  if (n < 0) return 'moins ' + nombreEnLettres(-n)

  let result = ''

  if (n >= 1000000) {
    result += nombreEnLettres(Math.floor(n / 1000000)) + ' million '
    n = n % 1000000
  }
  if (n >= 1000) {
    const mil = Math.floor(n / 1000)
    result += (mil === 1 ? 'mille' : nombreEnLettres(mil) + ' mille') + ' '
    n = n % 1000
  }
  if (n >= 100) {
    result += (Math.floor(n / 100) === 1 ? 'cent' : unites[Math.floor(n / 100)] + ' cent') + ' '
    n = n % 100
  }
  if (n >= 20) {
    const d = Math.floor(n / 10)
    const u = n % 10
    if (d === 7 || d === 9) {
      result += dizaines[d] + (u === 1 ? '-et-' : '-') + unites[10 + u]
    } else {
      result += dizaines[d] + (u > 0 ? (u === 1 && d !== 8 ? '-et-' : '-') + unites[u] : (d === 8 ? 's' : ''))
    }
  } else if (n > 0) {
    result += unites[n]
  }

  return result.trim() + ' francs CFA'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const user = session.user as any

  const { id } = await params

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter } as any)

  try {
    const declaration = await prisma.declarationFiscale.findFirst({
      where: { id, operateurId: user.id },
      include: { operateur: true },
    })

    if (!declaration) {
      return NextResponse.json({ error: 'Déclaration non trouvée' }, { status: 404 })
    }

    if (declaration.statut !== 'PAYEE') {
      return NextResponse.json({ error: 'Cette déclaration n\'est pas encore payée' }, { status: 400 })
    }

    const montant = Number(declaration.impotFinal)
    const datePaiement = declaration.datePaiement || declaration.createdAt

    // Hash de vérification SHA-256
    const hashInput = `${declaration.id}-${montant}-${datePaiement.toISOString()}-SNAEN2026`
    const codeVerification = crypto.createHash('sha256').update(hashInput).digest('hex').toUpperCase().slice(0, 32)

    // Numéro de référence
    const reference = `ATTEST-${declaration.periode.replace('-', '')}-${codeVerification.slice(0, 8)}`

    // QR code avec le code de vérification
    const qrDataUri = await QRCode.toDataURL(
      `SNAEN-VERIF:${codeVerification}:${reference}`,
      { width: 160, margin: 1 }
    )

    const op = declaration.operateur
    const montantLettres = nombreEnLettres(Math.round(montant))

    const doc = React.createElement(
      Document,
      { title: `Attestation Fiscale ${reference}`, author: 'SNAEN — DNEN' },
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },
        // Bande couleurs
        React.createElement(View, { style: styles.headerBand },
          React.createElement(View, { style: styles.bandGreen }),
          React.createElement(View, { style: styles.bandYellow }),
          React.createElement(View, { style: styles.bandRed }),
        ),
        // Logo + ministère
        React.createElement(View, { style: styles.logoRow },
          React.createElement(View, { style: styles.logoBox },
            React.createElement(Text, { style: styles.logoText }, 'SNAEN'),
            React.createElement(Text, { style: styles.logoSub }, 'DNEN — Bénin'),
          ),
          React.createElement(View, {},
            React.createElement(Text, { style: styles.ministereText }, 'République du Bénin'),
            React.createElement(Text, { style: styles.ministereText }, 'Ministère du Numérique'),
            React.createElement(Text, { style: styles.ministereText }, 'Direction Nationale de l\'Économie Numérique'),
            React.createElement(Text, { style: { ...styles.ministereText, color: '#006B3F' } }, 'Programme Vision 2045'),
          ),
        ),
        // Titre
        React.createElement(View, { style: styles.titleSection },
          React.createElement(Text, { style: styles.titleMain }, 'ATTESTATION DE PAIEMENT'),
          React.createElement(Text, { style: { ...styles.titleMain, fontSize: 11, marginBottom: 2 } }, "DE L'IMPÔT NUMÉRIQUE"),
          React.createElement(Text, { style: styles.titleSub }, 'Document officiel généré par le Système National d\'Administration de l\'Économie Numérique'),
        ),
        // Infos opérateur
        React.createElement(View, { style: styles.infoBox },
          React.createElement(Text, { style: styles.infoTitle }, 'Informations de l\'opérateur'),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Nom et prénom :'),
            React.createElement(Text, { style: { ...styles.value, fontFamily: 'Helvetica-Bold' } }, `${op.prenom} ${op.nom}`),
          ),
          op.lan ? React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Licence Annuelle (LAN) :'),
            React.createElement(Text, { style: styles.value }, op.lan),
          ) : null,
          op.ifu ? React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Identifiant Fiscal (IFU) :'),
            React.createElement(Text, { style: styles.value }, op.ifu),
          ) : null,
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Secteur d\'activité :'),
            React.createElement(Text, { style: styles.value }, op.secteur.toLowerCase().replace('_', ' ')),
          ),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Période déclarée :'),
            React.createElement(Text, { style: styles.value }, declaration.periode),
          ),
          React.createElement(View, { style: styles.row },
            React.createElement(Text, { style: styles.label }, 'Date de paiement :'),
            React.createElement(Text, { style: styles.value },
              `${datePaiement.toLocaleDateString('fr-FR')} à ${datePaiement.toLocaleTimeString('fr-FR')}`
            ),
          ),
        ),
        // Montant
        React.createElement(View, { style: styles.amountBox },
          React.createElement(Text, { style: styles.amountLabel }, 'MONTANT DE L\'IMPÔT NUMÉRIQUE ACQUITTÉ'),
          React.createElement(Text, { style: styles.amountValue }, formatFCFA(montant)),
          React.createElement(Text, { style: styles.amountLettres }, `(${montantLettres})`),
        ),
        React.createElement(View, { style: styles.divider }),
        // Code de vérification + QR
        React.createElement(View, { style: styles.qrSection },
          React.createElement(Image, { style: styles.qrImage, src: qrDataUri }),
          React.createElement(View, { style: styles.qrInfo },
            React.createElement(View, { style: styles.codeBox },
              React.createElement(Text, { style: styles.codeLabel }, 'Code de vérification unique'),
              React.createElement(Text, { style: styles.codeValue }, codeVerification.match(/.{1,8}/g)?.join(' ') || codeVerification),
            ),
            React.createElement(Text, { style: { fontSize: 7, color: '#666', marginBottom: 2 } },
              'Référence : ' + reference
            ),
            React.createElement(Text, { style: { fontSize: 7, color: '#999' } },
              'Scannez le QR code pour vérifier l\'authenticité de ce document sur snaen.bj'
            ),
          ),
        ),
        React.createElement(View, { style: styles.divider }),
        // Signature électronique
        React.createElement(View, { style: styles.signatureBox },
          React.createElement(Text, { style: styles.sigText },
            'Ce document est une attestation officielle générée par le SNAEN'
          ),
          React.createElement(Text, { style: { ...styles.sigText, marginTop: 3 } },
            'Fait par voie électronique, valeur légale — DNEN'
          ),
          React.createElement(Text, { style: { ...styles.sigText, marginTop: 2, color: '#006B3F', fontFamily: 'Helvetica-Bold' } },
            'Système National d\'Administration de l\'Économie Numérique du Bénin'
          ),
        ),
        // Footer
        React.createElement(View, { style: styles.footer },
          React.createElement(View, { style: styles.footerBand },
            React.createElement(View, { style: { flex: 1, backgroundColor: '#006B3F' } }),
            React.createElement(View, { style: { flex: 1, backgroundColor: '#FCD116' } }),
            React.createElement(View, { style: { flex: 1, backgroundColor: '#E8112D' } }),
          ),
          React.createElement(Text, { style: styles.footerText },
            `SNAEN © 2026 — DNEN — République du Bénin — N° Réf : ${reference}`
          ),
          React.createElement(Text, { style: { ...styles.footerText, marginTop: 2 } },
            'Programme Prioritaire Vision 2045 — Bénin Révélé — www.snaen.bj'
          ),
        ),
      ),
    )

    const buffer = await renderToBuffer(doc)
    const uint8Array = new Uint8Array(buffer)

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="attestation-fiscale-${reference}.pdf"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err: any) {
    console.error('[fiscal-attestation] error:', err)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
