'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

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
          <Image src="/logo.png" alt="IApoyo Consultora" width={120} height={132} className="mb-1" />
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
