"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Progress } from "@/components/ui/progress"
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

  const weeks: typeof cells[] = []
  let currentWeek: typeof cells = []
  cells.forEach((cell, i) => {
    if (i === 0) {
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
    <div className="flex gap-[2px] overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[2px]">
          {week.map((cell, ci) => (
            <div
              key={ci}
              className={`h-[10px] w-[10px] rounded-[2px] transition-colors ${
                !cell.date
                  ? "bg-transparent"
                  : cell.status === "clean"
                    ? "bg-emerald-500/70"
                    : cell.status === "slip"
                      ? "bg-red-500/70"
                      : "bg-white/[0.04]"
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

  let best = 0
  let streak = 0

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

  let current = 0
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
      <div className="flex items-center justify-center py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-20 space-y-3 animate-fade-up">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <Calendar className="h-6 w-6 text-zinc-600" />
        </div>
        <p className="text-zinc-500">No habits to show stats for yet</p>
      </div>
    )
  }

  const buddy = buddyData?.buddy
  const buddyHabits = buddyData?.habits || []

  return (
    <div className="space-y-4">
      {habits.map((habit, idx) => {
        const habitCheckIns = checkIns.get(habit.id) || []
        const streaks = computeStreaks(habitCheckIns)
        const last30 = last30Clean(habitCheckIns)
        const isQuit = habit.type === "quit"
        const moneySaved =
          isQuit && habit.cost_per_unit > 0
            ? (habit.clean_days * habit.cost_per_unit).toFixed(2)
            : null

        return (
          <div key={habit.id} className={`glass-card rounded-2xl p-4 space-y-4 animate-fade-up stagger-${Math.min(idx + 1, 6)}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{habit.name}</h3>
              <span
                className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  isQuit
                    ? "text-red-400 bg-red-500/10 border-red-500/15"
                    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/15"
                }`}
              >
                {isQuit ? "Quit" : "Build"}
              </span>
            </div>

            {/* Heatmap */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                Last 90 days
              </p>
              <CalendarHeatmap checkIns={habitCheckIns} />
              <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-[1px] bg-emerald-500/70" />
                  {isQuit ? "Clean" : "Done"}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-[1px] bg-red-500/70" />
                  {isQuit ? "Slip" : "Missed"}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-[1px] bg-white/[0.04]" />
                  No data
                </div>
              </div>
            </div>

            <div className="h-px bg-white/[0.04]" />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Last 30 days</p>
                <p className="text-xl font-bold text-white font-mono">
                  {last30}
                  <span className="text-sm font-normal text-zinc-600">/30</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Current streak</p>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-400/80" />
                  <p className="text-xl font-bold text-white font-mono">{streaks.current}<span className="text-sm font-normal text-zinc-600">d</span></p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Best streak</p>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-red-400/60" />
                  <p className="text-xl font-bold text-white font-mono">{streaks.best}<span className="text-sm font-normal text-zinc-600">d</span></p>
                </div>
              </div>
              {moneySaved && (
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Money saved</p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-400/60" />
                    <p className="text-xl font-bold text-emerald-400 font-mono">${moneySaved}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Overall progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Overall</span>
                <span className="font-mono text-red-400">
                  {habit.total_days > 0 ? Math.round((habit.clean_days / habit.total_days) * 100) : 0}%
                </span>
              </div>
              <Progress value={habit.total_days > 0 ? Math.round((habit.clean_days / habit.total_days) * 100) : 0} />
            </div>
          </div>
        )
      })}

      {/* Buddy comparison */}
      {buddy && buddyHabits.length > 0 && (
        <div className="space-y-3 animate-fade-up stagger-4">
          <div className="h-px bg-white/[0.04]" />
          <h2 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            vs {buddy.username}
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
              <div key={bh.id} className="glass-card rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-white">{bh.name}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {bh.type === "quit" ? "Quit" : "Build"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {myPct !== null && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">You</p>
                      <p className="text-2xl font-bold text-red-400 font-mono">{myPct}%</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{buddy.username}</p>
                    <p className="text-2xl font-bold text-zinc-300 font-mono">{bPct}%</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
