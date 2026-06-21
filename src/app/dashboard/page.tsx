'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'
import { Building2, Scale, Bot, Landmark, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatARS, MESES, MONOTRIBUTO_CATEGORIAS } from '@/types'
import { Cheque } from '@/types'

interface DashboardStats {
  facturacionAcumulada: number
  acreditacionesAcumuladas: number
  chequesPendientes: Cheque[]
  categoriaActual: string
  mesCierre: number
  anioCierre: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      // Mes anterior (si es enero, tomar dic del año anterior)
      let mesCierre = now.getMonth() // getMonth() ya es 0-based, así que es el mes anterior
      let anioCierre = now.getFullYear()
      if (mesCierre === 0) {
        mesCierre = 12
        anioCierre = anioCierre - 1
      }

      const [negocioRes, chequesRes, fiscalRes, acreditacionesRes] = await Promise.all([
        supabase
          .from('negocio_mensual')
          .select('mes, facturacion, acreditaciones')
          .eq('user_id', user.id)
          .eq('anio', anioCierre)
          .lte('mes', mesCierre),
        supabase
          .from('cheques')
          .select('*')
          .eq('user_id', user.id)
          .eq('estado', 'pendiente')
          .order('fecha_pago'),
        supabase
          .from('categoria_fiscal')
          .select('categoria')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('acreditaciones')
          .select('mes, total_acred, imp_creditos')
          .eq('user_id', user.id)
          .eq('anio', anioCierre)
          .lte('mes', mesCierre),
      ])

      const negocioRows = negocioRes.data || []
      const acreditacionesRows = acreditacionesRes.data || []

      const facturacionAcumulada = negocioRows.reduce((a, r) => a + (r.facturacion || 0), 0)

      // Acreditaciones: usar negocio si hay, sino calcular desde impuesto
      let acreditacionesAcumuladas = 0
      for (let m = 1; m <= mesCierre; m++) {
        const negocioMes = negocioRows.find(r => r.mes === m)
        if (negocioMes && negocioMes.acreditaciones > 0) {
          acreditacionesAcumuladas += negocioMes.acreditaciones
        } else {
          const acredMes = acreditacionesRows.find(r => r.mes === m)
          if (acredMes && acredMes.imp_creditos > 0) {
            acreditacionesAcumuladas += acredMes.imp_creditos / 0.006
          }
        }
      }

