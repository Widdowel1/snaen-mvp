export async function mockSyncFactureDGI(facture: {
  numero: string
  montant: number
  operateurIfu: string
}): Promise<{ reference: string; statut: 'OK' | 'ERREUR' }> {
  await new Promise(r => setTimeout(r, 800))
  return {
    reference: `DGI-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    statut: 'OK',
  }
}
