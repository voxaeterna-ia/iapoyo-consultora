'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserSub {
  user_id: string
  email?: string
  status: string
  trial_end: string
  current_period_end?: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [users, setUsers] = useState<UserSub[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [extraDays, setExtraDays] = useState<Record<string, number>>({})
  const [newStatus, setNewStatus] = useState<Record<string, string>>({})
  const [adminEmail, setAdminEmail] = useState('')
  const [msg, setMsg] = useState('')

  async function loadUsers() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  function handleAuth() {
    if (adminKey === (process.env.NEXT_PUBLIC_ADMIN_KEY || 'iapoyo2025')) {
      setAuthenticated(true)
      loadUsers()
    } else {
      alert('Clave incorrecta')
    }
  }

  async function grantDays(userId: string) {
    const days = extraDays[userId]
    if (!days || !adminEmail) return alert('Completá email de admin y días')
    const res = await fetch('/api/admin/grant-trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ target_user_id: userId, extra_days: days, admin_email: adminEmail }),
    })
    if (res.ok) { setMsg('Días otorgados'); loadUsers() }
    else setMsg('Error')
  }

  async function changeStatus(userId: string) {
    const status = newStatus[userId]
    if (!status || !adminEmail) return alert('Completá email de admin y estado')
    const res = await fetch('/api/admin/set-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ target_user_id: userId, status, admin_email: adminEmail }),
    })
    if (res.ok) { setMsg('Estado actualizado'); loadUsers() }
    else setMsg('Error')
  }

  const filtered = users.filter(u =>
    u.user_id.includes(search) || u.email?.includes(search) || u.status.includes(search)
  )

  const stats = {
    trialing: users.filter(u => u.status === 'trialing').length,
    active: users.filter(u => u.status === 'active').length,
    expired: users.filter(u => u.status === 'expired').length,
    canceled: users.filter(u => u.status === 'canceled').length,
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#2D4A6B] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-[#2D4A6B] mb-6 text-center">Panel Admin</h1>
          <input type="password" placeholder="Clave de administrador" value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          <button onClick={handleAuth}
            className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#1e3350]">
            Ingresar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#2D4A6B]">Panel Admin — Suscripciones</h1>
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</button>
        </div>

        {msg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{msg}</div>}

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[['En prueba', stats.trialing, 'blue'], ['Activos', stats.active, 'green'], ['Expirados', stats.expired, 'red'], ['Cancelados', stats.canceled, 'gray']].map(([label, count, color]) => (
            <div key={label as string} className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className={`text-2xl font-bold text-${color}-600`}>{count as number}</div>
              <div className="text-xs text-gray-500 mt-1">{label as string}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex gap-3">
          <input placeholder="Buscar por email, ID o estado..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
          <input placeholder="Tu email (admin)" value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            className="w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
        </div>

        {loading ? <div className="text-center py-8 text-gray-400">Cargando...</div> : (
          <div className="space-y-3">
            {filtered.map(u => (
              <div key={u.user_id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-xs text-gray-400 font-mono">{u.user_id}</div>
                    <div className="text-sm font-medium text-gray-700">{u.email || '—'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' :
                        u.status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                        u.status === 'expired' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{u.status}</span>
                      <span className="text-xs text-gray-400">
                        Prueba vence: {new Date(u.trial_end).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input type="number" placeholder="Días" min={1} max={365}
                      value={extraDays[u.user_id] || ''}
                      onChange={e => setExtraDays(p => ({ ...p, [u.user_id]: Number(e.target.value) }))}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]" />
                    <button onClick={() => grantDays(u.user_id)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
                      + Días
                    </button>
                    <select value={newStatus[u.user_id] || ''}
                      onChange={e => setNewStatus(p => ({ ...p, [u.user_id]: e.target.value }))}
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]">
                      <option value="">Cambiar estado</option>
                      {['trialing','active','past_due','canceled','expired'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => changeStatus(u.user_id)}
                      className="bg-[#2D4A6B] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#1e3350]">
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
