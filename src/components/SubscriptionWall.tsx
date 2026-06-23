'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function SubscriptionWall() {
  const [loading, setLoading] = useState(false)
  async function handleContratar() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    if (!data.session) { setLoading(false); return }
    const res = await fetch('/api/subscription/create-preference', {
      method: 'POST', headers: { Authorization: `Bearer ${data.session.access_token}` },
    })
    if (res.ok) { const { init_point } = await res.json(); window.location.href = init_point }
    else { alert('Error al generar el enlace de pago. Intentá nuevamente.'); setLoading(false) }
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-[#2D4A6B] mb-3">Suscripción requerida</h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Tu prueba gratuita finalizó. Elegí un plan para continuar utilizando la aplicación.
        </p>
        <div className="border border-[#2D4A6B] rounded-xl p-5 mb-6 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#2D4A6B]">Plan Mensual</span>
            <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Más elegido</span>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">$5.000 <span className="text-sm font-normal text-gray-500">ARS/mes</span></div>
          <ul className="text-sm text-gray-600 space-y-1 mt-3">
            <li>✓ Asistente IA fiscal y legal ilimitado</li>
            <li>✓ Gestión de negocio y acreditaciones</li>
            <li>✓ Cálculo de categorías Monotributo</li>
            <li>✓ Soporte prioritario</li>
          </ul>
        </div>
        <button onClick={handleContratar} disabled={loading}
          className="w-full bg-[#2D4A6B] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1e3350] transition-colors disabled:opacity-50">
          {loading ? 'Generando enlace...' : 'Contratar ahora con Mercado Pago'}
        </button>
        <p className="text-xs text-gray-400 mt-3">Pago seguro procesado por Mercado Pago. Podés cancelar en cualquier momento.</p>
      </div>
    </div>
  )
}
