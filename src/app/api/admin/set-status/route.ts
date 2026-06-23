import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function isAdmin(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  return adminKey === (process.env.ADMIN_SECRET_KEY || 'iapoyo2025')
}

const VALID_STATUSES = ['trialing', 'active', 'past_due', 'canceled', 'expired']

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { target_user_id, status, admin_email } = await req.json()
  if (!target_user_id || !status || !admin_email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', target_user_id)

  await supabase.from('audit_log').insert({
    admin_email,
    action: 'set_status',
    target_user_id,
    details: { new_status: status },
  })

  return NextResponse.json({ ok: true })
}
