"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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

      toast.success("Habit created! Let's go 💪")
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
      >
        <Plus className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a new habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">What habit?</Label>
            <Input
              id="habit-name"
              placeholder="e.g. Smoking, Exercise, Junk Food..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "quit" ? "default" : "outline"}
                className={
                  type === "quit"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : ""
                }
                onClick={() => setType("quit")}
              >
                Quit Bad Habit
              </Button>
              <Button
                type="button"
                variant={type === "build" ? "default" : "outline"}
                className={
                  type === "build"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : ""
                }
                onClick={() => setType("build")}
              >
                Build Good Habit
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Start date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {type === "quit" && (
            <div className="space-y-2">
              <Label htmlFor="cost">Cost per unit ($) — optional</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 0.50 per cigarette"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting ? "Creating..." : "Start Tracking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
