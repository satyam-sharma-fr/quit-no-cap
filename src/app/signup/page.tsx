"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"

export default function SignupPage() {
  const { user, loading, signup } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      toast.error("Fill in all fields")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setSubmitting(true)
    try {
      await signup(username.trim(), password)
      toast.success("Welcome aboard!")
      router.push("/dashboard")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-[#09090b] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-red-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-10 relative z-10">
        {/* Branding */}
        <div className="text-center space-y-5 animate-fade-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 red-glow">
            <span className="text-2xl font-extrabold text-red-500 tracking-tighter font-mono">Q</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              CREATE ACCOUNT
            </h1>
            <p className="text-zinc-500 text-sm tracking-wide">
              Start your journey today
            </p>
          </div>
        </div>

        {/* Signup form */}
        <div className="glass-card rounded-2xl p-6 animate-fade-up stagger-2">
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Username
              </Label>
              <Input
                id="username"
                placeholder="pick a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                className="bg-white/[0.04] border-white/[0.06] text-white placeholder:text-zinc-600 h-11 rounded-xl focus:border-red-500/40 focus:ring-red-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="bg-white/[0.04] border-white/[0.06] text-white placeholder:text-zinc-600 h-11 rounded-xl focus:border-red-500/40 focus:ring-red-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="bg-white/[0.04] border-white/[0.06] text-white placeholder:text-zinc-600 h-11 rounded-xl focus:border-red-500/40 focus:ring-red-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                "Sign up"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600 animate-fade-up stagger-3">
          Already have an account?{" "}
          <Link
            href="/"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
