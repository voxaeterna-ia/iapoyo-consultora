'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import SubscriptionWall from '@/components/SubscriptionWall'
import TrialBanner from '@/components/TrialBanner'

interface Subscription {
  status: string
  trial_end: string
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      try {
        const res = await fetch('/api/subscription/status', {
          headers: { Authorization: `Bearer ${data.session.access_token}` },
        })
        if (res.ok) setSubscription(await res.json())
      } catch {}
      setChecking(false)
    })
  }, [router])

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D4A6B]" />
      </div>
    )
  }

  if (subscription && ['expired', 'past_due'].includes(subscription.status)) {
    return <SubscriptionWall />
  }

  return (
    <>
      <TrialBanner />
      {children}
    </>
  )
}
