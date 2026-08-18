import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token no proporcionado' },
        { status: 400 }
      )
    }

    // Verificar con Cloudflare
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    })

    const data = await response.json()
    console.log('🔍 Cloudflare response:', data) // ← Para depuración

    return NextResponse.json({ success: data.success })
  } catch (error) {
    console.error('❌ Error en verificación:', error)
    return NextResponse.json(
      { success: false, error: 'Error en la verificación' },
      { status: 500 }
    )
  }
}