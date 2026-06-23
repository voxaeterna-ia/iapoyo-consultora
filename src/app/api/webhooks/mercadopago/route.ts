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
  } else if (payment.status === 'cancelled') {
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  }

  return NextResponse.json({ ok: true })
}
