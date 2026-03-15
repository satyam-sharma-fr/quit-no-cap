"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { motion } from "framer-motion"

const tabs = [
  {
    label: "Home",
    href: "/dashboard",
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Stats",
    href: "/stats",
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Buddy",
    href: "/buddy",
    icon: (color: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/95 to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-around py-3 pb-5 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} className="relative flex flex-col items-center gap-1.5 px-4">
              <motion.div
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {tab.icon(isActive ? "#B8FF57" : "rgba(255,255,255,0.2)")}
              </motion.div>
              <span
                className="text-[10px] tracking-[0.08em] uppercase font-medium"
                style={{ color: isActive ? "#B8FF57" : "rgba(255,255,255,0.2)" }}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#B8FF57]"
                  layoutId="nav-dot"
                  style={{ boxShadow: "0 0 8px #B8FF57, 0 0 20px rgba(184,255,87,0.3)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
            </Link>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex flex-col items-center gap-1.5 px-4"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="text-[10px] tracking-[0.08em] uppercase font-medium text-[rgba(255,255,255,0.2)]">
            Exit
          </span>
        </button>
      </div>
    </nav>
  )
}
