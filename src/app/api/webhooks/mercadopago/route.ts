import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const paymentId = body?.data?.id
  if (!paymentId) return NextResponse.json({ ok: true })

  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  })

  if (!mpRes.ok) return NextResponse.json({ ok: true })
  const payment = await mpRes.json()

  const userId = payment?.metadata?.user_id
  if (!userId) return NextResponse.json({ ok: true })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (payment.status === 'approved') {
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        mp_payment_id: String(paymentId),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId)

    // Obtener email del usuario
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    const email = user?.email

    if (email) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'IApoyo <noreply@tupulso.com.ar>',
          to: email,
          subject: '¡Tu suscripción a IApoyo está activa!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2D4A6B;">¡Gracias por suscribirte a IApoyo!</h2>
              <p>Tu pago fue procesado correctamente y tu plan mensual ya está activo.</p>
              <div style="background: #f0f4f8; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Plan:</strong> Mensual - $5.000 ARS</p>
                <p style="margin: 8px 0 0;"><strong>Válido hasta:</strong> ${periodEnd.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <p>Podés acceder a tu cuenta en <a href="https://iapoyo-consultora.vercel.app" style="color: #2D4A6B;">IApoyo Consultora</a>.</p>
              <p style="color: #666; font-size: 12px;">Si tenés alguna consulta, respondé este email.</p>
            </div>
          `,
        }),
      })
    }

  } else if (payment.status === 'cancelled') {
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  }

  return NextResponse.json({ ok: true })
}
