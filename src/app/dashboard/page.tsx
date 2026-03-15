"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import useSWR from "swr"
import { HabitCard } from "@/components/habit-card"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { usePullRefresh } from "@/hooks/use-pull-refresh"
import { fetcher } from "@/lib/fetcher"
import type { Habit } from "@/lib/types"

export default function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR<{ habits: Habit[] }>(
    session ? "/api/habits" : null,
    fetcher
  )

  const handleRefresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  const { pulling, pullDistance } = usePullRefresh(handleRefresh)

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

  const habits = data?.habits || []
  const displayName = session.user?.name?.split(" ")[0] || "there"

  return (
    <div className="min-h-screen bg-[#0C0C0E] pb-24">
      {/* Pull-to-refresh indicator */}
      {pulling && pullDistance > 10 && (
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-[#C8F56E] border-t-transparent"
            style={{ opacity: Math.min(pullDistance / 60, 1) }}
          />
        </div>
      )}

      <div className="mx-auto max-w-md px-7 pt-7 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h1 className="text-[13px] uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)]">
              YOUR HABITS
            </h1>
            <p className="text-[22px] font-light text-[#E8E6E1] mt-1">
              Keep going, <span className="font-medium">{displayName}</span>
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[rgba(200,245,110,0.08)] border-[0.5px] border-[rgba(200,245,110,0.15)] text-[#C8F56E] active:scale-[0.97] transition-transform duration-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8F56E" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <AddHabitDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => mutate()} />
        </div>

        {/* Habits list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-[#C8F56E] border-t-transparent" />
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-20 animate-fade-up stagger-2">
            <p className="text-[rgba(255,255,255,0.45)] text-sm">
              No habits yet. Tap <span className="text-[#C8F56E]">+</span> to add one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit, i) => (
              <div key={habit.id} className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                <HabitCard habit={habit} onUpdate={() => mutate()} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
