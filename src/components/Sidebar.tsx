'use client'

import Link from 'next/link'
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
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <BrainLogo size={36} />
          <div>
            <div className="font-bold text-sm leading-tight">IApoyo</div>
            <div className="text-[10px] text-white/60 leading-tight">Gestión Fiscal · Legal · Marketing</div>
          </div>
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

function BrainLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#4CAF50" opacity="0.2" />
      <circle cx="20" cy="20" r="14" fill="#4CAF50" opacity="0.3" />
      <path d="M14 16 C14 12 18 10 20 10 C22 10 26 12 26 16 C28 16 30 18 30 20 C30 23 28 25 26 25 L14 25 C12 25 10 23 10 20 C10 18 12 16 14 16Z" fill="#4CAF50" />
      <line x1="20" y1="25" x2="20" y2="30" stroke="#FF7043" strokeWidth="1.5" />
      <line x1="15" y1="28" x2="25" y2="28" stroke="#FF7043" strokeWidth="1.5" />
      <circle cx="15" cy="28" r="1.5" fill="#FF7043" />
      <circle cx="25" cy="28" r="1.5" fill="#FF7043" />
      <line x1="16" y1="18" x2="24" y2="18" stroke="white" strokeWidth="1" opacity="0.7" />
      <line x1="17" y1="21" x2="23" y2="21" stroke="white" strokeWidth="1" opacity="0.7" />
    </svg>
  )
}
