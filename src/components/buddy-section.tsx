"use client"

import { useState } from "react"
import useSWR from "swr"
import Image from "next/image"
import type { BuddyData, User, Habit } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function BuddyHabitCard({ habit }: { habit: Habit }) {
  const pct =
    habit.total_days > 0
      ? Math.round((habit.clean_days / habit.total_days) * 100)
      : 0

  return (
    <div className="bg-[#151518] rounded-xl p-4 border-[0.5px] border-[rgba(255,255,255,0.06)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[14px] text-[#E8E6E1]">{habit.name}</span>
          {habit.type === "quit" ? (
            <span className="rounded-[20px] px-2 py-0.5 bg-[rgba(244,91,105,0.06)] text-[#F45B69] border-[0.5px] border-[rgba(244,91,105,0.10)] font-mono text-[10px] font-light tracking-[0.05em]">
              QUIT
            </span>
          ) : (
            <span className="rounded-[20px] px-2 py-0.5 bg-[rgba(200,245,110,0.08)] text-[#C8F56E] border-[0.5px] border-[rgba(200,245,110,0.15)] font-mono text-[10px] font-light tracking-[0.05em]">
              BUILD
            </span>
          )}
        </div>
        <span className="font-mono text-[13px] text-[rgba(255,255,255,0.25)]">
          {pct}%
        </span>
      </div>
      <Progress value={pct} />
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-[20px] font-light text-[#E8E6E1]">
          {habit.clean_days}
        </span>
        <span className="text-[12px] text-[rgba(255,255,255,0.25)]">
          / {habit.total_days} days
        </span>
      </div>
    </div>
  )
}

function UserAvatar({ user, size = 40 }: { user: User; size?: number }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name || ""}
        width={size}
        height={size}
        className="rounded-full"
      />
    )
  }
  return (
    <div
      className="rounded-full bg-[#1C1C20] flex items-center justify-center text-[rgba(255,255,255,0.45)]"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {user.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  )
}

function SearchUsers({ onRequestSent }: { onRequestSent: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [sending, setSending] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `/api/buddy/search?q=${encodeURIComponent(query.trim())}`
      )
      if (res.ok) {
        const data = await res.json()
        setResults(data.users || data)
      }
    } catch {
      // silent
    } finally {
      setSearching(false)
    }
  }

  async function sendRequest(userId: string) {
    setSending(userId)
    try {
      const res = await fetch("/api/buddy/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_user_id: userId }),
      })
      if (res.ok) {
        onRequestSent()
        setResults((prev) => prev.filter((u) => u.id !== userId))
      }
    } catch {
      // silent
    } finally {
      setSending(null)
    }
  }

  return (
    <div>
      <span className="text-[13px] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)] block mb-3">
        Find a Buddy
      </span>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by name or email"
          className="bg-[#1C1C20] border-[0.5px] border-[rgba(255,255,255,0.06)] text-[#E8E6E1] h-11 rounded-xl placeholder:text-[rgba(255,255,255,0.25)] flex-1"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="h-11 px-5 rounded-xl bg-[#C8F56E] text-[#0C0C0E] text-[13px] font-medium active:scale-[0.97] transition-transform duration-100 disabled:opacity-50"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="bg-[#151518] rounded-xl p-4 border-[0.5px] border-[rgba(255,255,255,0.06)] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size={36} />
                <div>
                  <span className="text-[14px] text-[#E8E6E1] block">
                    {user.name}
                  </span>
                  <span className="text-[12px] text-[rgba(255,255,255,0.25)]">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => sendRequest(user.id)}
                disabled={sending === user.id}
                className="h-9 px-4 rounded-xl bg-[rgba(200,245,110,0.08)] border-[0.5px] border-[rgba(200,245,110,0.15)] text-[#C8F56E] text-[12px] active:scale-[0.97] transition-transform duration-100 disabled:opacity-50"
              >
                {sending === user.id ? "..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PendingRequests({
  buddyData,
  onRespond,
}: {
  buddyData: BuddyData
  onRespond: () => void
}) {
  const [responding, setResponding] = useState<string | null>(null)

  if (!buddyData.pending_requests || buddyData.pending_requests.length === 0)
    return null

  async function respond(requestId: string, action: "accept" | "reject") {
    setResponding(requestId)
    try {
      await fetch("/api/buddy/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, action }),
      })
      onRespond()
    } catch {
      // silent
    } finally {
      setResponding(null)
    }
  }

  return (
    <div>
      <span className="text-[13px] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)] block mb-3">
        Pending Requests
      </span>
      <div className="space-y-2">
        {buddyData.pending_requests.map((req) => (
          <div
            key={req.id}
            className="bg-[#151518] rounded-xl p-4 border-[0.5px] border-[rgba(255,255,255,0.06)] flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1C1C20] flex items-center justify-center overflow-hidden">
                {req.from_image ? (
                  <Image
                    src={req.from_image}
                    alt={req.from_name || ""}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-[14px] text-[rgba(255,255,255,0.45)]">
                    {req.from_name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <span className="text-[14px] text-[#E8E6E1]">
                {req.from_name || "Unknown"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => respond(req.id, "accept")}
                disabled={responding === req.id}
                className="h-9 px-3 rounded-xl bg-[rgba(200,245,110,0.08)] border-[0.5px] border-[rgba(200,245,110,0.15)] text-[#C8F56E] text-[12px] active:scale-[0.97] transition-transform duration-100 disabled:opacity-50"
              >
                Accept
              </button>
              <button
                onClick={() => respond(req.id, "reject")}
                disabled={responding === req.id}
                className="h-9 px-3 rounded-xl bg-[rgba(244,91,105,0.06)] border-[0.5px] border-[rgba(244,91,105,0.10)] text-[#F45B69] text-[12px] active:scale-[0.97] transition-transform duration-100 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BuddyProfile({ buddyData }: { buddyData: BuddyData }) {
  if (!buddyData.buddy) return null

  return (
    <div className="bg-[#151518] rounded-2xl p-6 border-[0.5px] border-[rgba(255,255,255,0.06)]">
      <span className="text-[13px] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)] block mb-4">
        Your Buddy
      </span>
      <div className="flex items-center gap-3">
        <UserAvatar user={buddyData.buddy} size={44} />
        <div>
          <span className="text-[18px] font-medium text-[#E8E6E1] block">
            {buddyData.buddy.name}
          </span>
          <span className="text-[12px] text-[rgba(255,255,255,0.25)]">
            {buddyData.buddy.email}
          </span>
        </div>
      </div>

      {buddyData.habits.length > 0 ? (
        <div className="mt-5 space-y-3">
          {buddyData.habits.map((h) => (
            <BuddyHabitCard key={h.id} habit={h} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-[rgba(255,255,255,0.25)]">
          Your buddy hasn&apos;t started tracking yet.
        </p>
      )}
    </div>
  )
}

export function BuddySection() {
  const { data: buddyData, mutate } = useSWR<BuddyData>("/api/buddy", fetcher)

  if (!buddyData) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-[13px] text-[rgba(255,255,255,0.25)]">
          Loading...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {buddyData.buddy ? (
        <BuddyProfile buddyData={buddyData} />
      ) : (
        <>
          <PendingRequests buddyData={buddyData} onRespond={() => mutate()} />
          <SearchUsers onRequestSent={() => mutate()} />
        </>
      )}
    </div>
  )
}
