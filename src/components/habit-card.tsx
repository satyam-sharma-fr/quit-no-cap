"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  const [optimisticStatus, setOptimisticStatus] = useState<"clean" | "slip" | null>(habit.today_status)
  const [cravingOpen, setCravingOpen] = useState(false)
  const [cravingLoading, setCravingLoading] = useState(false)

  const effectiveStatus = optimisticStatus ?? habit.today_status
  const percentage = habit.total_days > 0 ? Math.round((habit.clean_days / habit.total_days) * 100) : 0
  const moneySaved = habit.type === "quit" && habit.cost_per_unit > 0 ? (habit.clean_days * habit.cost_per_unit).toFixed(2) : null

  async function checkIn(status: "clean" | "slip") {
    const prev = optimisticStatus
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
      setOptimisticStatus(prev)
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
    } finally {
      setCravingLoading(false)
      setCravingOpen(false)
    }
  }

  return (
    <>
      <motion.div
        className="glass rounded-2xl p-6 gradient-border glass-hover transition-all duration-300"
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#F0EDE6]">
              {habit.name}
            </h3>
            <div className="mt-2">
              {habit.type === "quit" ? (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono font-light tracking-[0.05em] bg-[rgba(255,77,106,0.08)] text-[#FF4D6A] border-[0.5px] border-[rgba(255,77,106,0.15)]">
                  QUIT
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono font-light tracking-[0.05em] bg-[rgba(184,255,87,0.08)] text-[#B8FF57] border-[0.5px] border-[rgba(184,255,87,0.15)]">
                  BUILD
                </span>
              )}
            </div>
          </div>
          {habit.type === "quit" && (
            <motion.button
              onClick={() => setCravingOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[rgba(255,184,77,0.08)] text-[#FFB84D] text-[12px] px-3 py-1.5 border-[0.5px] border-[rgba(255,184,77,0.15)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFB84D" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c-4.97 0-9-2.69-9-6v-2c0-4 4-7 4-12 0 0 3 2 3 6 0-4 3-7 5-8 0 0 1 3 1 6s2-4 2-4c2 3 3 6 3 8v2c0 3.31-4.03 6-9 6z" />
              </svg>
              Craving
            </motion.button>
          )}
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[32px] font-light text-[#F0EDE6]">{habit.clean_days}</span>
              <span className="text-[14px] text-[rgba(255,255,255,0.2)]">/ {habit.total_days} days</span>
            </div>
            <span className="font-mono text-[14px] font-light bg-gradient-to-r from-[#B8FF57] to-[#57FFD1] bg-clip-text text-transparent">{percentage}%</span>
          </div>
          <div className="mt-3">
            <Progress value={percentage} />
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 flex gap-5">
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span className="text-[12px] text-[rgba(255,255,255,0.25)]">
              <span className="font-mono text-[rgba(255,255,255,0.4)]">{habit.clean_days}</span> streak
            </span>
          </div>
          {moneySaved && (
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <span className="text-[12px] text-[#57FFD1]">
                <span className="font-mono">${moneySaved}</span> saved
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-5">
          <AnimatePresence mode="wait">
            {effectiveStatus ? (
              <motion.div
                key="status"
                className="text-center py-3 rounded-xl glass"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <span className={`text-[14px] font-medium ${effectiveStatus === "clean" ? "text-[#B8FF57]" : "text-[#FF4D6A]"}`}>
                  {effectiveStatus === "clean" ? "Checked in clean today" : "Slip logged today"}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="buttons"
                className="grid grid-cols-2 gap-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.button
                  onClick={() => checkIn("clean")}
                  className="h-[48px] rounded-xl text-[14px] font-medium flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(184,255,87,0.1), rgba(87,255,209,0.06))',
                    border: '0.5px solid rgba(184,255,87,0.2)',
                    color: '#B8FF57',
                  }}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(184,255,87,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8FF57" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Clean
                </motion.button>
                <motion.button
                  onClick={() => checkIn("slip")}
                  className="h-[48px] rounded-xl text-[14px] font-medium flex items-center justify-center gap-2"
                  style={{
                    background: 'rgba(255,77,106,0.06)',
                    border: '0.5px solid rgba(255,77,106,0.15)',
                    color: '#FF4D6A',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4D6A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Slip
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Craving Dialog */}
      <Dialog open={cravingOpen} onOpenChange={setCravingOpen}>
        <DialogContent className="bg-[#141419] border-[0.5px] border-[rgba(255,255,255,0.07)] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#F0EDE6]">How strong?</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                disabled={cravingLoading}
                onClick={() => logCraving(n)}
                className="flex-1 h-[50px] rounded-xl glass font-mono text-[18px] font-light text-[#FFB84D] disabled:opacity-50"
                whileHover={{ scale: 1.08, background: "rgba(255,184,77,0.1)" }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {n}
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
