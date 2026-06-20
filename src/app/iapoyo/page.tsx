'use client'

import { useState, useRef, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { ChatMessage, formatARS } from '@/types'
import { Send, Bot, User, Calculator, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const MODULOS = [
  { id: 'fiscal', label: 'Consultas Fiscales', emoji: '📊', desc: 'Monotributo, AFIP, impuestos' },
  { id: 'marcas', label: 'Marcas Comerciales', emoji: '™️', desc: 'Registro INPI, protección de marca' },
  { id: 'indemnizacion', label: 'Indemnización Laboral', emoji: '⚖️', desc: 'Liquidación final, derechos laborales' },
  { id: 'alquileres', label: 'Alquileres & Costos', emoji: '🏠', desc: 'Contratos, actualizaciones, índices' },
  { id: 'vehiculos', label: 'Vehículos & Fotomultas', emoji: '🚗', desc: 'Multas, transferencias, patentes' },
  { id: 'marketing', label: 'Marketing & Tecnología', emoji: '📱', desc: 'Redes sociales, presencia digital' },
]

// ─── Marcas ──────────────────────────────────────────────────────────────────
function ModuloMarcas() {
  const [nombre, setNombre] = useState('')
  const [rubro, setRubro] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [clases, setClases] = useState('')
  const [contactNombre, setContactNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleEnviar() {
    if (!nombre || !contactNombre || !email) {
      setError('Completá nombre de marca, tu nombre y email.')
      return
    }
    setError('')
    setEnviando(true)

    // Convert logo to base64 if provided
    let logoData: string | null = null
    let logoNombre: string | null = null
    if (logoFile) {
      logoNombre = logoFile.name
      try {
        // Try upload to Supabase Storage
        const supabase = createClient()
        const ext = logoFile.name.split('.').pop()
        const path = `logos/${Date.now()}.${ext}`
        const { data: uploadData } = await supabase.storage
          .from('logos')
          .upload(path, logoFile, { upsert: true })
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path)
          logoData = urlData?.publicUrl || null
        }
      } catch {
        // Storage not configured — just note filename
        logoData = null
      }
    }

    try {
      await fetch('/api/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'Marcas Comerciales',
          nombre: contactNombre,
          email,
          telefono,
          datos: {
            nombre_marca: nombre,
            rubro,
            descripcion,
            clases_inpi: clases,
            logo_url: logoData,
            logo_nombre: logoNombre,
          },
        }),
      })
      setEnviado(true)
    } catch {
      setError('Error al enviar. Intentá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 size={48} className="text-[#4CAF50] mb-4" />
        <h3 className="text-xl font-bold text-[#2D4A6B] mb-2">¡Consulta enviada!</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Te contactaremos a <strong>{email}</strong> en las próximas 24hs hábiles.
          {logoFile && ' Coordinaremos el envío del logo por separado si es necesario.'}
        </p>
        <button
          onClick={() => { setEnviado(false); setNombre(''); setRubro(''); setDescripcion(''); setClases(''); setContactNombre(''); setEmail(''); setTelefono(''); setLogoFile(null) }}
          className="mt-6 text-sm text-[#2D4A6B] underline"
        >
          Hacer otra consulta
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700 font-medium">™️ Consulta de Registro de Marca — INPI Argentina</p>
        <p className="text-xs text-blue-600 mt-1">Completá el formulario y un especialista te contactará con el presupuesto y los pasos a seguir.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-[#2D4A6B]">Datos de la marca</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nombre de la marca *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
              placeholder="Ej: MiEmpresa" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rubro / actividad</label>
            <input value={rubro} onChange={e => setRubro(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
              placeholder="Ej: Ropa deportiva, Gastronomía..." />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Descripción del producto/servicio</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B] resize-none"
            placeholder="Describí brevemente qué vas a comercializar con esta marca..." />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Clases INPI (si sabés cuáles)</label>
          <input value={clases} onChange={e => setClases(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
            placeholder="Ej: Clase 25 (indumentaria), Clase 35 (servicios comerciales)..." />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Logo / isotipo (opcional)</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#4CAF50] transition-colors"
          >
            {logoFile ? (
              <p className="text-sm text-[#4CAF50] font-medium">✓ {logoFile.name}</p>
            ) : (
              <>
                <p className="text-sm text-gray-400">Hacé clic para adjuntar tu logo</p>
                <p className="text-xs text-gray-300 mt-1">PNG, JPG, SVG — hasta 5MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*,.svg,.pdf" className="hidden"
            onChange={e => setLogoFile(e.target.files?.[0] || null)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-[#2D4A6B]">Tus datos de contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nombre y apellido *</label>
            <input value={contactNombre} onChange={e => setContactNombre(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
              placeholder="Juan Pérez" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
              placeholder="juan@mail.com" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Teléfono</label>
            <input value={telefono} onChange={e => setTelefono(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
              placeholder="11-1234-5678" />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleEnviar}
        disabled={enviando}
        className="w-full bg-[#2D4A6B] text-white py-3 rounded-xl font-medium hover:bg-[#1e3350] disabled:opacity-50 transition-colors"
      >
        {enviando ? 'Enviando...' : '📨 Enviar consulta de marca'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Tu información es confidencial. Un especialista de IApoyo Consultora te responderá en 24hs hábiles.
      </p>
    </div>
  )
}

// ─── Vehículos / Fotomultas ───────────────────────────────────────────────────
function ModuloVehiculos({ onPrecargar }: { onPrecargar: (msg: string) => void }) {
  const [dominio, setDominio] = useState('')
  const [acta, setActa] = useState('')
  const [organismo, setOrganismo] = useState('Municipio')
  const [fecha, setFecha] = useState('')
  const [tipo, setTipo] = useState('')
  const [monto, setMonto] = useState('')
  const [cargado, setCargado] = useState(false)

  function handleConsultar() {
    if (!dominio && !acta) return
    const msg = `Tengo una infracción de tránsito y necesito asesoramiento.

Datos:
- Dominio/Patente: ${dominio || 'no indicado'}
- Nº Acta/Expediente: ${acta || 'no indicado'}
- Organismo: ${organismo}
- Fecha: ${fecha || 'no indicada'}
- Tipo de infracción: ${tipo || 'no especificado'}
- Monto: ${monto ? '$' + monto : 'no indicado'}

¿Qué opciones tengo? ¿Puedo impugnarla? ¿Cuáles son los plazos?`
    onPrecargar(msg)
    setCargado(true)
  }

  if (cargado) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4 space-y-4">
      <h3 className="font-semibold text-[#2D4A6B]">🚗 Datos de la infracción (opcional)</h3>
      <p className="text-xs text-gray-400">Cargá los datos para que el asistente pueda asesorarte mejor.</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Dominio / Patente</label>
          <input value={dominio} onChange={e => setDominio(e.target.value.toUpperCase())}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
            placeholder="AA 123 BB" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Nº Acta / Expediente</label>
          <input value={acta} onChange={e => setActa(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Ej: 12345678" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Organismo</label>
          <select value={organismo} onChange={e => setOrganismo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>Municipio</option>
            <option>Provincia</option>
            <option>Nación (COVIMET)</option>
            <option>GCBA</option>
            <option>Otro</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Fecha de la infracción</label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tipo de infracción</label>
          <input value={tipo} onChange={e => setTipo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="Ej: Velocidad, estacionamiento..." />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Monto ($)</label>
          <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="0" />
        </div>
      </div>

      <button
        onClick={handleConsultar}
        className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#1e3350]"
      >
        Consultar con IApoyo IA →
      </button>
    </div>
  )
}

// ─── Chat ────────────────────────────────────────────────────────────────────
function ChatModulo({ modulo, onBack }: { modulo: typeof MODULOS[0], onBack: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(texto?: string) {
    const msg = texto || input
    if (!msg.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, module: modulo.id, history: messages.slice(-10) }),
      })
      const { response } = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar. Intentá de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-medium text-[#2D4A6B]">{modulo.emoji} {modulo.label}</span>
      </div>

      {modulo.id === 'vehiculos' && (
        <ModuloVehiculos onPrecargar={msg => setInput(msg)} />
      )}

      <div className="flex-1 bg-white rounded-xl border border-gray-100 overflow-y-auto p-4 mb-3 min-h-[280px] max-h-[420px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot size={32} className="mb-2 text-[#2D4A6B] opacity-30" />
            <p className="text-sm text-center">Hacé tu consulta sobre {modulo.label}</p>
            <p className="text-xs text-gray-300 mt-1">{modulo.desc}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 mb-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#2D4A6B] flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              m.role === 'user' ? 'bg-[#2D4A6B] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
            }`}>{m.content}</div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2D4A6B] flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-400">Consultando...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={`Consulta sobre ${modulo.label}...`}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-[#2D4A6B] text-white px-4 py-2.5 rounded-xl hover:bg-[#1e3350] disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── Calculadora Indemnización ────────────────────────────────────────────────
function CalcIndemnizacion() {
  const [salario, setSalario] = useState(0)
  const [anios, setAnios] = useState(0)
  const [mesesExtra, setMesesExtra] = useState(0)
  const [preaviso, setPreaviso] = useState<'no-otorgado' | 'otorgado'>('no-otorgado')
  const [mesesSemestre, setMesesSemestre] = useState(0)
  const [diasVacaciones, setDiasVacaciones] = useState(0)

  const totalMeses = anios * 12 + mesesExtra
  const indem245 = salario * Math.max(1, anios === 0 ? 1 : anios)

  const mesesPreaviso = totalMeses < 60 ? 1 : 2
  const montoPreaviso = preaviso === 'no-otorgado' ? salario * mesesPreaviso : 0
  const sacSobreIndemn = (indem245 + montoPreaviso) / 12

  const montoVacaciones = diasVacaciones > 0 ? (salario / 25) * diasVacaciones : 0
  const sacProporcional = mesesSemestre > 0 ? (salario / 12) * mesesSemestre : 0

  const total = indem245 + montoPreaviso + sacSobreIndemn + montoVacaciones + sacProporcional

  const items = [
    { label: 'Indemnización Art. 245 LCT', sub: `${Math.max(1, anios)} año(s) × ${formatARS(salario)}`, value: indem245, color: '#2D4A6B' },
    { label: `Preaviso (${mesesPreaviso} mes${mesesPreaviso > 1 ? 'es' : ''})`, sub: preaviso === 'otorgado' ? 'Otorgado — no aplica' : `${mesesPreaviso} mes(es) salario`, value: montoPreaviso, color: '#FF7043' },
    { label: 'SAC s/ indemn. y preaviso', sub: '(Art. 245 + preaviso) / 12', value: sacSobreIndemn, color: '#FF9800' },
    { label: 'Vacaciones no gozadas', sub: `${diasVacaciones} días × ${formatARS(salario / 25)}/día`, value: montoVacaciones, color: '#9C27B0' },
    { label: 'SAC proporcional', sub: `${mesesSemestre} mes(es) del semestre`, value: sacProporcional, color: '#4CAF50' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-semibold text-[#2D4A6B] mb-4 flex items-center gap-2">
        <Calculator size={16} /> Liquidación Final — Indemnización LCT
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Mejor salario mensual ($)</label>
          <input type="number" value={salario || ''} onChange={e => setSalario(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Antigüedad — años</label>
          <input type="number" value={anios || ''} onChange={e => setAnios(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" min={0} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Antigüedad — meses adicionales</label>
          <input type="number" value={mesesExtra || ''} onChange={e => setMesesExtra(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" min={0} max={11} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Preaviso</label>
          <select value={preaviso} onChange={e => setPreaviso(e.target.value as 'otorgado' | 'no-otorgado')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="no-otorgado">No otorgado (se paga)</option>
            <option value="otorgado">Otorgado (ya trabajado)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Vacaciones pendientes (días)</label>
          <input type="number" value={diasVacaciones || ''} onChange={e => setDiasVacaciones(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" min={0} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Meses en semestre actual</label>
          <input type="number" value={mesesSemestre || ''} onChange={e => setMesesSemestre(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" min={0} max={6} />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="text-sm text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
            <p className="text-sm font-semibold" style={{ color: item.value === 0 ? '#aaa' : item.color }}>
              {formatARS(item.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-[#2D4A6B] rounded-xl p-4 text-white">
        <p className="text-xs opacity-70 mb-1">Total liquidación estimada</p>
        <p className="text-3xl font-bold">{formatARS(total)}</p>
        <p className="text-xs opacity-60 mt-1">Valores orientativos. Verificar con asesor laboral.</p>
      </div>
    </div>
  )
}

// ─── Calculadora Costo Laboral ────────────────────────────────────────────────
function CalcCostoLaboral() {
  const [bruto, setBruto] = useState(0)
  const aporteEmpleador = bruto * 0.27
  const total = bruto + aporteEmpleador

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-semibold text-[#2D4A6B] mb-4 flex items-center gap-2">
        <Calculator size={16} /> Costo Laboral Empleador
      </h3>
      <div className="mb-4">
        <label className="text-xs text-gray-500 block mb-1">Salario bruto mensual ($)</label>
        <input type="number" value={bruto || ''} onChange={e => setBruto(Number(e.target.value))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
      </div>
      <div className="bg-orange-50 rounded-xl p-4 space-y-2">
        {[
          { label: 'Salario bruto', value: bruto },
          { label: 'Jubilación empleador (16%)', value: bruto * 0.16 },
          { label: 'Obra social empleador (6%)', value: bruto * 0.06 },
          { label: 'ART (~2.5%)', value: bruto * 0.025 },
          { label: 'Otros (~2.5%)', value: bruto * 0.025 },
        ].map(r => (
          <div key={r.label} className="flex justify-between text-sm">
            <span className="text-gray-600">{r.label}</span>
            <span>{formatARS(r.value)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-sm border-t border-orange-200 pt-2">
          <span>Costo total empleador</span>
          <span className="text-[#FF7043]">{formatARS(total)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">Estimación aproximada. Puede variar según convenio colectivo.</p>
    </div>
  )
}

// ─── Calculadora Alquiler ─────────────────────────────────────────────────────
function CalcAlquiler() {
  const [montoBase, setMontoBase] = useState(0)
  const [variacion, setVariacion] = useState(0)
  const [indice, setIndice] = useState('ICL')
  const actualizado = montoBase * (1 + variacion / 100)
  const aumento = actualizado - montoBase

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="font-semibold text-[#2D4A6B] mb-4 flex items-center gap-2">
        <Calculator size={16} /> Actualización de Alquiler
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Monto base ($)</label>
          <input type="number" value={montoBase || ''} onChange={e => setMontoBase(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Índice de actualización</label>
          <select value={indice} onChange={e => setIndice(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option>ICL</option><option>IPC</option><option>RIPTE</option><option>CVS</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Variación {indice} (%)</label>
          <input type="number" value={variacion || ''} onChange={e => setVariacion(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
        </div>
      </div>
      <div className="bg-green-50 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Monto base</span><span>{formatARS(montoBase)}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Aumento ({variacion}%)</span><span className="text-[#4CAF50]">+ {formatARS(aumento)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-green-200 pt-2">
          <span>Alquiler actualizado</span><span className="text-[#2D4A6B] text-lg">{formatARS(actualizado)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function IApoyoPage() {
  const [tab, setTab] = useState<'chat' | 'calculadoras'>('chat')
  const [modulo, setModulo] = useState<typeof MODULOS[0] | null>(null)

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-auto">
          <h1 className="text-2xl font-bold text-[#2D4A6B] mb-4">IApoyo — Asistente IA</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {([['chat', '💬 Asistente IA'], ['calculadoras', '🧮 Calculadoras']] as const).map(([t, label]) => (
              <button
                key={t}
                onClick={() => { setTab(t); if (t === 'chat') setModulo(null) }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-[#2D4A6B] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Chat tab ── */}
          {tab === 'chat' && (
            <>
              {!modulo && (
                <>
                  <p className="text-sm text-gray-500 mb-3">Seleccioná un módulo para comenzar:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {MODULOS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setModulo(m)}
                        className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#4CAF50] hover:shadow-sm transition-all"
                      >
                        <span className="text-2xl block mb-1">{m.emoji}</span>
                        <span className="text-sm font-medium text-gray-700 block">{m.label}</span>
                        <span className="text-xs text-gray-400">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {modulo && modulo.id === 'marcas' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setModulo(null)} className="text-gray-400 hover:text-gray-600">
                      <ArrowLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-[#2D4A6B]">™️ Marcas Comerciales</span>
                  </div>
                  <ModuloMarcas />
                </div>
              )}

              {modulo && modulo.id !== 'marcas' && (
                <ChatModulo modulo={modulo} onBack={() => setModulo(null)} />
              )}
            </>
          )}

          {/* ── Calculadoras tab ── */}
          {tab === 'calculadoras' && (
            <div className="space-y-6">
              <CalcIndemnizacion />
              <CalcCostoLaboral />
              <CalcAlquiler />
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
