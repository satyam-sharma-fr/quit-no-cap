"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import { HabitCard } from "@/components/habit-card"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { usePullRefresh } from "@/hooks/use-pull-refresh"
import { fetcher } from "@/lib/fetcher"
import type { Habit } from "@/lib/types"

export default function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data, isLoading, mutate } = useSWR<{ habits: Habit[] }>(
    session ? "/api/habits" : null,
    fetcher
  )

  const handleRefresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  const { pulling, pullDistance } = usePullRefresh(handleRefresh)

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/")
  }, [status, router])

  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <motion.div
          className="h-5 w-5 rounded-full border-2 border-[#B8FF57] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    )
  }

  const habits = data?.habits || []
  const displayName = session.user?.name?.split(" ")[0] || "there"

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-24 relative">
      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#B8FF57] opacity-[0.015] blur-[150px] rounded-full" />
        <div className="absolute bottom-1/3 left-0 w-[300px] h-[300px] bg-[#57FFD1] opacity-[0.01] blur-[120px] rounded-full" />
      </div>

      {/* Pull-to-refresh */}
      <AnimatePresence>
        {pulling && pullDistance > 10 && (
          <motion.div
            className="flex justify-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(pullDistance / 60, 1) }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-[#B8FF57] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-md px-6 pt-8 space-y-7 relative z-10">
        {/* Header */}
        <motion.div
          className="flex items-start justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className="text-[12px] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.35)]">
              Your Habits
            </p>
            <h1 className="text-[26px] font-semibold text-[#F0EDE6] mt-1 tracking-[-0.02em]">
              Keep going, <span className="bg-gradient-to-r from-[#B8FF57] to-[#57FFD1] bg-clip-text text-transparent">{displayName}</span>
            </h1>
          </div>
          <motion.button
            onClick={() => setAddOpen(true)}
            className="h-11 w-11 flex items-center justify-center rounded-2xl glass gradient-border"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8FF57" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>
          <AddHabitDialog open={addOpen} onOpenChange={setAddOpen} onCreated={() => mutate()} />
        </motion.div>

        {/* Habits */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="h-5 w-5 rounded-full border-2 border-[#B8FF57] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
          </div>
        ) : habits.length === 0 ? (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="mx-auto h-16 w-16 rounded-2xl glass gradient-border flex items-center justify-center mb-5"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </motion.div>
            <p className="text-[rgba(255,255,255,0.35)] text-[14px]">
              No habits yet. Tap <span className="text-[#B8FF57]">+</span> to start.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit, i) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <HabitCard habit={habit} onUpdate={() => mutate()} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
