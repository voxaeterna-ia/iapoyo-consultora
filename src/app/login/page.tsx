'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#2D4A6B] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <svg width="64" height="64" viewBox="0 0 40 40" fill="none" className="mb-3">
            <circle cx="20" cy="20" r="18" fill="#4CAF50" opacity="0.2" />
            <circle cx="20" cy="20" r="14" fill="#4CAF50" opacity="0.3" />
            <path d="M14 16 C14 12 18 10 20 10 C22 10 26 12 26 16 C28 16 30 18 30 20 C30 23 28 25 26 25 L14 25 C12 25 10 23 10 20 C10 18 12 16 14 16Z" fill="#4CAF50" />
            <line x1="20" y1="25" x2="20" y2="30" stroke="#FF7043" strokeWidth="1.5" />
            <line x1="15" y1="28" x2="25" y2="28" stroke="#FF7043" strokeWidth="1.5" />
            <circle cx="15" cy="28" r="1.5" fill="#FF7043" />
            <circle cx="25" cy="28" r="1.5" fill="#FF7043" />
          </svg>
          <h1 className="text-xl font-bold text-[#2D4A6B]">IApoyo Consultora</h1>
          <p className="text-xs text-gray-500 mt-1">Gestión Fiscal · Legal · Marketing</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#1e3350] transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
