"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { HabitCard } from "@/components/habit-card"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { Leaf } from "lucide-react"
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      <div className="mx-auto max-w-md px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Your Habits</h1>
            <p className="text-sm text-muted-foreground">
              Hey {user.username}, keep going.
            </p>
          </div>
          <AddHabitDialog onCreated={fetchHabits} />
        </div>

        {/* Habits list */}
        {habitsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <Leaf className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">No habits yet</p>
              <p className="text-sm text-muted-foreground">
                Tap the + button to add your first habit
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onUpdate={fetchHabits} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
