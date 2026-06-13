'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import Link from 'next/link'
import { Building2, Scale, Bot, Landmark, TrendingUp, AlertCircle } from 'lucide-react'
import { formatARS, MESES } from '@/types'

export default function Dashboard() {
  const [stats, setStats] = useState({
    facturacionMes: 0,
    chequesPendientes: 0,
    categoriaActual: '-',
    proximoVencimiento: null as string | null,
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const mes = now.getMonth() + 1
      const anio = now.getFullYear()

      const [negocio, cheques, fiscal] = await Promise.all([
        supabase
          .from('negocio_mensual')
          .select('facturacion')
          .eq('user_id', user.id)
          .eq('anio', anio)
          .eq('mes', mes)
          .single(),
        supabase
          .from('cheques')
          .select('id, fecha_pago')
          .eq('user_id', user.id)
          .eq('estado', 'pendiente'),
        supabase
          .from('categoria_fiscal')
          .select('categoria')
          .eq('user_id', user.id)
          .single(),
      ])

      const pendientes = cheques.data || []
      const proxVenc = pendientes
        .map(c => c.fecha_pago)
        .filter(Boolean)
        .sort()[0] || null

      setStats({
        facturacionMes: negocio.data?.facturacion || 0,
        chequesPendientes: pendientes.length,
        categoriaActual: fiscal.data?.categoria || '-',
        proximoVencimiento: proxVenc,
      })
    }
    load()
  }, [])

  const now = new Date()

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-[#2D4A6B] mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">{MESES[now.getMonth()]} {now.getFullYear()}</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Facturación del mes"
              value={formatARS(stats.facturacionMes)}
              icon={<TrendingUp size={20} className="text-[#4CAF50]" />}
              color="green"
            />
            <StatCard
              title="Cheques pendientes"
              value={String(stats.chequesPendientes)}
              icon={<AlertCircle size={20} className="text-[#FF7043]" />}
              color="orange"
            />
            <StatCard
              title="Categoría Monotributo"
              value={stats.categoriaActual}
              icon={<Scale size={20} className="text-[#2D4A6B]" />}
              color="blue"
            />
            <StatCard
              title="Próximo vencimiento"
              value={stats.proximoVencimiento
                ? new Date(stats.proximoVencimiento + 'T00:00:00').toLocaleDateString('es-AR')
                : 'Sin cheques'}
              icon={<AlertCircle size={20} className="text-gray-400" />}
              color="gray"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/negocio', label: 'Mi Negocio', desc: 'Registros mensuales y cheques', icon: Building2, color: '#2D4A6B' },
              { href: '/fiscal', label: 'Categoría Fiscal', desc: 'Monotributo y recategorización', icon: Scale, color: '#4CAF50' },
              { href: '/iapoyo', label: 'IApoyo IA', desc: 'Asistente fiscal y legal', icon: Bot, color: '#FF7043' },
              { href: '/acreditaciones', label: 'Acreditaciones', desc: 'Control bancario mensual', icon: Landmark, color: '#2D4A6B' },
            ].map(({ href, label, desc, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: color + '20' }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="font-semibold text-gray-800 text-sm">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{desc}</div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const bg = { green: 'bg-green-50', orange: 'bg-orange-50', blue: 'bg-blue-50', gray: 'bg-gray-50' }[color]
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{title}</span></div>
      <div className="text-lg font-bold text-gray-800 truncate">{value}</div>
    </div>
  )
}
