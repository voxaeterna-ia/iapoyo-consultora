import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { modulo, consulta } = await req.json()

  if (!consulta?.trim()) {
    return NextResponse.json({ error: 'Consulta vacía' }, { status: 400 })
  }

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let userEmail = ''
  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token)
    userEmail = user?.email ?? ''
  }

  await supabase.from('consultas_simples').insert({
    modulo,
    consulta,
    user_email: userEmail,
  }).maybeSingle()

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'IApoyo App <noreply@tupulso.com.ar>',
        to: 'iapoyoconsultora@gmail.com',
        subject: `Nueva consulta desde IApoyo — ${modulo}`,
        html: `
          <h2 style="color:#2D4A6B">Nueva consulta desde la app IApoyo</h2>
          <p><b>Módulo:</b> ${modulo}</p>
          ${userEmail ? `<p><b>Usuario:</b> ${userEmail}</p>` : ''}
          <hr/>
          <p style="font-size:16px">${consulta.replace(/\n/g, '<br/>')}</p>
        `,
      })
    } catch {
      // Email failed but continue
    }
  }

  return NextResponse.json({ ok: true })
}
