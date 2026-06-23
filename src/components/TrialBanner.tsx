'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Subscription {
  status: string
  trial_end: string
}

export default function TrialBanner() {
  const [sub, setSub] = useState<Subscription | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const res = await fetch('/api/subscription/status', {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      })
      if (res.ok) setSub(await res.json())
    })
  }, [])

  if (!sub || sub.status !== 'trialing') return null

  const trialEnd = new Date(sub.trial_end)
  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  const isWarning = daysLeft <= 2

  const endDateStr = trialEnd.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  async function handleContratar() {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    if (!data.session) return
    const res = await fetch('/api/subscription/create-preference', {
      method: 'POST',
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    })
    if (res.ok) {
      const { init_point } = await res.json()
      window.location.href = init_point
    }
  }

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-sm ${isWarning ? 'bg-amber-50 border-b border-amber-200 text-amber-800' : 'bg-blue-50 border-b border-blue-100 text-blue-800'}`}>
      <span>
        {isWarning && <span className="font-bold mr-1">⚠️</span>}
        <span className="font-medium">Te quedan {daysLeft} día{daysLeft !== 1 ? 's' : ''} de prueba gratuita</span>
        <span className="text-xs ml-2 opacity-70">(vence el {endDateStr})</span>
      </span>
      <button onClick={handleContratar} className={`ml-4 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${isWarning ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-[#2D4A6B] text-white hover:bg-[#1e3350]'}`}>
        Contratar plan
      </button>
    </div>
  )
}
