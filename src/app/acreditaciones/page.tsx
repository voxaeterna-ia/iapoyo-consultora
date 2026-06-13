'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { Acreditacion, formatARS, MESES } from '@/types'
import { RefreshCw } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MES = new Date().getMonth() + 1

export default function AcreditacionesPage() {
  const [anio, setAnio] = useState(CURRENT_YEAR)
  const [mes, setMes] = useState(CURRENT_MES)
  const [data, setData] = useState<Acreditacion>({
    anio: CURRENT_YEAR, mes: CURRENT_MES, banco: '',
    imp_creditos: 0, prestamos: 0, transferencias: 0, otras: 0, total_acred: 0, facturacion: 0
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [historial, setHistorial] = useState<Acreditacion[]>([])
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [current, history] = await Promise.all([
      supabase.from('acreditaciones').select('*').eq('user_id', user.id).eq('anio', anio).eq('mes', mes).single(),
      supabase.from('acreditaciones').select('*').eq('user_id', user.id).order('anio', { ascending: false }).order('mes', { ascending: false }).limit(12),
    ])

    if (current.data) {
      setData(current.data)
    } else {
      setData({ anio, mes, banco: '', imp_creditos: 0, prestamos: 0, transferencias: 0, otras: 0, total_acred: 0, facturacion: 0 })
    }
    setHistorial(history.data || [])
  }, [anio, mes])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('acreditaciones').upsert(
      { ...data, user_id: userId, anio, mes },
      { onConflict: 'user_id,anio,mes' }
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    load()
  }

  async function syncFromNegocio() {
    if (!userId) return
    setSyncing(true)
    const supabase = createClient()
    const { data: negocio } = await supabase
      .from('negocio_mensual')
      .select('facturacion, acreditaciones')
      .eq('user_id', userId)
      .eq('anio', anio)
      .eq('mes', mes)
      .single()

    if (negocio) {
      setData(prev => ({
        ...prev,
        facturacion: negocio.facturacion || 0,
        total_acred: negocio.acreditaciones || 0,
      }))
    }
    setSyncing(false)
  }

  const depuradas = data.total_acred - data.imp_creditos - data.prestamos - data.transferencias - data.otras
  const diferencia = data.facturacion > 0 ? ((depuradas - data.facturacion) / data.facturacion) * 100 : 0
  const semaforoColor = Math.abs(diferencia) <= 10 ? '#4CAF50' : Math.abs(diferencia) <= 20 ? '#FF9800' : '#f44336'
  const semaforoLabel = Math.abs(diferencia) <= 10 ? 'Consistente' : Math.abs(diferencia) <= 20 ? 'Revisar' : 'Inconsistente'

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <h1 className="text-2xl font-bold text-[#2D4A6B] mb-6">Acreditaciones Bancarias</h1>

          <div className="flex gap-3 mb-6">
            <select value={mes} onChange={e => setMes(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={anio} onChange={e => setAnio(Number(e.target.value))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {[CURRENT_YEAR - 1, CURRENT_YEAR].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#2D4A6B]">{MESES[mes - 1]} {anio}</h2>
              <button
                onClick={syncFromNegocio}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs text-[#4CAF50] border border-[#4CAF50] px-3 py-1.5 rounded-lg hover:bg-green-50"
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                Sincronizar con Mi Negocio
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { field: 'banco', label: 'Banco', type: 'text' },
                { field: 'total_acred', label: 'Total acreditaciones ($)', type: 'number' },
                { field: 'facturacion', label: 'Facturación del mes ($)', type: 'number' },
                { field: 'imp_creditos', label: 'Impuesto créditos bancarios ($)', type: 'number' },
                { field: 'prestamos', label: 'Préstamos ($)', type: 'number' },
                { field: 'transferencias', label: 'Transferencias ($)', type: 'number' },
                { field: 'otras', label: 'Otras no computables ($)', type: 'number' },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={(data as unknown as Record<string, string | number>)[field] || ''}
                    onChange={e => setData(prev => ({ ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder={type === 'number' ? '0' : ''}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Acreditaciones depuradas</p>
                <p className="text-xl font-bold text-[#2D4A6B]">{formatARS(depuradas)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Facturación declarada</p>
                <p className="text-xl font-bold text-gray-700">{formatARS(data.facturacion)}</p>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: semaforoColor + '20' }}>
                <p className="text-xs text-gray-500">Estado</p>
                <p className="text-xl font-bold" style={{ color: semaforoColor }}>{semaforoLabel}</p>
                <p className="text-xs" style={{ color: semaforoColor }}>
                  {diferencia > 0 ? '+' : ''}{diferencia.toFixed(1)}% diferencia
                </p>
              </div>
            </div>

            <button onClick={save} className="mt-4 bg-[#2D4A6B] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1e3350]">
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>
          </div>

          {/* Historial */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-[#2D4A6B]">Historial</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium">Período</th>
                  <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">Total acred.</th>
                  <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">Depuradas</th>
                  <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">Facturación</th>
                  <th className="px-3 py-2 text-center text-xs text-gray-500 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((h, i) => {
                  const dep = h.total_acred - h.imp_creditos - h.prestamos - h.transferencias - h.otras
                  const dif = h.facturacion > 0 ? ((dep - h.facturacion) / h.facturacion) * 100 : 0
                  const color = Math.abs(dif) <= 10 ? '#4CAF50' : Math.abs(dif) <= 20 ? '#FF9800' : '#f44336'
                  return (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="px-4 py-2">{MESES[h.mes - 1]} {h.anio}</td>
                      <td className="px-3 py-2 text-right">{formatARS(h.total_acred)}</td>
                      <td className="px-3 py-2 text-right">{formatARS(dep)}</td>
                      <td className="px-3 py-2 text-right">{formatARS(h.facturacion)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color, backgroundColor: color + '20' }}>
                          {dif > 0 ? '+' : ''}{dif.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
