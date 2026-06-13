'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { ChatMessage, formatARS } from '@/types'
import { Send, Bot, User, Calculator } from 'lucide-react'

const MODULOS = [
  { id: 'fiscal', label: 'Consultas Fiscales', emoji: '📊' },
  { id: 'marcas', label: 'Marcas Comerciales', emoji: '™️' },
  { id: 'indemnizacion', label: 'Indemnización Laboral', emoji: '⚖️' },
  { id: 'alquileres', label: 'Alquileres & Costos', emoji: '🏠' },
  { id: 'vehiculos', label: 'Vehículos & Fotomultas', emoji: '🚗' },
  { id: 'marketing', label: 'Marketing & Tecnología', emoji: '📱' },
]

export default function IApoyoPage() {
  const [modulo, setModulo] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'chat' | 'calculadoras'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Calculadora indemnización
  const [salario, setSalario] = useState(0)
  const [antiguedad, setAntiguedad] = useState(0)

  // Calculadora costo laboral
  const [bruto, setBruto] = useState(0)

  // Actualización alquiler
  const [montoBase, setMontoBase] = useState(0)
  const [variacion, setVariacion] = useState(0)
  const [indiceAlq, setIndiceAlq] = useState('ICL')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          module: modulo,
          history: messages.slice(-10),
        }),
      })
      const { response } = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con el asistente. Intentá de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  // Cálculos
  const indemnizacion = salario * Math.max(1, Math.floor(antiguedad / 12))
  const costoLaboral = bruto * 1.27 // aprox empleador ANSES
  const alqActualizado = montoBase * (1 + variacion / 100)

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
          <h1 className="text-2xl font-bold text-[#2D4A6B] mb-4">IApoyo — Asistente IA</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {(['chat', 'calculadoras'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-[#2D4A6B] text-white' : 'bg-white border text-gray-600'}`}
              >
                {t === 'chat' ? '💬 Chat' : '🧮 Calculadoras'}
              </button>
            ))}
          </div>

          {tab === 'chat' && (
            <>
              {/* Módulos */}
              {!modulo && (
                <div>
                  <p className="text-sm text-gray-500 mb-3">Seleccioná un módulo para comenzar:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {MODULOS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setModulo(m.id)}
                        className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#4CAF50] hover:shadow-sm transition-all"
                      >
                        <span className="text-2xl block mb-1">{m.emoji}</span>
                        <span className="text-sm font-medium text-gray-700">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {modulo && (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-[#2D4A6B]">
                      {MODULOS.find(m => m.id === modulo)?.emoji} {MODULOS.find(m => m.id === modulo)?.label}
                    </span>
                    <button onClick={() => { setModulo(null); setMessages([]) }} className="text-xs text-gray-400 hover:text-gray-600 ml-auto">
                      Cambiar módulo
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-y-auto p-4 mb-3 min-h-[300px] max-h-[400px]">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Bot size={32} className="mb-2 text-[#2D4A6B] opacity-30" />
                        <p className="text-sm">Hacé tu consulta sobre {MODULOS.find(m => m.id === modulo)?.label}</p>
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-2 mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-full bg-[#2D4A6B] flex items-center justify-center flex-shrink-0">
                            <Bot size={14} className="text-white" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-[#2D4A6B] text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-2 justify-start">
                        <div className="w-7 h-7 rounded-full bg-[#2D4A6B] flex items-center justify-center">
                          <Bot size={14} className="text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-400">
                          Consultando...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Escribí tu consulta..."
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="bg-[#2D4A6B] text-white px-4 py-2.5 rounded-xl hover:bg-[#1e3350] disabled:opacity-40"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'calculadoras' && (
            <div className="space-y-6">
              {/* Indemnización */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-[#2D4A6B] mb-4 flex items-center gap-2">
                  <Calculator size={16} /> Indemnización LCT
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Mejor salario mensual ($)</label>
                    <input type="number" value={salario || ''} onChange={e => setSalario(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Antigüedad (meses)</label>
                    <input type="number" value={antiguedad || ''} onChange={e => setAntiguedad(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Indemnización estimada (Art. 245 LCT)</p>
                  <p className="text-2xl font-bold text-[#2D4A6B]">{formatARS(indemnizacion)}</p>
                  <p className="text-xs text-gray-400 mt-1">{Math.max(1, Math.floor(antiguedad / 12))} año(s) × {formatARS(salario)}</p>
                </div>
              </div>

              {/* Costo laboral */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-[#2D4A6B] mb-4 flex items-center gap-2">
                  <Calculator size={16} /> Costo Laboral Empleador
                </h3>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 block mb-1">Salario bruto ($)</label>
                  <input type="number" value={bruto || ''} onChange={e => setBruto(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Salario bruto</span><span>{formatARS(bruto)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Aportes empleador (~27%)</span><span>{formatARS(bruto * 0.27)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm border-t border-orange-200 pt-2 mt-2">
                    <span>Costo total</span><span className="text-[#FF7043]">{formatARS(costoLaboral)}</span>
                  </div>
                </div>
              </div>

              {/* Actualización alquiler */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-semibold text-[#2D4A6B] mb-4 flex items-center gap-2">
                  <Calculator size={16} /> Actualización de Alquiler
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Monto base ($)</label>
                    <input type="number" value={montoBase || ''} onChange={e => setMontoBase(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Índice</label>
                    <select value={indiceAlq} onChange={e => setIndiceAlq(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option>ICL</option><option>IPC</option><option>RIPTE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Variación {indiceAlq} (%)</label>
                    <input type="number" value={variacion || ''} onChange={e => setVariacion(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Alquiler actualizado ({indiceAlq} +{variacion}%)</p>
                  <p className="text-2xl font-bold text-[#4CAF50]">{formatARS(alqActualizado)}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
