import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { tipo, nombre, email, telefono, datos } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.from('consultas').insert({
    tipo, nombre, email, telefono, datos_json: datos
  })

  // Send email via Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'IApoyo Consultora <onboarding@resend.dev>',
        to: 'iapoyoconsultora@gmail.com',
        subject: `Nueva consulta: ${tipo} — ${nombre}`,
        html: `<h2>Nueva consulta desde IApoyo</h2>
<p><b>Tipo:</b> ${tipo}</p>
<p><b>Nombre:</b> ${nombre}</p>
<p><b>Email:</b> ${email}</p>
<p><b>Teléfono:</b> ${telefono}</p>
<pre>${JSON.stringify(datos, null, 2)}</pre>`,
      })
    } catch {
      // Email failed but we already saved to DB
    }
  }

  return NextResponse.json({ ok: true })
}
