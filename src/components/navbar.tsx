"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart3, Users, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/buddy", label: "Buddy", icon: Users },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out")
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-t border-white/[0.04] safe-area-bottom animate-slide-up">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-1 px-4 py-1.5 text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
                active
                  ? "text-red-400"
                  : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {active && (
                <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-6 h-[2px] bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              )}
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-1.5 text-[10px] font-medium tracking-wider uppercase text-zinc-600 hover:text-red-400 transition-all duration-300"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Exit
        </button>
      </div>
    </nav>
  )
}
