"use client"

import useSWR from "swr"
import type { Habit, CheckIn, BuddyData } from "@/lib/types"
import { Progress } from "@/components/ui/progress"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function HabitStats({ habit }: { habit: Habit }) {
  const { data: checkInsData } = useSWR<{ check_ins: CheckIn[] }>(
    `/api/habits/${habit.id}/check-ins`,
    fetcher
  )

  const checkIns = checkInsData?.check_ins || []

  const percentage =
    habit.total_days > 0
      ? Math.round((habit.clean_days / habit.total_days) * 100)
      : 0

  // Build 90-day grid
  const today = new Date()
  const grid: ("clean" | "slip" | null)[] = []
  const checkInMap = new Map(checkIns.map((c) => [c.date, c.status]))
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    grid.push(checkInMap.get(dateStr) || null)
  }

  // Last 30 days clean count
  const last30 = grid.slice(-30)
  const last30Clean = last30.filter((s) => s === "clean").length

  // Current streak
  let currentStreak = 0
  if (checkIns.length > 0) {
    const sorted = [...checkIns].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    for (const ci of sorted) {
      if (ci.status === "clean") currentStreak++
      else break
    }
  }

  // Best streak
  let bestStreak = 0
  let tempStreak = 0
  if (checkIns.length > 0) {
    const sorted = [...checkIns].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    for (const ci of sorted) {
      if (ci.status === "clean") {
        tempStreak++
        if (tempStreak > bestStreak) bestStreak = tempStreak
      } else {
        tempStreak = 0
      }
    }
  }

  const moneySaved =
    habit.type === "quit" && habit.cost_per_unit > 0
      ? (habit.clean_days * habit.cost_per_unit).toFixed(2)
      : null

  return (
    <div className="bg-[#151518] rounded-2xl p-6 border-[0.5px] border-[rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h3 className="text-[22px] font-light text-[#E8E6E1]">{habit.name}</h3>
        {habit.type === "quit" ? (
          <span className="inline-block rounded-[20px] px-2.5 py-0.5 bg-[rgba(244,91,105,0.06)] text-[#F45B69] border-[0.5px] border-[rgba(244,91,105,0.10)] font-mono text-[11px] font-light tracking-[0.05em]">
            QUIT
          </span>
        ) : (
          <span className="inline-block rounded-[20px] px-2.5 py-0.5 bg-[rgba(200,245,110,0.08)] text-[#C8F56E] border-[0.5px] border-[rgba(200,245,110,0.15)] font-mono text-[11px] font-light tracking-[0.05em]">
            BUILD
          </span>
        )}
      </div>

      {/* 90-day contribution grid */}
      <div className="mt-6">
        <span className="text-[13px] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)]">
          Last 90 Days
        </span>
        <div className="flex flex-wrap gap-[3px] mt-3">
          {grid.map((status, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{
                width: 10,
                height: 10,
                backgroundColor:
                  status === "clean"
                    ? "rgba(200,245,110,0.85)"
                    : status === "slip"
                      ? "rgba(244,91,105,0.70)"
                      : "#1C1C20",
              }}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex gap-4 mt-3">
          {[
            { label: "Clean", color: "rgba(200,245,110,0.85)" },
            { label: "Slip", color: "rgba(244,91,105,0.70)" },
            { label: "No data", color: "#1C1C20" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: item.color,
                }}
              />
              <span className="text-[11px] text-[rgba(255,255,255,0.25)]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2.5 mt-6">
        {/* Last 30 */}
        <div className="bg-[#151518] rounded-xl p-4 border-[0.5px] border-[rgba(255,255,255,0.06)]">
          <span className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)] block">
            Last 30 Days
          </span>
          <div className="mt-2 flex items-baseline">
            <span className="font-mono text-[26px] font-light text-[#E8E6E1]">
              {last30Clean}
            </span>
            <span className="text-[13px] text-[rgba(255,255,255,0.25)]">
              /30
            </span>
          </div>
        </div>

        {/* Current streak */}
        <div className="bg-[#151518] rounded-xl p-4 border-[0.5px] border-[rgba(255,255,255,0.06)]">
          <span className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)] block">
            Current Streak
          </span>
          <div className="mt-2 flex items-baseline">
            <span className="font-mono text-[26px] font-light text-[#C8F56E]">
              {currentStreak}
            </span>
            <span className="text-[13px] text-[rgba(255,255,255,0.25)]">
              d
            </span>
          </div>
        </div>

        {/* Best streak */}
        <div className="bg-[#151518] rounded-xl p-4 border-[0.5px] border-[rgba(255,255,255,0.06)]">
          <span className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)] block">
            Best Streak
          </span>
          <div className="mt-2 flex items-baseline">
            <span className="font-mono text-[26px] font-light text-[#E8E6E1]">
              {bestStreak}
            </span>
            <span className="text-[13px] text-[rgba(255,255,255,0.25)]">
              d
            </span>
          </div>
        </div>

        {/* Money saved */}
        {moneySaved && (
          <div className="bg-[#151518] rounded-xl p-4 border-[0.5px] border-[rgba(255,255,255,0.06)]">
            <span className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)] block">
              Money Saved
            </span>
            <div className="mt-2">
              <span className="font-mono text-[26px] font-light text-[#6EE7B7]">
                ${moneySaved}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Overall progress */}
      <div className="mt-4 bg-[#151518] rounded-xl p-4 border-[0.5px] border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)]">
            Overall
          </span>
          <span className="font-mono text-[13px] text-[rgba(255,255,255,0.25)]">
            {percentage}%
          </span>
        </div>
        <Progress value={percentage} />
      </div>
    </div>
  )
}

function BuddyComparison({ buddyData }: { buddyData: BuddyData }) {
  if (!buddyData.buddy) return null

  return (
    <div className="bg-[#151518] rounded-2xl p-6 border-[0.5px] border-[rgba(255,255,255,0.06)]">
      <span className="text-[13px] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)]">
        Buddy Comparison
      </span>
      <div className="mt-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1C1C20] flex items-center justify-center text-[12px] text-[rgba(255,255,255,0.45)]">
          {buddyData.buddy.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <span className="text-[15px] text-[#E8E6E1]">
          {buddyData.buddy.name}
        </span>
      </div>
      {buddyData.habits.length > 0 ? (
        <div className="mt-4 space-y-3">
          {buddyData.habits.map((h) => {
            const pct =
              h.total_days > 0
                ? Math.round((h.clean_days / h.total_days) * 100)
                : 0
            return (
              <div key={h.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] text-[rgba(255,255,255,0.45)]">
                    {h.name}
                  </span>
                  <span className="font-mono text-[12px] text-[rgba(255,255,255,0.25)]">
                    {pct}%
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-[rgba(255,255,255,0.25)]">
          No habits tracked yet.
        </p>
      )}
    </div>
  )
}

export function StatsView() {
  const { data: habitsData } = useSWR<{ habits: Habit[] }>("/api/habits", fetcher)
  const { data: buddyData } = useSWR<BuddyData>("/api/buddy", fetcher)

  const habits = habitsData?.habits || []

  if (!habitsData) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-[13px] text-[rgba(255,255,255,0.25)]">
          Loading...
        </span>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-[13px] text-[rgba(255,255,255,0.25)]">
          No habits to show stats for.
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <span className="text-[13px] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)]">
        Your Stats
      </span>
      {habits.map((habit) => (
        <HabitStats key={habit.id} habit={habit} />
      ))}
      {buddyData && <BuddyComparison buddyData={buddyData} />}
    </div>
  )
}
