"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.floor(eased * target)
      setCount(start)
      if (progress < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [target, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(rgba(200, 245, 110, 0.04) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />
      {/* Floating orbs */}
      <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] rounded-full bg-[#C8F56E] opacity-[0.02] blur-[100px] animate-orb-1" />
      <div className="absolute bottom-[30%] right-[10%] w-[200px] h-[200px] rounded-full bg-[#C8F56E] opacity-[0.015] blur-[80px] animate-orb-2" />
    </div>
  )
}

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard")
      return
    }
    if (status === "unauthenticated") {
      const t1 = setTimeout(() => setPhase(1), 200)
      const t2 = setTimeout(() => setPhase(2), 800)
      const t3 = setTimeout(() => setPhase(3), 1400)
      const t4 = setTimeout(() => setShowAuth(true), 2000)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
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
    <div className="min-h-screen bg-[#0C0C0E] relative overflow-hidden flex flex-col">
      <style jsx>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 15px) scale(0.9); }
        }
        @keyframes clip-reveal {
          from { clip-path: inset(0 100% 0 0); }
          to { clip-path: inset(0 0% 0 0); }
        }
        @keyframes letter-in {
          from { opacity: 0; transform: translateY(20px) rotateX(40deg); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) rotateX(0); filter: blur(0); }
        }
        @keyframes fade-slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes streak-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-orb-1 { animation: orb1 8s ease-in-out infinite; }
        .animate-orb-2 { animation: orb2 10s ease-in-out infinite; }
        .letter-animate {
          display: inline-block;
          opacity: 0;
          animation: letter-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .auth-reveal {
          animation: fade-slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <DotGrid />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-sm">
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* Logo with pulse ring */}
            <div className="relative inline-flex items-center justify-center mb-10">
              <div
                className="h-16 w-16 rounded-2xl bg-[#151518] border-[0.5px] border-[rgba(200,245,110,0.15)] flex items-center justify-center relative z-10 transition-all duration-1000"
                style={{
                  opacity: phase >= 1 ? 1 : 0,
                  transform: phase >= 1 ? 'scale(1)' : 'scale(0.5)',
                }}
              >
                <span className="text-[28px] font-bold text-[#C8F56E] font-mono tracking-tighter">Q</span>
              </div>
              {phase >= 1 && (
                <div className="absolute inset-0 rounded-2xl border border-[#C8F56E]" style={{ animation: 'pulse-ring 1.5s ease-out forwards' }} />
              )}
            </div>

            {/* Title — letter by letter */}
            <div className="overflow-hidden mb-3" style={{ perspective: '400px' }}>
              <h1 className="text-[52px] font-light text-[#E8E6E1] tracking-[-0.04em] leading-none">
                {"QUIT".split("").map((letter, i) => (
                  <span
                    key={i}
                    className="letter-animate"
                    style={{
                      animationDelay: phase >= 2 ? `${i * 80}ms` : '99s',
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </h1>
            </div>

            <div className="overflow-hidden mb-8">
              <p
                className="text-[18px] tracking-[0.2em] uppercase transition-all duration-700"
                style={{
                  color: 'rgba(200, 245, 110, 0.6)',
                  opacity: phase >= 2 ? 1 : 0,
                  transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)',
                  transitionDelay: '0.4s',
                }}
              >
                NO CAP.
              </p>
            </div>

            {/* Tagline */}
            <p
              className="text-[15px] text-[rgba(255,255,255,0.35)] leading-relaxed transition-all duration-700 max-w-[280px] mx-auto"
              style={{
                opacity: phase >= 3 ? 1 : 0,
                transform: phase >= 3 ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              Track your habits. Hold your buddy accountable. One day at a time.
            </p>

            {/* Animated stat line */}
            {phase >= 3 && (
              <div className="mt-8 flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="font-mono text-[22px] font-light text-[#C8F56E]">
                    <AnimatedCounter target={365} duration={1500} />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.2)] mt-1">Days tracked</div>
                </div>
                <div className="w-px h-8 bg-[rgba(255,255,255,0.06)]" />
                <div className="text-center">
                  <div className="font-mono text-[22px] font-light text-[#E8E6E1]">
                    <AnimatedCounter target={12} duration={1200} />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.2)] mt-1">Habits broken</div>
                </div>
                <div className="w-px h-8 bg-[rgba(255,255,255,0.06)]" />
                <div className="text-center">
                  <div className="font-mono text-[22px] font-light text-[#6EE7B7]">
                    $<AnimatedCounter target={2840} duration={1800} />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.2)] mt-1">Money saved</div>
                </div>
              </div>
            )}
          </div>

          {/* Auth Section — slides up */}
          {showAuth && (
            <div className="auth-reveal space-y-5">
              {/* Google */}
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full h-[50px] rounded-xl bg-white hover:bg-zinc-100 text-[#0C0C0E] font-medium text-[14px] transition-colors flex items-center justify-center gap-3 active:scale-[0.97] transition-transform duration-100"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
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
                <span className="text-[10px] text-[rgba(255,255,255,0.2)] uppercase tracking-[0.1em]">or sign in</span>
                <div className="h-[0.5px] flex-1 bg-[rgba(255,255,255,0.06)]" />
              </div>

              {/* Email/Password — compact inline */}
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="flex-1 bg-[#151518] border-[0.5px] border-[rgba(255,255,255,0.06)] text-[#E8E6E1] placeholder:text-[rgba(255,255,255,0.2)] h-11 rounded-xl px-3 text-[13px] outline-none focus:border-[rgba(200,245,110,0.2)] transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="flex-1 bg-[#151518] border-[0.5px] border-[rgba(255,255,255,0.06)] text-[#E8E6E1] placeholder:text-[rgba(255,255,255,0.2)] h-11 rounded-xl px-3 text-[13px] outline-none focus:border-[rgba(200,245,110,0.2)] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-[46px] rounded-xl bg-[rgba(200,245,110,0.08)] border-[0.5px] border-[rgba(200,245,110,0.15)] text-[#C8F56E] text-[14px] font-medium active:scale-[0.97] transition-transform duration-100 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-[#C8F56E] border-t-transparent" />
                    </span>
                  ) : (
                    "Log in"
                  )}
                </button>
              </form>

              <p className="text-center text-[13px] text-[rgba(255,255,255,0.25)]">
                New here?{" "}
                <Link href="/signup" className="text-[#C8F56E] hover:text-[#b8e55e] transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
