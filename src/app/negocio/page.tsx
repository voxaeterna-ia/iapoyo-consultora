'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { NegocioMensual, Cheque, formatARS, MESES } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Plus, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

const EMPTY_ROW = (mes: number): NegocioMensual => ({
  anio: CURRENT_YEAR, mes, facturacion: 0, compras: 0, gastos: 0, sueldos_cs: 0, acreditaciones: 0
})

export default function NegocioPage() {
  const [anio, setAnio] = useState(CURRENT_YEAR)
  const [rows, setRows] = useState<NegocioMensual[]>(Array.from({ length: 12 }, (_, i) => EMPTY_ROW(i + 1)))
  const [cheques, setCheques] = useState<Cheque[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const [newCheque, setNewCheque] = useState<Partial<Cheque>>({})
  const [showAddCheque, setShowAddCheque] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [negocioRes, chequesRes] = await Promise.all([
      supabase.from('negocio_mensual').select('*').eq('user_id', user.id).eq('anio', anio),
      supabase.from('cheques').select('*').eq('user_id', user.id).order('fecha_pago'),
    ])

    const dbRows = negocioRes.data || []
    setRows(Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1
      return dbRows.find(r => r.mes === mes) || EMPTY_ROW(mes)
    }))
    setCheques(chequesRes.data || [])
  }, [anio])

  useEffect(() => { loadData() }, [loadData])

  async function saveRow(row: NegocioMensual) {
    if (!userId) return
    setSaving(`${row.mes}`)
    const supabase = createClient()
    await supabase.from('negocio_mensual').upsert(
      { ...row, user_id: userId, anio },
      { onConflict: 'user_id,anio,mes' }
    )
    setSaving(null)
  }

  function updateCell(mes: number, field: keyof NegocioMensual, value: string) {
    setRows(prev => prev.map(r => r.mes === mes ? { ...r, [field]: parseFloat(value) || 0 } : r))
  }

  const totals = rows.reduce((acc, r) => ({
    facturacion: acc.facturacion + r.facturacion,
    compras: acc.compras + r.compras,
    gastos: acc.gastos + r.gastos,
    sueldos_cs: acc.sueldos_cs + r.sueldos_cs,
    acreditaciones: acc.acreditaciones + r.acreditaciones,
  }), { facturacion: 0, compras: 0, gastos: 0, sueldos_cs: 0, acreditaciones: 0 })

  const chartData = rows.map(r => ({
    mes: MESES[r.mes - 1].slice(0, 3),
    Facturación: r.facturacion,
    Gastos: r.gastos + r.compras,
  }))

  async function addCheque() {
    if (!userId || !newCheque.nro) return
    const supabase = createClient()
    await supabase.from('cheques').insert({ ...newCheque, user_id: userId, estado: newCheque.estado || 'pendiente' })
    setNewCheque({})
    setShowAddCheque(false)
    loadData()
  }

  async function deleteCheque(id: string) {
    const supabase = createClient()
    await supabase.from('cheques').delete().eq('id', id)
    setCheques(prev => prev.filter(c => c.id !== id))
  }

  async function toggleEstado(cheque: Cheque) {
    const next = cheque.estado === 'cobrado' ? 'pendiente' : 'cobrado'
    const supabase = createClient()
    await supabase.from('cheques').update({ estado: next }).eq('id', cheque.id!)
    setCheques(prev => prev.map(c => c.id === cheque.id ? { ...c, estado: next } : c))
  }

  const pendientes = cheques.filter(c => c.estado === 'pendiente')
  const proximosMes = pendientes.filter(c => {
    const d = new Date(c.fecha_pago + 'T00:00:00')
    const now = new Date()
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  })

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#2D4A6B]">Mi Negocio</h1>
            <select
              value={anio}
              onChange={e => setAnio(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Tabla registros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#2D4A6B] text-white">
                  <th className="px-4 py-3 text-left font-medium">Mes</th>
                  <th className="px-3 py-3 text-right font-medium">Facturación</th>
                  <th className="px-3 py-3 text-right font-medium">Compras</th>
                  <th className="px-3 py-3 text-right font-medium">Gastos</th>
                  <th className="px-3 py-3 text-right font-medium">Sueldos+CS</th>
                  <th className="px-3 py-3 text-right font-medium">Acreditaciones</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.mes} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-700">{MESES[row.mes - 1]}</td>
                    {(['facturacion', 'compras', 'gastos', 'sueldos_cs', 'acreditaciones'] as const).map(field => (
                      <td key={field} className="px-3 py-2">
                        <input
                          type="number"
                          value={row[field] || ''}
                          onChange={e => updateCell(row.mes, field, e.target.value)}
                          onBlur={() => saveRow(row)}
                          className="w-full text-right bg-transparent border-b border-transparent focus:border-[#4CAF50] focus:outline-none text-sm py-1"
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td className="px-2 py-2 text-xs text-gray-400">
                      {saving === String(row.mes) ? '...' : ''}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#2D4A6B] bg-blue-50 font-bold">
                  <td className="px-4 py-2 text-[#2D4A6B]">TOTAL</td>
                  <td className="px-3 py-2 text-right text-[#2D4A6B] text-xs">{formatARS(totals.facturacion)}</td>
                  <td className="px-3 py-2 text-right text-[#2D4A6B] text-xs">{formatARS(totals.compras)}</td>
                  <td className="px-3 py-2 text-right text-[#2D4A6B] text-xs">{formatARS(totals.gastos)}</td>
                  <td className="px-3 py-2 text-right text-[#2D4A6B] text-xs">{formatARS(totals.sueldos_cs)}</td>
                  <td className="px-3 py-2 text-right text-[#2D4A6B] text-xs">{formatARS(totals.acreditaciones)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Gráfico */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <h2 className="font-semibold text-[#2D4A6B] mb-4">Facturación vs Gastos {anio}</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatARS(Number(v))} />
                <Legend />
                <Bar dataKey="Facturación" fill="#4CAF50" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Gastos" fill="#FF7043" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Próximos vencimientos */}
          {proximosMes.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <h2 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Próximos vencimientos (30 días)
              </h2>
              <div className="space-y-1">
                {proximosMes.map(c => (
                  <div key={c.id} className="flex justify-between text-sm">
                    <span>{c.beneficiario} — {c.banco} #{c.nro}</span>
                    <span className="font-medium">{formatARS(c.importe)} — {new Date(c.fecha_pago + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cheques */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-[#2D4A6B]">Cartera de Cheques</h2>
              <button
                onClick={() => setShowAddCheque(!showAddCheque)}
                className="flex items-center gap-1 bg-[#4CAF50] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>

            {showAddCheque && (
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { field: 'nro', label: 'N° Cheque', type: 'text' },
                  { field: 'banco', label: 'Banco', type: 'text' },
                  { field: 'importe', label: 'Importe', type: 'number' },
                  { field: 'fecha_pago', label: 'Fecha pago', type: 'date' },
                  { field: 'beneficiario', label: 'Beneficiario', type: 'text' },
                  { field: 'concepto', label: 'Concepto', type: 'text' },
                ].map(({ field, label, type }) => (
                  <div key={field}>
                    <label className="text-xs text-gray-500 block mb-1">{label}</label>
                    <input
                      type={type}
                      value={(newCheque as Record<string, string>)[field] || ''}
                      onChange={e => setNewCheque(prev => ({ ...prev, [field]: e.target.value }))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm"
                    />
                  </div>
                ))}
                <div className="col-span-2 md:col-span-4 flex gap-2">
                  <button onClick={addCheque} className="bg-[#2D4A6B] text-white px-4 py-1.5 rounded text-sm">Guardar</button>
                  <button onClick={() => setShowAddCheque(false)} className="text-gray-500 px-4 py-1.5 rounded text-sm border">Cancelar</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs text-gray-500 font-medium">N°</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium">Banco</th>
                    <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">Importe</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium">Fecha</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium">Beneficiario</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium">Concepto</th>
                    <th className="px-3 py-2 text-center text-xs text-gray-500 font-medium">Estado</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cheques.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-gray-400 py-8">Sin cheques registrados</td></tr>
                  ) : cheques.map(c => (
                    <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">{c.nro}</td>
                      <td className="px-3 py-2">{c.banco}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatARS(c.importe)}</td>
                      <td className="px-3 py-2 text-xs">{c.fecha_pago ? new Date(c.fecha_pago + 'T00:00:00').toLocaleDateString('es-AR') : '-'}</td>
                      <td className="px-3 py-2 text-xs">{c.beneficiario}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{c.concepto}</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => toggleEstado(c)} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.estado === 'cobrado' ? 'bg-green-100 text-green-700' :
                          c.estado === 'vencido' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.estado === 'cobrado' ? <CheckCircle size={11} /> : <Clock size={11} />}
                          {c.estado}
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button onClick={() => deleteCheque(c.id!)} className="text-gray-300 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