      setStats({
        facturacionAcumulada,
        acreditacionesAcumuladas,
        chequesPendientes: chequesRes.data || [],
        categoriaActual: fiscalRes.data?.categoria || 'A',
        mesCierre,
        anioCierre,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D4A6B]" />
          </main>
        </div>
      </AuthGuard>
    )
  }

  const now = new Date()
  const mesCierreLabel = stats ? `Ene–${MESES[stats.mesCierre - 1].slice(0, 3)} ${stats.anioCierre}` : ''
  const catData = MONOTRIBUTO_CATEGORIAS.find(c => c.cat === stats?.categoriaActual)
  const progreso = catData && stats ? Math.min((stats.facturacionAcumulada / catData.fact) * 100, 100) : 0
  const progresoColor = progreso < 75 ? '#4CAF50' : progreso < 90 ? '#FF9800' : '#f44336'

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
          <h1 className="text-3xl font-bold text-[#2D4A6B] mb-1">Panel de Control</h1>
          <p className="text-gray-500 text-base mb-6">Acumulado al {MESES[(stats?.mesCierre ?? 1) - 1]} {stats?.anioCierre} · Actualizado al {now.toLocaleDateString('es-AR')}</p>

          {/* Fila top: Facturación + Acreditaciones + Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            {/* Facturación acumulada */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-[#4CAF50]" />
                <span className="text-base text-gray-500 font-medium">Facturación acumulada</span>
              </div>
              <p className="text-base text-gray-400 mb-2">{mesCierreLabel}</p>
              <p className="text-2xl font-bold text-gray-800">{formatARS(stats?.facturacionAcumulada || 0)}</p>
              {catData && (
                <p className="text-base text-gray-400 mt-1">
                  {((stats?.facturacionAcumulada || 0) / catData.fact * 100).toFixed(1)}% del límite cat. {stats?.categoriaActual}
                </p>
              )}
            </div>

            {/* Acreditaciones acumuladas */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Landmark size={16} className="text-[#2D4A6B]" />
                <span className="text-base text-gray-500 font-medium">Acreditaciones acumuladas</span>
              </div>
              <p className="text-base text-gray-400 mb-2">{mesCierreLabel}</p>
              <p className="text-2xl font-bold text-gray-800">{formatARS(stats?.acreditacionesAcumuladas || 0)}</p>
            </div>

            {/* Categoría Monotributo */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Scale size={16} className="text-[#FF7043]" />
                <span className="text-base text-gray-500 font-medium">Categoría Monotributo</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: progresoColor }}>
                  {stats?.categoriaActual}
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-500">Límite: {catData ? formatARS(catData.fact) : '-'}</p>
                  <p className="text-base font-medium mt-0.5" style={{ color: progresoColor }}>
                    {progreso < 75 ? 'En regla ✓' : progreso < 90 ? '⚠️ Atención' : '🔴 Riesgo'}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all" style={{ width: `${progreso}%`, backgroundColor: progresoColor }} />
              </div>
              <p className="text-base text-gray-400 mt-1">{progreso.toFixed(1)}% del límite</p>
              {progreso >= 90 && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-base text-red-600 font-medium">⚠️ Cerca del límite — considerá recategorizarte</p>
                </div>
              )}
            </div>
          </div>

          {/* Cheques pendientes */}
          <div className="bg-white rounded-xl border border-gray-100 mb-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-[#FF7043]" />
                <h2 className="font-semibold text-[#2D4A6B] text-lg">Cheques pendientes</h2>
              </div>
              <div className="flex gap-3 text-base text-gray-500">
                <span>{stats?.chequesPendientes.length || 0} cheques</span>
                <span className="font-medium text-gray-700">
                  {formatARS((stats?.chequesPendientes || []).reduce((a, c) => a + c.importe, 0))}
                </span>
              </div>
            </div>

            {(!stats?.chequesPendientes || stats.chequesPendientes.length === 0) ? (
              <div className="flex items-center gap-2 px-5 py-6 text-gray-400">
                <CheckCircle2 size={16} />
                <span className="text-base">Sin cheques pendientes</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {stats.chequesPendientes.map(c => {
                  const hoy = new Date()
                  hoy.setHours(0, 0, 0, 0)
                  const venc = c.fecha_pago ? new Date(c.fecha_pago + 'T00:00:00') : null
                  const diffDias = venc ? Math.floor((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)) : null

                  let urgencia = '🔵'
                  let urgenciaColor = '#2D4A6B'
                  let urgenciaLabel = 'Más de 7 días'
                  if (diffDias !== null) {
                    if (diffDias <= 0) { urgencia = '🔴'; urgenciaColor = '#f44336'; urgenciaLabel = diffDias === 0 ? 'Vence hoy' : 'Vencido' }
                    else if (diffDias <= 7) { urgencia = '🟡'; urgenciaColor = '#FF9800'; urgenciaLabel = `${diffDias} día${diffDias > 1 ? 's' : ''}` }
                    else { urgenciaLabel = `${diffDias} días` }
                  }

                  return (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-lg">{urgencia}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-700 truncate">{c.beneficiario}</p>
                        <p className="text-base text-gray-400">{c.banco} #{c.nro}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-gray-800">{formatARS(c.importe)}</p>
                        <p className="text-base font-medium" style={{ color: urgenciaColor }}>
                          {venc ? venc.toLocaleDateString('es-AR') : '-'} · {urgenciaLabel}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Links rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/negocio', label: 'Mi Negocio', icon: Building2, color: '#2D4A6B' },
              { href: '/fiscal', label: 'Categoría Fiscal', icon: Scale, color: '#4CAF50' },
              { href: '/iapoyo', label: 'IApoyo IA', icon: Bot, color: '#FF7043' },
              { href: '/acreditaciones', label: 'Acreditaciones', icon: Landmark, color: '#2D4A6B' },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <span className="font-medium text-gray-700 text-base">{label}</span>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
