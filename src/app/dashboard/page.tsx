"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { HabitCard } from "@/components/habit-card"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { Crosshair } from "lucide-react"
import { toast } from "sonner"
import type { Habit } from "@/lib/types"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitsLoading, setHabitsLoading] = useState(true)

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits")
      if (res.ok) {
        const data = await res.json()
        setHabits(data.habits || [])
      }
    } catch {
      toast.error("Failed to load habits")
    } finally {
      setHabitsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) fetchHabits()
  }, [user, fetchHabits])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] pb-24">
      <div className="mx-auto max-w-md px-4 pt-6 pb-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              YOUR HABITS
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Hey <span className="text-zinc-300">{user.username}</span>, keep going.
            </p>
          </div>
          <AddHabitDialog onCreated={fetchHabits} />
        </div>

        {/* Habits list */}
        {habitsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-20 space-y-5 animate-fade-up stagger-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <Crosshair className="h-7 w-7 text-zinc-600" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-zinc-300">No habits yet</p>
              <p className="text-sm text-zinc-600">
                Tap the <span className="text-red-400">+</span> button to add your first habit
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit, i) => (
              <div key={habit.id} className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                <HabitCard habit={habit} onUpdate={fetchHabits} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
