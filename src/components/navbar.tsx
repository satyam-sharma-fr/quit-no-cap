"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

const tabs = [
  {
    label: "Home",
    href: "/dashboard",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Stats",
    href: "/stats",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Buddy",
    href: "/buddy",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
]

const logoutIcon = (color: string) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  const activeColor = "#C8F56E"
  const inactiveColor = "rgba(255,255,255,0.25)"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-transparent to-[#0C0C0E] safe-area-bottom">
      <div className="flex items-center justify-around py-3.5 pb-[18px] max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const color = isActive ? activeColor : inactiveColor
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1"
            >
              {tab.icon(color)}
              <span
                className="text-[10px] uppercase tracking-[0.06em]"
                style={{ color }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex flex-col items-center gap-1"
        >
          {logoutIcon(inactiveColor)}
          <span
            className="text-[10px] uppercase tracking-[0.06em]"
            style={{ color: inactiveColor }}
          >
            Logout
          </span>
        </button>
      </div>
    </nav>
  )
}
