"use client"

import { useState, useEffect, useCallback } from "react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Check, X, Users } from "lucide-react"
import { toast } from "sonner"
import type { BuddyData, User, Habit } from "@/lib/types"

export function BuddySection() {
  const [data, setData] = useState<BuddyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)

  const fetchBuddyData = useCallback(async () => {
    try {
      const res = await fetch("/api/buddy")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      toast.error("Failed to load buddy data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBuddyData()
  }, [fetchBuddyData])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `/api/buddy/search?q=${encodeURIComponent(searchQuery.trim())}`
      )
      if (res.ok) {
        const json = await res.json()
        setSearchResults(json.users || [])
        if ((json.users || []).length === 0) {
          toast.info("No users found")
        }
      }
    } catch {
      toast.error("Search failed")
    } finally {
      setSearching(false)
    }
  }

  const sendRequest = async (username: string) => {
    try {
      const res = await fetch("/api/buddy/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_username: username }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to send request")
      }
      toast.success("Buddy request sent!")
      setSearchResults([])
      setSearchQuery("")
      fetchBuddyData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send request")
    }
  }

  const respondToRequest = async (requestId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch(`/api/buddy/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, action }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success(action === "accept" ? "Buddy added!" : "Request declined")
      fetchBuddyData()
    } catch {
      toast.error("Something went wrong")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    )
  }

  const pending = data?.pending_requests || []
  const buddy = data?.buddy || null
  const buddyHabits = data?.habits || []

  return (
    <div className="space-y-6">
      {/* Buddy exists */}
      {buddy && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm">
              {buddy.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{buddy.username}</p>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Accountability buddy</p>
            </div>
          </div>

          <div className="h-px bg-white/[0.04]" />

          {buddyHabits.length === 0 ? (
            <p className="text-sm text-zinc-600 text-center py-4">
              Your buddy hasn&apos;t added any habits yet
            </p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                Their progress
              </h3>
              {buddyHabits.map((habit: Habit, i: number) => {
                const pct =
                  habit.total_days > 0
                    ? Math.round((habit.clean_days / habit.total_days) * 100)
                    : 0
                return (
                  <div key={habit.id} className={`glass-card rounded-xl p-3 space-y-2 animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-white">{habit.name}</span>
                      <span
                        className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          habit.type === "quit"
                            ? "text-red-400 bg-red-500/10 border-red-500/15"
                            : "text-emerald-400 bg-emerald-500/10 border-emerald-500/15"
                        }`}
                      >
                        {habit.type === "quit" ? "Quit" : "Build"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">
                        <span className="text-zinc-300 font-mono">{habit.clean_days}</span>
                        <span className="text-zinc-600">/{habit.total_days}</span>
                        {" "}{habit.type === "quit" ? "clean" : "done"}
                      </span>
                      <span className="font-mono font-medium text-red-400">{pct}%</span>
                    </div>
                    <Progress value={pct} />
                    {habit.today_status && (
                      <div
                        className={`text-center text-[11px] py-1.5 rounded-lg border ${
                          habit.today_status === "clean"
                            ? "bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/10"
                            : "bg-red-500/[0.06] text-red-400 border-red-500/10"
                        }`}
                      >
                        {habit.today_status === "clean"
                          ? habit.type === "quit" ? "Clean today" : "Done today"
                          : habit.type === "quit" ? "Slip today" : "Missed today"}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="space-y-3 animate-fade-up stagger-2">
          <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
            Pending requests
          </h3>
          {pending.map((req) => (
            <div key={req.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  {req.from_username || "Someone"}
                </p>
                <p className="text-[11px] text-zinc-500">wants to be your buddy</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/15 transition-all active:scale-95"
                  onClick={() => respondToRequest(req.id, "accept")}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 transition-all active:scale-95"
                  onClick={() => respondToRequest(req.id, "reject")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search for buddy */}
      {!buddy && (
        <div className="space-y-5 animate-fade-up stagger-2">
          <div className="text-center space-y-3 py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <Users className="h-7 w-7 text-zinc-600" />
            </div>
            <h2 className="font-semibold text-lg text-white">Find a buddy</h2>
            <p className="text-sm text-zinc-500 max-w-[250px] mx-auto">
              See each other&apos;s progress. No cap.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-white/[0.04] border-white/[0.06] text-white placeholder:text-zinc-600 h-11 rounded-xl focus:border-red-500/40 focus:ring-red-500/20"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all disabled:opacity-50 active:scale-95"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((u) => (
                <div key={u.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/15 text-red-400 text-sm font-bold">
                      {u.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">{u.username}</span>
                  </div>
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/15 transition-all active:scale-95"
                    onClick={() => sendRequest(u.username)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
