import { NextRequest, NextResponse } from 'next/server'

// Mock DGI IFU database
const VALID_IFUS = ['0012345678901', '0098765432109', '0011223344550', '1234567890123']

export async function POST(req: NextRequest) {
  try {
    const { ifu } = await req.json()
    const valid = VALID_IFUS.includes(ifu) || (typeof ifu === 'string' && ifu.length === 13)
    return NextResponse.json({ valid, message: valid ? 'IFU valide' : 'IFU non reconnu' })
  } catch {
    return NextResponse.json({ valid: false, message: 'Erreur de vérification' }, { status: 400 })
  }
}
