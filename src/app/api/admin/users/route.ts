import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function isAdmin(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  return adminKey === (process.env.ADMIN_SECRET_KEY || 'iapoyo2025')
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (!subs) return NextResponse.json([])

  const { data: { users } } = await supabase.auth.admin.listUsers()

  const emailMap: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  users?.forEach((u: any) => { emailMap[u.id] = u.email })

  const result = subs.map(s => ({ ...s, email: emailMap[s.user_id] || '—' }))

  return NextResponse.json(result)
}
