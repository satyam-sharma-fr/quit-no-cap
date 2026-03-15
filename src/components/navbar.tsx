"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart3, Users, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm safe-area-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors ${
                active
                  ? "text-emerald-600 font-semibold"
                  : "text-muted-foreground hover:text-emerald-600"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-emerald-600" : ""}`} />
              {label}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </nav>
  )
}
