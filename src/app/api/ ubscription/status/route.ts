import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const token = authHeader.replace('Bearer ', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase
    .from('subscriptions')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'trialing')
    .lt('trial_end', new Date().toISOString())

  let { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!sub) {
    const trialEnd = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    const { data: newSub } = await supabase
      .from('subscriptions')
      .insert({ user_id: user.id, status: 'trialing', trial_end: trialEnd.toISOString() })
      .select()
      .single()
    sub = newSub
  }

  return NextResponse.json(sub)
}
