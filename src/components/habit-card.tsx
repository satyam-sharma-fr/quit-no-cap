"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Check, X, Flame, DollarSign, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import type { Habit } from "@/lib/types"

export function HabitCard({
  habit,
  onUpdate,
}: {
  habit: Habit
  onUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [cravingOpen, setCravingOpen] = useState(false)
  const [cravingLoading, setCravingLoading] = useState(false)

  const isQuit = habit.type === "quit"
  const percentage =
    habit.total_days > 0
      ? Math.round((habit.clean_days / habit.total_days) * 100)
      : 0
  const moneySaved =
    isQuit && habit.cost_per_unit > 0
      ? (habit.clean_days * habit.cost_per_unit).toFixed(2)
      : null

  const handleCheckIn = async (status: "clean" | "slip") => {
    setLoading(true)
    try {
      const res = await fetch(`/api/habits/${habit.id}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Check-in failed")
      }
      const label = isQuit
        ? status === "clean"
          ? "Clean day logged!"
          : "Slip logged. Tomorrow's a new day."
        : status === "clean"
          ? "Done! Nice work."
          : "Missed. You'll get it next time."
      toast.success(label)
      onUpdate()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleCraving = async (intensity: number) => {
    setCravingLoading(true)
    try {
      const res = await fetch(`/api/cravings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habit_id: habit.id, intensity }),
      })
      if (!res.ok) throw new Error("Failed to log craving")
      toast.success("Craving logged. You resisted.")
      setCravingOpen(false)
    } catch {
      toast.error("Failed to log craving")
    } finally {
      setCravingLoading(false)
    }
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-4 space-y-3 group">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-[15px] text-white leading-tight">
              {habit.name}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-md ${
                isQuit
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {isQuit ? "Quit" : "Build"}
            </span>
          </div>
          {isQuit && (
            <button
              onClick={() => setCravingOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-orange-400/80 hover:text-orange-300 bg-orange-500/[0.06] hover:bg-orange-500/10 border border-orange-500/10 rounded-lg transition-all"
            >
              <Flame className="h-3 w-3" />
              Craving
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 text-xs">
              <span className="text-zinc-300 font-mono font-medium">{habit.clean_days}</span>
              <span className="text-zinc-600">/{habit.total_days}</span>
              {" "}days {isQuit ? "clean" : "done"}
            </span>
            <span className="font-mono font-bold text-red-400 text-sm">{percentage}%</span>
          </div>
          <Progress value={percentage} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-red-400/60" />
            <span>
              {habit.clean_days > 0
                ? `${habit.clean_days}d streak`
                : "No streak"}
            </span>
          </div>
          {moneySaved && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-emerald-400/60" />
              <span className="text-emerald-400/80">${moneySaved} saved</span>
            </div>
          )}
        </div>

        {/* Today's check-in */}
        <div className="pt-1">
          {habit.today_status ? (
            <div
              className={`text-center text-xs font-medium py-2.5 rounded-xl border ${
                habit.today_status === "clean"
                  ? "bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/15"
                  : "bg-red-500/[0.06] text-red-400 border-red-500/15"
              }`}
            >
              {habit.today_status === "clean"
                ? isQuit
                  ? "Clean today"
                  : "Done today"
                : isQuit
                  ? "Slip today"
                  : "Missed today"}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={loading}
                className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/15 hover:border-emerald-500/30 transition-all duration-200 disabled:opacity-50 active:scale-[0.97]"
                onClick={() => handleCheckIn("clean")}
              >
                <Check className="h-3.5 w-3.5" />
                {isQuit ? "Clean" : "Done"}
              </button>
              <button
                disabled={loading}
                className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/15 hover:border-red-500/30 transition-all duration-200 disabled:opacity-50 active:scale-[0.97]"
                onClick={() => handleCheckIn("slip")}
              >
                <X className="h-3.5 w-3.5" />
                {isQuit ? "Slip" : "Missed"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Craving dialog */}
      <Dialog open={cravingOpen} onOpenChange={setCravingOpen}>
        <DialogContent className="sm:max-w-xs bg-[#111113] border-white/[0.06]">
          <DialogHeader>
            <DialogTitle className="text-white text-center">How strong?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-between gap-2 py-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                disabled={cravingLoading}
                className="flex-1 h-14 text-lg font-bold rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20 transition-all duration-200 disabled:opacity-50 active:scale-95"
                onClick={() => handleCraving(level)}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-center text-zinc-600 uppercase tracking-wider">
            1 = mild &middot; 5 = overwhelming
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
