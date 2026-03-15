"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
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
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
              {buddy.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{buddy.username}</p>
              <p className="text-xs text-muted-foreground">Your accountability buddy</p>
            </div>
          </div>

          <Separator />

          {buddyHabits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Your buddy hasn&apos;t added any habits yet
            </p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Their progress
              </h3>
              {buddyHabits.map((habit: Habit) => {
                const pct =
                  habit.total_days > 0
                    ? Math.round((habit.clean_days / habit.total_days) * 100)
                    : 0
                return (
                  <Card key={habit.id} className="border-l-4 border-l-emerald-300">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{habit.name}</span>
                        <Badge
                          variant="secondary"
                          className={
                            habit.type === "quit"
                              ? "bg-red-50 text-red-600 text-xs"
                              : "bg-emerald-50 text-emerald-600 text-xs"
                          }
                        >
                          {habit.type === "quit" ? "Quit" : "Build"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {habit.clean_days}/{habit.total_days} days{" "}
                          {habit.type === "quit" ? "clean" : "done"}
                        </span>
                        <span className="font-medium text-emerald-600">
                          {pct}%
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className="h-1.5 [&>div]:bg-emerald-400"
                      />
                      {habit.today_status && (
                        <div
                          className={`text-center text-xs py-1 rounded ${
                            habit.today_status === "clean"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {habit.today_status === "clean"
                            ? habit.type === "quit"
                              ? "Clean today"
                              : "Done today"
                            : habit.type === "quit"
                              ? "Slip today"
                              : "Missed today"}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Pending requests */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Pending requests
          </h3>
          {pending.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {req.from_username || "Someone"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    wants to be your buddy
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => respondToRequest(req.id, "accept")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 border-red-200 text-red-500 hover:bg-red-50"
                    onClick={() => respondToRequest(req.id, "reject")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search for buddy */}
      {!buddy && (
        <div className="space-y-4">
          <div className="text-center space-y-2 py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <Users className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="font-semibold text-lg">Find a buddy</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Accountability buddies can see each other&apos;s progress. No cap.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{u.username}</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => sendRequest(u.username)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
