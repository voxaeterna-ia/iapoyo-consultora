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

  const { referrer_id } = await req.json()
  if (!referrer_id || referrer_id === user.id) return NextResponse.json({ ok: true })

  // Registrar referido
  const { error: insertError } = await supabase.from('referrals').insert({
    referrer_id,
    referred_id: user.id,
  })
  if (insertError) return NextResponse.json({ ok: true })

  // Contar referidos del referente
  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', referrer_id)

  const count = referrals?.length || 0

  // Cada 3 referidos otorgar 30 días gratis
  if (count % 3 === 0) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('trial_end')
      .eq('user_id', referrer_id)
      .single()

    if (sub) {
      const base = new Date(sub.trial_end)
      const newEnd = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)
      await supabase
        .from('subscriptions')
        .update({ trial_end: newEnd.toISOString(), status: 'trialing', updated_at: new Date().toISOString() })
        .eq('user_id', referrer_id)
    }
  }

  return NextResponse.json({ ok: true })
}
