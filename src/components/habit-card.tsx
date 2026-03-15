"use client"

import { useState } from "react"
import type { Habit } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function HabitCard({
  habit,
  onUpdate,
}: {
  habit: Habit
  onUpdate: () => void
}) {
  const [optimisticStatus, setOptimisticStatus] = useState<
    "clean" | "slip" | null
  >(habit.today_status)
  const [cravingOpen, setCravingOpen] = useState(false)
  const [cravingLoading, setCravingLoading] = useState(false)

  const effectiveStatus = optimisticStatus ?? habit.today_status
  const percentage =
    habit.total_days > 0
      ? Math.round((habit.clean_days / habit.total_days) * 100)
      : 0
  const streak = habit.clean_days
  const moneySaved =
    habit.type === "quit" && habit.cost_per_unit > 0
      ? (habit.clean_days * habit.cost_per_unit).toFixed(2)
      : null

  async function checkIn(status: "clean" | "slip") {
    const prevStatus = optimisticStatus
    setOptimisticStatus(status)
    try {
      const res = await fetch(`/api/habits/${habit.id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      onUpdate()
    } catch {
      setOptimisticStatus(prevStatus)
    }
  }

  async function logCraving(intensity: number) {
    setCravingLoading(true)
    try {
      await fetch("/api/cravings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id: habit.id, intensity }),
      })
    } catch {
      // silent
    } finally {
      setCravingLoading(false)
      setCravingOpen(false)
    }
  }

  return (
    <>
      <div className="bg-[#151518] rounded-2xl p-6 border-[0.5px] border-[rgba(255,255,255,0.06)]">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[20px] font-medium tracking-[-0.02em] text-[#E8E6E1]">
              {habit.name}
            </h3>
            <div className="mt-2">
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
          </div>
          {habit.type === "quit" && (
            <button
              onClick={() => setCravingOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[rgba(245,166,35,0.10)] text-[#F5A623] text-[12px] px-3 py-1.5 active:scale-[0.97] transition-transform duration-100"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F5A623"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c-4.97 0-9-2.69-9-6v-2c0-4 4-7 4-12 0 0 3 2 3 6 0-4 3-7 5-8 0 0 1 3 1 6s2-4 2-4c2 3 3 6 3 8v2c0 3.31-4.03 6-9 6z" />
              </svg>
              Craving
            </button>
          )}
        </div>

        {/* Progress section */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[28px] font-light text-[#E8E6E1]">
                {habit.clean_days}
              </span>
              <span className="text-[14px] text-[rgba(255,255,255,0.25)]">
                / {habit.total_days} days
              </span>
            </div>
            <span className="font-mono text-[13px] text-[rgba(255,255,255,0.25)]">
              {percentage}%
            </span>
          </div>
          <div className="mt-2">
            <Progress value={percentage} />
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-3 flex gap-5">
          <div className="flex items-center gap-1.5">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="text-[12px] text-[rgba(255,255,255,0.25)]">
              <span className="font-mono">{streak}</span> streak
            </span>
          </div>
          {moneySaved && (
            <div className="flex items-center gap-1.5">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <span className="text-[12px] text-[rgba(255,255,255,0.25)]">
                <span className="font-mono">${moneySaved}</span> saved
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4">
          {effectiveStatus ? (
            <div className="text-center py-3">
              <span
                className={`text-[14px] font-mono ${
                  effectiveStatus === "clean"
                    ? "text-[#C8F56E]"
                    : "text-[#F45B69]"
                }`}
              >
                {effectiveStatus === "clean"
                  ? "Checked in clean today"
                  : "Slip logged today"}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => checkIn("clean")}
                className="h-[46px] rounded-xl bg-[rgba(200,245,110,0.08)] border-[0.5px] border-[rgba(200,245,110,0.15)] text-[#C8F56E] text-[14px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform duration-100"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C8F56E"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Clean
              </button>
              <button
                onClick={() => checkIn("slip")}
                className="h-[46px] rounded-xl bg-[rgba(244,91,105,0.06)] border-[0.5px] border-[rgba(244,91,105,0.10)] text-[#F45B69] text-[14px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform duration-100"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F45B69"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Slip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Craving Dialog */}
      <Dialog open={cravingOpen} onOpenChange={setCravingOpen}>
        <DialogContent className="bg-[#151518] border-[0.5px] border-[rgba(255,255,255,0.06)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-medium text-[#E8E6E1]">
              Log Craving
            </DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-[rgba(255,255,255,0.45)] mt-1">
            How intense is this craving?
          </p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                disabled={cravingLoading}
                onClick={() => logCraving(n)}
                className="flex-1 h-[46px] rounded-xl bg-[rgba(245,166,35,0.10)] text-[#F5A623] font-mono text-[16px] active:scale-[0.97] transition-transform duration-100 disabled:opacity-50"
              >
                {n}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
