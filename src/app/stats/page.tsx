"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { StatsView } from "@/components/stats-view"

export default function StatsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/")
    }
  }, [status, router])

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0C0C0E]">
        <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-[#C8F56E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0C0E] pb-24">
      <div className="mx-auto max-w-md px-7 pt-7 space-y-6">
        <h1 className="text-[13px] uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)] animate-fade-up">
          STATS
        </h1>
        <StatsView />
      </div>
    </div>
  )
}
