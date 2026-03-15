"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
      toast.success("Craving logged. You resisted — that's strength.")
      setCravingOpen(false)
    } catch {
      toast.error("Failed to log craving")
    } finally {
      setCravingLoading(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden border-l-4 border-l-emerald-500">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-base leading-tight">
                {habit.name}
              </h3>
              <Badge
                variant="secondary"
                className={
                  isQuit
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200"
                }
              >
                {isQuit ? "Quit" : "Build"}
              </Badge>
            </div>
            {isQuit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 text-xs"
                onClick={() => setCravingOpen(true)}
              >
                <Flame className="h-3.5 w-3.5 mr-1" />
                Craving
              </Button>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {habit.clean_days}/{habit.total_days} days{" "}
                {isQuit ? "clean" : "done"}
              </span>
              <span className="font-medium text-emerald-600">{percentage}%</span>
            </div>
            <Progress
              value={percentage}
              className="h-2 [&>div]:bg-emerald-500"
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                {habit.clean_days > 0
                  ? `${habit.clean_days} day streak`
                  : "Start your streak"}
              </span>
            </div>
            {moneySaved && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                <span>${moneySaved} saved</span>
              </div>
            )}
          </div>

          {/* Today's check-in */}
          <div className="pt-1">
            {habit.today_status ? (
              <div
                className={`text-center text-sm font-medium py-2 rounded-md ${
                  habit.today_status === "clean"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
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
                <Button
                  size="sm"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleCheckIn("clean")}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {isQuit ? "Clean" : "Done"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleCheckIn("slip")}
                >
                  <X className="h-4 w-4 mr-1" />
                  {isQuit ? "Slip" : "Missed"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Craving dialog */}
      <Dialog open={cravingOpen} onOpenChange={setCravingOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>How strong is the craving?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-between gap-2 py-4">
            {[1, 2, 3, 4, 5].map((level) => (
              <Button
                key={level}
                variant="outline"
                disabled={cravingLoading}
                className="flex-1 h-12 text-lg font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                onClick={() => handleCraving(level)}
              >
                {level}
              </Button>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            1 = mild urge &middot; 5 = extremely strong
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
