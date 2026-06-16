export async function mockVerifierIFU(
  ifu: string
): Promise<{ valide: boolean; nom?: string }> {
  await new Promise(r => setTimeout(r, 600))
  const valide = ifu.length >= 8
  return { valide, nom: valide ? 'Contribuable Vérifié' : undefined }
}
