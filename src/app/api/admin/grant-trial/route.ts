import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function isAdmin(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  return adminKey === (process.env.ADMIN_SECRET_KEY || 'iapoyo2025')
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { target_user_id, extra_days, admin_email } = await req.json()
  if (!target_user_id || !extra_days || !admin_email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('trial_end, status')
    .eq('user_id', target_user_id)
    .single()

  if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })

  const baseDate = sub.trial_end ? new Date(sub.trial_end) : new Date()
  const newEnd = new Date(baseDate.getTime() + extra_days * 24 * 60 * 60 * 1000)

  await supabase
    .from('subscriptions')
    .update({
      trial_end: newEnd.toISOString(),
      status: 'trialing',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', target_user_id)

  await supabase.from('audit_log').insert({
    admin_email,
    action: 'grant_trial_days',
    target_user_id,
    details: { extra_days, new_trial_end: newEnd.toISOString() },
  })

  return NextResponse.json({ ok: true, new_trial_end: newEnd.toISOString() })
}
