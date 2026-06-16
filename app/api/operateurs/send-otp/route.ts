import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 })
    }

    // Générer OTP 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // En production: envoyer par email/SMS
    // Pour le MVP, on retourne l'OTP en clair et on le stocke en cookie

    const response = NextResponse.json({
      success: true,
      otp, // retourné en clair pour le mode démo
      message: `Code OTP envoyé à ${email} (mode démonstration)`,
    })

    // Stocker le OTP dans un cookie httpOnly (5 min)
    response.cookies.set('snaen_otp', otp, {
      httpOnly: true,
      maxAge: 300, // 5 minutes
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    response.cookies.set('snaen_otp_email', email, {
      httpOnly: true,
      maxAge: 300,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return response
  } catch (err: any) {
    console.error('[send-otp] error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
