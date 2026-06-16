import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import QRCode from 'qrcode'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 40, color: '#222' },
  headerBand: { flexDirection: 'row', height: 4, marginBottom: 16 },
  headerBandGreen: { flex: 1, backgroundColor: '#006B3F' },
  headerBandYellow: { flex: 1, backgroundColor: '#FCD116' },
  headerBandRed: { flex: 1, backgroundColor: '#E8112D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  logoBox: { backgroundColor: '#004D2C', padding: 10, borderRadius: 6, width: 80 },
  logoText: { color: '#FCD116', fontFamily: 'Helvetica-Bold', fontSize: 14 },
  logoSub: { color: '#ffffff', fontSize: 7, marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 18, color: '#004D2C', marginBottom: 4 },
  subtitle: { fontSize: 8, color: '#666' },
  divider: { height: 1, backgroundColor: '#006B3F', marginVertical: 12 },
  section: { marginBottom: 12 },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#004D2C', marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 120, color: '#666', fontSize: 8 },
  value: { flex: 1, color: '#222', fontSize: 8 },
  infoGrid: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  infoBox: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 4, padding: 8 },
  table: { marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#004D2C', padding: '6 8' },
  tableHeaderText: { color: '#FCD116', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  tableRow: { flexDirection: 'row', padding: '5 8', borderBottom: '1 solid #EEE' },
  tableRowAlt: { flexDirection: 'row', padding: '5 8', borderBottom: '1 solid #EEE', backgroundColor: '#F9F9F9' },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'center' },
  col3: { flex: 1, textAlign: 'right' },
  col4: { flex: 1, textAlign: 'right' },
  totalsBox: { alignItems: 'flex-end', marginBottom: 12 },
  totalRow: { flexDirection: 'row', marginBottom: 3 },
  totalLabel: { width: 120, fontSize: 8, color: '#666', textAlign: 'right', paddingRight: 8 },
  totalValue: { width: 80, fontSize: 8, color: '#222', textAlign: 'right' },
  totalFinalLabel: { width: 120, fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#004D2C', textAlign: 'right', paddingRight: 8 },
  totalFinalValue: { width: 80, fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#E8112D', textAlign: 'right' },
  qrSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  qrImage: { width: 70, height: 70 },
  qrInfo: { flex: 1 },
  qrLabel: { fontSize: 7, color: '#666', marginBottom: 2 },
  qrValue: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#004D2C', marginBottom: 1 },
  footer: { marginTop: 'auto', borderTop: '1 solid #EEE', paddingTop: 8 },
  footerBand: { flexDirection: 'row', height: 2, marginBottom: 6 },
  footerText: { textAlign: 'center', fontSize: 7, color: '#999' },
  badge: { backgroundColor: '#E8F5EE', color: '#006B3F', fontSize: 7, padding: '2 6', borderRadius: 10, alignSelf: 'flex-start' },
})

function formatFCFA(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' FCFA'
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
    const facture = await prisma.facture.findFirst({
      where: { id, operateurId: user.id },
      include: { operateur: true },
    })

    if (!facture) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    const montantHT = Number(facture.montantHT)
    const tva = Number(facture.tva)
    const montantTTC = Number(facture.montantTTC)
    const lignes = facture.lignes as Array<{ description: string; quantite: number; prixUnitaire: number; total?: number }>

    // Générer QR code
    const qrData = `${process.env.NEXTAUTH_URL}/verifier/${facture.numero}`
    const qrDataUri = await QRCode.toDataURL(qrData, { width: 140, margin: 1 })

    const doc = React.createElement(
      Document,
      { title: `Facture ${facture.numero}`, author: 'SNAEN — DNEN' },
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },
        // Bande couleurs
        React.createElement(View, { style: styles.headerBand },
          React.createElement(View, { style: styles.headerBandGreen }),
          React.createElement(View, { style: styles.headerBandYellow }),
          React.createElement(View, { style: styles.headerBandRed }),
        ),
        // Header
        React.createElement(View, { style: styles.header },
          React.createElement(View, { style: styles.logoBox },
            React.createElement(Text, { style: styles.logoText }, 'SNAEN'),
            React.createElement(Text, { style: styles.logoSub }, 'DNEN — Bénin'),
          ),
          React.createElement(View, { style: styles.headerRight },
            React.createElement(Text, { style: styles.title }, 'FACTURE NORMALISÉE'),
            React.createElement(Text, { style: styles.subtitle }, `N° ${facture.numero}`),
            React.createElement(Text, { style: { ...styles.subtitle, marginTop: 2 } },
              `Date : ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`
            ),
            facture.dgiReference
              ? React.createElement(Text, { style: { ...styles.subtitle, color: '#006B3F', marginTop: 2 } },
                  `Réf. DGI : ${facture.dgiReference}`
                )
              : null,
          ),
        ),
        React.createElement(View, { style: styles.divider }),
        // Infos opérateur et client
        React.createElement(View, { style: styles.infoGrid },
          React.createElement(View, { style: styles.infoBox },
            React.createElement(Text, { style: styles.sectionTitle }, 'Émetteur'),
            React.createElement(Text, { style: { ...styles.value, fontFamily: 'Helvetica-Bold' } },
              `${facture.operateur.prenom} ${facture.operateur.nom}`
            ),
            facture.operateur.lan
              ? React.createElement(Text, { style: styles.label }, `LAN : ${facture.operateur.lan}`)
              : null,
            facture.operateur.ifu
              ? React.createElement(Text, { style: styles.label }, `IFU : ${facture.operateur.ifu}`)
              : null,
            React.createElement(Text, { style: styles.label }, facture.operateur.email),
          ),
          React.createElement(View, { style: styles.infoBox },
            React.createElement(Text, { style: styles.sectionTitle }, 'Client'),
            React.createElement(Text, { style: { ...styles.value, fontFamily: 'Helvetica-Bold' } }, facture.clientNom),
            facture.clientEmail
              ? React.createElement(Text, { style: styles.label }, facture.clientEmail)
              : null,
            facture.clientTelephone
              ? React.createElement(Text, { style: styles.label }, facture.clientTelephone)
              : null,
            facture.clientIfu
              ? React.createElement(Text, { style: styles.label }, `IFU : ${facture.clientIfu}`)
              : null,
          ),
        ),
        // Tableau lignes
        React.createElement(View, { style: styles.table },
          React.createElement(View, { style: styles.tableHeader },
            React.createElement(Text, { style: { ...styles.tableHeaderText, ...styles.col1 } }, 'Description'),
            React.createElement(Text, { style: { ...styles.tableHeaderText, ...styles.col2 } }, 'Qté'),
            React.createElement(Text, { style: { ...styles.tableHeaderText, ...styles.col3 } }, 'Prix unitaire'),
            React.createElement(Text, { style: { ...styles.tableHeaderText, ...styles.col4 } }, 'Total'),
          ),
          ...lignes.map((ligne, i) => {
            const total = (ligne.total !== undefined ? ligne.total : (ligne.quantite || 1) * (ligne.prixUnitaire || 0))
            return React.createElement(View, { key: i, style: i % 2 === 0 ? styles.tableRow : styles.tableRowAlt },
              React.createElement(Text, { style: { ...styles.col1, fontSize: 8 } }, ligne.description),
              React.createElement(Text, { style: { ...styles.col2, fontSize: 8 } }, String(ligne.quantite || 1)),
              React.createElement(Text, { style: { ...styles.col3, fontSize: 8 } }, formatFCFA(ligne.prixUnitaire || 0)),
              React.createElement(Text, { style: { ...styles.col4, fontSize: 8 } }, formatFCFA(total)),
            )
          }),
        ),
        // Totaux
        React.createElement(View, { style: styles.totalsBox },
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, 'Montant HT'),
            React.createElement(Text, { style: styles.totalValue }, formatFCFA(montantHT)),
          ),
          React.createElement(View, { style: styles.totalRow },
            React.createElement(Text, { style: styles.totalLabel }, 'TVA (0%)'),
            React.createElement(Text, { style: styles.totalValue }, formatFCFA(tva)),
          ),
          React.createElement(View, { style: { ...styles.totalRow, borderTop: '1 solid #004D2C', paddingTop: 4 } },
            React.createElement(Text, { style: styles.totalFinalLabel }, 'MONTANT TTC'),
            React.createElement(Text, { style: styles.totalFinalValue }, formatFCFA(montantTTC)),
          ),
        ),
        React.createElement(View, { style: styles.divider }),
        // QR Code
        React.createElement(View, { style: styles.qrSection },
          React.createElement(Image, { style: styles.qrImage, src: qrDataUri }),
          React.createElement(View, { style: styles.qrInfo },
            React.createElement(Text, { style: styles.qrLabel }, 'Code de vérification QR'),
            React.createElement(Text, { style: styles.qrValue }, `Facture ${facture.numero}`),
            React.createElement(Text, { style: styles.qrLabel }, 'Scannez pour vérifier sur snaen-dnen.bj'),
            facture.statut === 'PAYEE'
              ? React.createElement(View, { style: styles.badge }, React.createElement(Text, {}, 'PAYÉE'))
              : null,
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
            'Document généré par SNAEN — DNEN — République du Bénin'
          ),
          React.createElement(Text, { style: { ...styles.footerText, marginTop: 2 } },
            'Programme Prioritaire Vision 2045 — Bénin Révélé'
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
        'Content-Disposition': `inline; filename="facture-${facture.numero}.pdf"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (err: any) {
    console.error('[factures-pdf] error:', err)
    return NextResponse.json({ error: 'Erreur génération PDF' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
