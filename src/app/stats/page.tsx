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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <div className="mx-auto max-w-md px-4 py-6 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Stats</h1>
        <StatsView />
      </div>
    </div>
  )
}
