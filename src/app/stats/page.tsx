"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { StatsView } from "@/components/stats-view"

export default function StatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] pb-24">
      <div className="mx-auto max-w-md px-4 pt-6 pb-4 space-y-5">
        <h1 className="text-xl font-bold text-white tracking-tight animate-fade-up">
          STATS
        </h1>
        <StatsView />
      </div>
    </div>
  )
}
