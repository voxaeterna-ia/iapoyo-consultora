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
  const [modo, setModo] = useState<'login' | 'register'>('login')
  const [registered, setRegistered] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (modo === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email o contraseña incorrectos')
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        // Try to sign in immediately (works when email confirmation is disabled)
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) {
          // Confirmation required
          setRegistered(true)
          setLoading(false)
        } else {
          router.push('/dashboard')
        }
      }
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

        {registered ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">📧</div>
            <p className="text-[#2D4A6B] font-semibold">¡Registro exitoso!</p>
            <p className="text-sm text-gray-500">Revisá tu email y hacé click en el enlace de confirmación para activar tu cuenta.</p>
            <button onClick={() => { setModo('login'); setRegistered(false) }}
              className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#1e3350] transition-colors">
              Volver al inicio
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => { setModo('login'); setError('') }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${modo === 'login' ? 'bg-[#2D4A6B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                Ingresar
              </button>
              <button onClick={() => { setModo('register'); setError('') }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${modo === 'register' ? 'bg-[#2D4A6B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                Registrarse
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
                  placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A6B]"
                  placeholder="••••••••" />
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-[#2D4A6B] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#1e3350] transition-colors disabled:opacity-50">
                {loading ? '...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
