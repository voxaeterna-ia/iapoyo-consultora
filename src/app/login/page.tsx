'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<'login' | 'register'>('login')
  const [registered, setRegistered] = useState(false)
  const refId = searchParams.get('ref')

  useEffect(() => {
    if (refId) setModo('register')
  }, [refId])

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
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) {
          setRegistered(true)
          setLoading(false)
        } else {
          if (loginData.session) {
            try {
              await fetch('/api/subscription/status', {
                headers: { Authorization: `Bearer ${loginData.session.access_token}` },
              })
              if (refId) {
                await fetch('/api/referral/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${loginData.session.access_token}`,
                  },
                  body: JSON.stringify({ referrer_id: refId }),
                })
              }
            } catch {}
          }
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
          {refId && (
            <p className="text-xs text-green-600 font-medium mt-2 bg-green-50 px-3 py-1 rounded-full">
              ¡Fuiste invitado! Registrate para activar tu cuenta
            </p>
          )}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
