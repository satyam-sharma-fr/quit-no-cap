"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
    }
  }, [status, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error("Enter your email and password")
      return
    }
    setSubmitting(true)
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        isSignup: "false",
        redirect: false,
      })
      if (res?.error) {
        toast.error("Invalid email or password")
      } else {
        router.push("/dashboard")
      }
    } catch {
      toast.error("Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading" || session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0C0C0E]">
        <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-[#C8F56E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-[#0C0C0E]">
      <div className="w-full max-w-sm space-y-10">
        {/* Branding */}
        <div className="text-center space-y-5 animate-fade-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#151518] border-[0.5px] border-[rgba(255,255,255,0.06)]">
            <span className="text-2xl font-bold text-[#C8F56E] tracking-tighter font-mono">Q</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-[22px] font-light text-[#E8E6E1]">
              QUIT NO CAP
            </h1>
            <p className="text-[rgba(255,255,255,0.45)] text-sm">
              Hold each other accountable
            </p>
          </div>
        </div>

        {/* Google Sign In */}
        <div className="space-y-5 animate-fade-up stagger-2">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-12 rounded-xl bg-white hover:bg-zinc-100 text-[#0C0C0E] font-medium text-sm tracking-wide transition-colors flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-[0.5px] flex-1 bg-[rgba(255,255,255,0.06)]" />
            <span className="text-[11px] text-[rgba(255,255,255,0.25)] uppercase tracking-wider">or</span>
            <div className="h-[0.5px] flex-1 bg-[rgba(255,255,255,0.06)]" />
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[11px] text-[rgba(255,255,255,0.25)] uppercase tracking-wider font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-[#151518] border-[0.5px] border-[rgba(255,255,255,0.06)] text-[#E8E6E1] placeholder:text-[rgba(255,255,255,0.25)] h-11 rounded-xl px-3 text-sm outline-none focus:border-[rgba(255,255,255,0.12)] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[11px] text-[rgba(255,255,255,0.25)] uppercase tracking-wider font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-[#151518] border-[0.5px] border-[rgba(255,255,255,0.06)] text-[#E8E6E1] placeholder:text-[rgba(255,255,255,0.25)] h-11 rounded-xl px-3 text-sm outline-none focus:border-[rgba(255,255,255,0.12)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-[#C8F56E] hover:bg-[#b8e55e] text-[#0C0C0E] font-medium text-sm transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-[#0C0C0E] border-t-transparent" />
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[rgba(255,255,255,0.45)] animate-fade-up stagger-3">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#C8F56E] hover:text-[#b8e55e] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
