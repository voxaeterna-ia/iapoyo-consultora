import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tupulso.com.ar'

  const body = {
    items: [{
      title: 'IApoyo - Plan Mensual',
      quantity: 1,
      unit_price: 5000,
      currency_id: 'ARS',
    }],
    back_urls: {
      success: `${appUrl}/dashboard?payment=success`,
      failure: `${appUrl}/dashboard?payment=failure`,
      pending: `${appUrl}/dashboard?payment=pending`,
    },
    auto_return: 'approved',
    notification_url: `${appUrl}/api/webhooks/mercadopago`,
    metadata: { user_id: user.id },
  }

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) return NextResponse.json({ error: 'MP error' }, { status: 500 })
  const data = await res.json()
  return NextResponse.json({ init_point: data.init_point })
}
