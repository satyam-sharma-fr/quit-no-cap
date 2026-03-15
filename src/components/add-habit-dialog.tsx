"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function AddHabitDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"quit" | "build">("quit")
  const [costPerUnit, setCostPerUnit] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          cost_per_unit: costPerUnit ? parseFloat(costPerUnit) : 0,
        }),
      })
      if (!res.ok) throw new Error()
      setName("")
      setCostPerUnit("")
      setType("quit")
      onOpenChange(false)
      onCreated()
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151518] border-[0.5px] border-[rgba(255,255,255,0.06)] max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-medium text-[#E8E6E1]">
            New Habit
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div>
            <label className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)] block mb-2">
              Habit Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smoking, Exercise"
              className="bg-[#1C1C20] border-[0.5px] border-[rgba(255,255,255,0.06)] text-[#E8E6E1] h-11 rounded-xl placeholder:text-[rgba(255,255,255,0.25)]"
            />
          </div>

          <div>
            <label className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)] block mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setType("quit")}
                className={`h-11 rounded-xl text-[14px] transition-transform duration-100 active:scale-[0.97] border-[0.5px] ${
                  type === "quit"
                    ? "bg-[rgba(244,91,105,0.06)] border-[rgba(244,91,105,0.10)] text-[#F45B69]"
                    : "bg-[#1C1C20] border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.45)]"
                }`}
              >
                Quit
              </button>
              <button
                type="button"
                onClick={() => setType("build")}
                className={`h-11 rounded-xl text-[14px] transition-transform duration-100 active:scale-[0.97] border-[0.5px] ${
                  type === "build"
                    ? "bg-[rgba(200,245,110,0.08)] border-[rgba(200,245,110,0.15)] text-[#C8F56E]"
                    : "bg-[#1C1C20] border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.45)]"
                }`}
              >
                Build
              </button>
            </div>
          </div>

          {type === "quit" && (
            <div>
              <label className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgba(255,255,255,0.25)] block mb-2">
                Cost per day ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                placeholder="0.00"
                className="bg-[#1C1C20] border-[0.5px] border-[rgba(255,255,255,0.06)] text-[#E8E6E1] h-11 rounded-xl placeholder:text-[rgba(255,255,255,0.25)]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full h-[46px] rounded-xl bg-[#C8F56E] text-[#0C0C0E] text-[14px] font-medium active:scale-[0.97] transition-transform duration-100 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Habit"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
