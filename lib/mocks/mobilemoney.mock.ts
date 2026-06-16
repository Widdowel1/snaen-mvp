export async function mockInitierPaiement(params: {
  montant: number
  telephone: string
  reference: string
}): Promise<{ transactionId: string; statut: 'EN_COURS' }> {
  await new Promise(r => setTimeout(r, 1200))
  return { transactionId: `TXN-${Date.now()}`, statut: 'EN_COURS' }
}

export async function mockVerifierPaiement(
  transactionId: string
): Promise<{ statut: 'SUCCESSFUL' | 'FAILED' | 'PENDING' }> {
  await new Promise(r => setTimeout(r, 500))
  return { statut: Math.random() > 0.1 ? 'SUCCESSFUL' : 'FAILED' }
}
