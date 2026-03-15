"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddHabitDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"quit" | "build">("quit")
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [costPerUnit, setCostPerUnit] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setName("")
    setType("quit")
    setStartDate(new Date().toISOString().split("T")[0])
    setCostPerUnit("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Give your habit a name")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          start_date: startDate,
          cost_per_unit: type === "quit" ? parseFloat(costPerUnit) || 0 : 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create habit")
      }

      toast.success("Habit created!")
      reset()
      setOpen(false)
      onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 transition-all duration-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] active:scale-95"
      >
        <Plus className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#111113] border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-white">New habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="habit-name" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
              What habit?
            </Label>
            <Input
              id="habit-name"
              placeholder="e.g. Smoking, Exercise, Junk Food..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="bg-white/[0.04] border-white/[0.06] text-white placeholder:text-zinc-600 h-11 rounded-xl focus:border-red-500/40 focus:ring-red-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`h-11 rounded-xl text-xs font-semibold transition-all duration-200 border active:scale-[0.97] ${
                  type === "quit"
                    ? "bg-red-500/15 text-red-400 border-red-500/30"
                    : "bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:bg-white/[0.05]"
                }`}
                onClick={() => setType("quit")}
              >
                Quit Bad Habit
              </button>
              <button
                type="button"
                className={`h-11 rounded-xl text-xs font-semibold transition-all duration-200 border active:scale-[0.97] ${
                  type === "build"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-white/[0.03] text-zinc-500 border-white/[0.06] hover:bg-white/[0.05]"
                }`}
                onClick={() => setType("build")}
              >
                Build Good Habit
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
              Start date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/[0.04] border-white/[0.06] text-white h-11 rounded-xl focus:border-red-500/40 focus:ring-red-500/20"
            />
          </div>

          {type === "quit" && (
            <div className="space-y-2">
              <Label htmlFor="cost" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Cost per unit ($)
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 0.50 per cigarette"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="bg-white/[0.04] border-white/[0.06] text-white placeholder:text-zinc-600 h-11 rounded-xl focus:border-red-500/40 focus:ring-red-500/20"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98]"
          >
            {submitting ? "Creating..." : "Start Tracking"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
