'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard,
  Building2,
  Scale,
  Bot,
  Landmark,
  LogOut,
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/negocio', label: 'Negocio', icon: Building2 },
  { href: '/fiscal', label: 'Fiscal', icon: Scale },
  { href: '/iapoyo', label: 'IApoyo', icon: Bot },
  { href: '/acreditaciones', label: 'Banco', icon: Landmark },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile bottom nav — fixed, always visible */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#2D4A6B] z-50 flex justify-around items-center py-3 border-t border-white/10">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              pathname === href ? 'text-[#4CAF50]' : 'text-white/60 hover:text-white'
            }`}>
            <Icon size={28} />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 px-2 py-1 text-white/40">
          <LogOut size={28} />
          <span className="text-xs">Salir</span>
        </button>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[#2D4A6B] text-white">
        <div className="flex flex-col items-center px-5 py-5 border-b border-white/10">
          <Image src="/logo-white.svg" alt="IApoyo Consultora" width={90} height={99} className="mb-1" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === href ? 'bg-[#4CAF50] text-white font-medium' : 'text-white/80 hover:bg-white/10'
              }`}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

