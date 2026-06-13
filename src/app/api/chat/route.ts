import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const { message, module: modulo, history = [] } = await req.json()

  // Fetch knowledge base
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: nodos } = await supabase
    .from('kb_nodos')
    .select('pregunta, respuesta, palabras_clave, kb_temas(nombre)')
    .eq('activo', true)

  let kb = ''
  if (nodos && nodos.length > 0) {
    kb = nodos.map((n: { pregunta: string; respuesta: string; palabras_clave: string }) =>
      `P: ${n.pregunta}\nR: ${n.respuesta}`
    ).join('\n\n')
  }

  const systemPrompt = `Eres el asistente fiscal, legal y de marketing de IApoyo Consultora, un estudio contable argentino.
Módulo activo: ${modulo || 'General'}

Base de conocimiento del estudio:
${kb || '(Sin base de conocimiento configurada)'}

Responde siempre en español, de forma clara y concisa. Cuando corresponda, menciona que para casos específicos se recomienda consultar con el equipo de IApoyo Consultora (iapoyoconsultora@gmail.com).`

  const messages = [
    ...history,
    { role: 'user' as const, content: message }
  ]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  return NextResponse.json({ response: text })
}
