"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, DollarSign, Calendar, Flame } from "lucide-react"
import { toast } from "sonner"
import type { Habit, CheckIn, BuddyData } from "@/lib/types"

function CalendarHeatmap({ checkIns }: { checkIns: CheckIn[] }) {
  const cells = useMemo(() => {
    const today = new Date()
    const grid: { date: string; status: "clean" | "slip" | null; dayOfWeek: number }[] = []
    const checkInMap = new Map(checkIns.map((c) => [c.date, c.status]))

    for (let i = 89; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      grid.push({
        date: dateStr,
        status: checkInMap.get(dateStr) || null,
        dayOfWeek: d.getDay(),
      })
    }
    return grid
  }, [checkIns])

  // Group into weeks (columns)
  const weeks: typeof cells[] = []
  let currentWeek: typeof cells = []
  cells.forEach((cell, i) => {
    if (i === 0) {
      // Pad the first week
      for (let d = 0; d < cell.dayOfWeek; d++) {
        currentWeek.push({ date: "", status: null, dayOfWeek: d })
      }
    }
    currentWeek.push(cell)
    if (cell.dayOfWeek === 6 || i === cells.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((cell, ci) => (
            <div
              key={ci}
              className={`h-3 w-3 rounded-sm ${
                !cell.date
                  ? "bg-transparent"
                  : cell.status === "clean"
                    ? "bg-emerald-400"
                    : cell.status === "slip"
                      ? "bg-red-400"
                      : "bg-gray-100"
              }`}
              title={cell.date ? `${cell.date}: ${cell.status || "no data"}` : ""}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function computeStreaks(checkIns: CheckIn[]) {
  if (checkIns.length === 0) return { current: 0, best: 0 }

  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let current = 0
  let best = 0
  let streak = 0

  // For best streak, go chronologically
  const chronological = [...checkIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  for (const ci of chronological) {
    if (ci.status === "clean") {
      streak++
      best = Math.max(best, streak)
    } else {
      streak = 0
    }
  }

  // Current streak from most recent
  for (const ci of sorted) {
    if (ci.status === "clean") {
      current++
    } else {
      break
    }
  }

  return { current, best }
}

function last30Clean(checkIns: CheckIn[]) {
  const today = new Date()
  const thirtyAgo = new Date(today)
  thirtyAgo.setDate(thirtyAgo.getDate() - 30)
  return checkIns.filter(
    (c) =>
      c.status === "clean" &&
      new Date(c.date) >= thirtyAgo &&
      new Date(c.date) <= today
  ).length
}

export function StatsView() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [checkIns, setCheckIns] = useState<Map<string, CheckIn[]>>(new Map())
  const [buddyData, setBuddyData] = useState<BuddyData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, buddyRes] = await Promise.all([
        fetch("/api/habits"),
        fetch("/api/buddy"),
      ])

      if (habitsRes.ok) {
        const habitsJson = await habitsRes.json()
        setHabits(habitsJson.habits || [])

        // Fetch check-ins per habit
        const ciMap = new Map<string, CheckIn[]>()
        await Promise.all(
          (habitsJson.habits || []).map(async (h: Habit) => {
            const res = await fetch(`/api/habits/${h.id}/check-ins`)
            if (res.ok) {
              const json = await res.json()
              ciMap.set(h.id, json.check_ins || [])
            }
          })
        )
        setCheckIns(ciMap)
      }

      if (buddyRes.ok) {
        const buddyJson = await buddyRes.json()
        setBuddyData(buddyJson)
      }
    } catch {
      toast.error("Failed to load stats")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading stats...
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-20 space-y-2">
        <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="text-muted-foreground">No habits to show stats for yet</p>
      </div>
    )
  }

  const buddy = buddyData?.buddy
  const buddyHabits = buddyData?.habits || []

  return (
    <div className="space-y-6">
      {habits.map((habit) => {
        const habitCheckIns = checkIns.get(habit.id) || []
        const streaks = computeStreaks(habitCheckIns)
        const last30 = last30Clean(habitCheckIns)
        const isQuit = habit.type === "quit"
        const moneySaved =
          isQuit && habit.cost_per_unit > 0
            ? (habit.clean_days * habit.cost_per_unit).toFixed(2)
            : null

        return (
          <Card key={habit.id}>
            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{habit.name}</h3>
                <Badge
                  variant="secondary"
                  className={
                    isQuit
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }
                >
                  {isQuit ? "Quit" : "Build"}
                </Badge>
              </div>

              {/* Heatmap */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Last 90 days
                </p>
                <CalendarHeatmap checkIns={habitCheckIns} />
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
                    {isQuit ? "Clean" : "Done"}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-sm bg-red-400" />
                    {isQuit ? "Slip" : "Missed"}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-sm bg-gray-100" />
                    No data
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {last30}
                    <span className="text-sm font-normal text-muted-foreground">
                      /30
                    </span>
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Current streak</p>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <p className="text-lg font-bold">{streaks.current} days</p>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Best streak</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <p className="text-lg font-bold">{streaks.best} days</p>
                  </div>
                </div>
                {moneySaved && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">Money saved</p>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <p className="text-lg font-bold">${moneySaved}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Buddy comparison */}
      {buddy && buddyHabits.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <h2 className="font-semibold text-base">
            vs {buddy.username} (buddy)
          </h2>
          {buddyHabits.map((bh) => {
            const bPct =
              bh.total_days > 0
                ? Math.round((bh.clean_days / bh.total_days) * 100)
                : 0
            const matchingHabit = habits.find(
              (h) => h.name.toLowerCase() === bh.name.toLowerCase()
            )
            const myPct = matchingHabit
              ? matchingHabit.total_days > 0
                ? Math.round(
                    (matchingHabit.clean_days / matchingHabit.total_days) * 100
                  )
                : 0
              : null

            return (
              <Card key={bh.id} className="border-l-4 border-l-blue-300">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{bh.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {bh.type === "quit" ? "Quit" : "Build"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {myPct !== null && (
                      <div>
                        <p className="text-xs text-muted-foreground">You</p>
                        <p className="font-bold text-emerald-600">{myPct}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {buddy.username}
                      </p>
                      <p className="font-bold text-blue-600">{bPct}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
