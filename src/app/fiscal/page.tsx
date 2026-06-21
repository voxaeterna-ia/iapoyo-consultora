'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { CategoriaFiscal, MONOTRIBUTO_CATEGORIAS, formatARS } from '@/types'

export default function FiscalPage() {
  const [data, setData] = useState<CategoriaFiscal>({
    cuit: '', condicion: 'monotributista', categoria: 'A', actividad_principal: '', actividad_secundaria: ''
  })
  const [facturacionAnual, setFacturacionAnual] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Recategorización inputs
  const [recatFact, setRecatFact] = useState(0)
  const [recatSup, setRecatSup] = useState(0)
  const [recatEnergia, setRecatEnergia] = useState(0)
  const [recatAlquiler, setRecatAlquiler] = useState(0)

  // IVA
  const [debito, setDebito] = useState(0)
  const [credito, setCredito] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [fiscalRes, negocioRes] = await Promise.all([
        supabase.from('categoria_fiscal').select('*').eq('user_id', user.id).single(),
        supabase.from('negocio_mensual').select('facturacion').eq('user_id', user.id).eq('anio', new Date().getFullYear()),
      ])

      if (fiscalRes.data) setData(fiscalRes.data)

      const totalFact = (negocioRes.data || []).reduce((a, r) => a + (r.facturacion || 0), 0)
      setFacturacionAnual(totalFact)
    }
    load()
  }, [])

  async function save() {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('categoria_fiscal').upsert(
      { ...data, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const catActual = MONOTRIBUTO_CATEGORIAS.find(c => c.cat === data.categoria)
  const progreso = catActual ? Math.min((facturacionAnual / catActual.fact) * 100, 100) : 0

  const semaforoColor = progreso < 80 ? '#4CAF50' : progreso < 95 ? '#FF9800' : '#f44336'
  const semaforoLabel = progreso < 80 ? 'En regla' : progreso < 95 ? 'Atención' : '¡Riesgo!'

  // Recategorización
  const catSugerida = MONOTRIBUTO_CATEGORIAS.find(c =>
    recatFact <= c.fact &&
    recatSup <= c.sup &&
    recatEnergia <= c.energia &&
    recatAlquiler <= c.alquiler
  )

  const ivaResultado = debito - credito

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
          <h1 className="text-2xl font-bold text-[#2D4A6B] mb-6">Categoría Fiscal</h1>

          {/* Datos generales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <h2 className="font-semibold text-[#2D4A6B] mb-4">Datos Fiscales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">CUIT</label>
                <input
                  value={data.cuit}
                  onChange={e => setData(d => ({ ...d, cuit: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="20-12345678-9"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Condición fiscal</label>
                <select
                  value={data.condicion}
                  onChange={e => setData(d => ({ ...d, condicion: e.target.value as CategoriaFiscal['condicion'] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="monotributista">Monotributista</option>
                  <option value="responsable_inscripto">Responsable Inscripto</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Actividad principal</label>
                <input
                  value={data.actividad_principal}
                  onChange={e => setData(d => ({ ...d, actividad_principal: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Actividad secundaria</label>
                <input
                  value={data.actividad_secundaria}
                  onChange={e => setData(d => ({ ...d, actividad_secundaria: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              onClick={save}
              className="mt-4 bg-[#2D4A6B] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1e3350]"
            >
              {saved ? '✓ Guardado' : 'Guardar'}
            </button>
          </div>

          {/* Monotributista */}
          {data.condicion === 'monotributista' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                <h2 className="font-semibold text-[#2D4A6B] mb-4">Estado de Categoría</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Categoría actual</label>
                    <select
                      value={data.categoria}
                      onChange={e => setData(d => ({ ...d, categoria: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      {MONOTRIBUTO_CATEGORIAS.map(c => (
                        <option key={c.cat} value={c.cat}>Categoría {c.cat} — hasta {formatARS(c.fact)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: semaforoColor }}>
                      {data.categoria}
                    </div>
                    <span className="text-xs font-medium mt-1 block" style={{ color: semaforoColor }}>{semaforoLabel}</span>
                  </div>
                </div>

                <div className="mb-2 flex justify-between text-sm">
                  <span>Facturación anual acumulada</span>
                  <span className="font-medium">{formatARS(facturacionAnual)} / {catActual ? formatARS(catActual.fact) : '-'}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div
                    className="h-4 rounded-full transition-all"
                    style={{ width: `${progreso}%`, backgroundColor: semaforoColor }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{progreso.toFixed(1)}% del límite de categoría</p>
              </div>

              {/* Recategorización */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                <h2 className="font-semibold text-[#2D4A6B] mb-1">Calculadora de Recategorización</h2>
                <p className="text-xs text-gray-500 mb-4">Parámetros ARCA vigentes Feb–Jul 2026</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Facturación anual ($)</label>
                    <input type="number" value={recatFact || ''} onChange={e => setRecatFact(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Superficie (m²)</label>
                    <input type="number" value={recatSup || ''} onChange={e => setRecatSup(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Energía eléctrica (kWh)</label>
                    <input type="number" value={recatEnergia || ''} onChange={e => setRecatEnergia(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Alquileres anuales ($)</label>
                    <input type="number" value={recatAlquiler || ''} onChange={e => setRecatAlquiler(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                </div>

                {(recatFact > 0 || recatSup > 0) && (
                  <div className={`rounded-lg p-4 text-center ${catSugerida ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    {catSugerida ? (
                      <>
                        <p className="text-sm text-gray-600">Categoría sugerida</p>
                        <p className="text-3xl font-bold text-[#4CAF50]">{catSugerida.cat}</p>
                        <p className="text-xs text-gray-500 mt-1">Límite: {formatARS(catSugerida.fact)} / año</p>
                      </>
                    ) : (
                      <p className="text-red-600 font-medium">Los parámetros superan la categoría K — Excluido de Monotributo</p>
                    )}
                  </div>
                )}

                {/* Tabla cuotas — Servicios */}
                <div className="mt-5">
                  <h3 className="text-xs font-semibold text-[#2D4A6B] mb-2 uppercase tracking-wide">Cuotas mensuales — Locación / Prestación de Servicios (Feb–Jul 2026)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#2D4A6B] text-white">
                          <th className="px-2 py-1.5 text-left font-medium">Cat</th>
                          <th className="px-2 py-1.5 text-right font-medium">Límite fact.</th>
                          <th className="px-2 py-1.5 text-right font-medium">Cuota</th>
                          <th className="px-2 py-1.5 text-right font-medium">Obra Social</th>
                          <th className="px-2 py-1.5 text-right font-medium">ART</th>
                          <th className="px-2 py-1.5 text-right font-medium">Total/mes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONOTRIBUTO_CATEGORIAS.map(c => {
                          const esCatActual = c.cat === data.categoria
                          const esCatSugerida = catSugerida?.cat === c.cat
                          const total = c.cuota + c.obraSocial + c.art
                          return (
                            <tr key={c.cat} className={`border-t border-gray-100 ${esCatSugerida ? 'bg-blue-100 font-bold' : esCatActual ? 'bg-yellow-50 font-semibold' : 'hover:bg-gray-50'}`}>
                              <td className="px-2 py-1.5">
                                <span className="flex items-center gap-1">
                                  {c.cat}
                                  {esCatActual && <span className="text-yellow-600 text-[10px]">← actual</span>}
                                  {esCatSugerida && !esCatActual && <span className="text-blue-600 text-[10px]">← sugerida</span>}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-right">{formatARS(c.fact)}</td>
                              <td className="px-2 py-1.5 text-right">{formatARS(c.cuota)}</td>
                              <td className="px-2 py-1.5 text-right">{formatARS(c.obraSocial)}</td>
                              <td className="px-2 py-1.5 text-right">{formatARS(c.art)}</td>
                              <td className="px-2 py-1.5 text-right font-bold">{formatARS(total)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabla cuotas — Comercio */}
                <div className="mt-5">
                  <h3 className="text-xs font-semibold text-[#2D4A6B] mb-2 uppercase tracking-wide">Cuotas mensuales — Venta de Cosas Muebles (Feb–Jul 2026)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[#4CAF50] text-white">
                          <th className="px-2 py-1.5 text-left font-medium">Cat</th>
                          <th className="px-2 py-1.5 text-right font-medium">Límite fact.</th>
                          <th className="px-2 py-1.5 text-right font-medium">Precio unit. máx.</th>
                          <th className="px-2 py-1.5 text-right font-medium">Cuota</th>
                          <th className="px-2 py-1.5 text-right font-medium">Total/mes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONOTRIBUTO_CATEGORIAS.map(c => {
                          const esCatActual = c.cat === data.categoria
                          const esCatSugerida = catSugerida?.cat === c.cat
                          const soloServicios = ['I', 'J', 'K'].includes(c.cat)
                          const precioUnitMax = soloServicios ? null : Math.round(c.fact / 100)
                          const total = c.cuota + c.obraSocial + c.art
                          return (
                            <tr key={c.cat} className={`border-t border-gray-100 ${esCatSugerida ? 'bg-blue-100 font-bold' : esCatActual ? 'bg-yellow-50 font-semibold' : 'hover:bg-gray-50'}`}>
                              <td className="px-2 py-1.5">
                                <span className="flex items-center gap-1">
                                  {c.cat}
                                  {esCatActual && <span className="text-yellow-600 text-[10px]">← actual</span>}
                                  {esCatSugerida && !esCatActual && <span className="text-blue-600 text-[10px]">← sugerida</span>}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-right">{formatARS(c.fact)}</td>
                              <td className="px-2 py-1.5 text-right text-gray-500">
                                {soloServicios ? <span className="text-gray-400">Solo servicios</span> : formatARS(precioUnitMax!)}
                              </td>
                              <td className="px-2 py-1.5 text-right">{formatARS(c.cuota)}</td>
                              <td className="px-2 py-1.5 text-right font-bold">{formatARS(total)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">⚠️ Los valores de cuota, obra social y ART son orientativos y pueden variar. Verificá los valores exactos vigentes en ARCA antes de recategorizarte. Consultá con tu contador.</p>
                </div>
              </div>
            </>
          )}

          {/* Responsable Inscripto */}
          {data.condicion === 'responsable_inscripto' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-[#2D4A6B] mb-4">Calculadora IVA</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Débito fiscal (IVA ventas)</label>
                  <input type="number" value={debito || ''} onChange={e => setDebito(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Crédito fiscal (IVA compras)</label>
                  <input type="number" value={credito || ''} onChange={e => setCredito(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
              </div>
              <div className={`rounded-lg p-4 text-center ${ivaResultado > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <p className="text-sm text-gray-600">{ivaResultado > 0 ? 'IVA a pagar' : 'Saldo a favor'}</p>
                <p className="text-2xl font-bold" style={{ color: ivaResultado > 0 ? '#f44336' : '#4CAF50' }}>
                  {formatARS(Math.abs(ivaResultado))}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}
