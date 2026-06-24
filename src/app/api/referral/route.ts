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

  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', user.id)

  const count = referrals?.length || 0
  const bonusMonths = Math.floor(count / 3)

  return NextResponse.json({
    referral_link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://iapoyo-consultora.vercel.app'}/login?ref=${user.id}`,
    count,
    bonus_months: bonusMonths,
    next_bonus_at: 3 - (count % 3),
  })
}
