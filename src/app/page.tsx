"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"

function MeshGradient() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(184, 255, 87, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(87, 255, 209, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(255, 77, 106, 0.03) 0%, transparent 50%)
          `,
          animation: 'mesh-move 20s ease-in-out infinite',
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    function tick(now: number) {
      const progress = Math.min((now - startTime) / 2000, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])

  return <>{count.toLocaleString()}{suffix}</>
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard")
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
        email: email.trim(), password, isSignup: "false", redirect: false,
      })
      if (res?.error) toast.error("Invalid email or password")
      else router.push("/dashboard")
    } catch {
      toast.error("Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading" || session) {
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

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden flex flex-col items-center justify-center px-6">
      <MeshGradient />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative">
            <div className="h-[72px] w-[72px] rounded-[22px] glass gradient-border flex items-center justify-center">
              <span className="text-[32px] font-bold text-[#B8FF57] font-mono tracking-tighter">Q</span>
            </div>
            {/* Glow behind logo */}
            <div className="absolute inset-0 rounded-[22px] bg-[#B8FF57] opacity-[0.08] blur-xl -z-10 scale-150" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[48px] font-bold tracking-[-0.04em] leading-none">
            <span className="bg-gradient-to-r from-[#B8FF57] via-[#57FFD1] to-[#B8FF57] bg-clip-text text-transparent bg-[length:200%_auto]" style={{ animation: 'gradient-shift 4s ease infinite' }}>
              QUIT
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="text-center text-[15px] tracking-[0.25em] uppercase text-[rgba(255,255,255,0.4)] mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          NO CAP.
        </motion.p>

        {/* Tagline */}
        <motion.p
          className="text-center text-[15px] text-[rgba(255,255,255,0.45)] mb-10 leading-relaxed max-w-[300px] mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Track habits. Hold your buddy accountable. Break free, one day at a time.
        </motion.p>

        {/* Stats */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {[
            { value: 365, label: "Days", color: "#B8FF57" },
            { value: 12, label: "Habits", color: "#F0EDE6" },
            { value: 2840, label: "Saved", color: "#57FFD1", prefix: "$" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex-1 text-center glass rounded-2xl py-3 gradient-border"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="font-mono text-[20px] font-light" style={{ color: stat.color }}>
                {stat.prefix}<AnimatedCounter target={stat.value} />
              </div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.25)] mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Auth */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Google */}
          <motion.button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-[52px] rounded-2xl bg-white text-[#0A0A0F] font-semibold text-[14px] flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="h-[0.5px] flex-1 bg-[rgba(255,255,255,0.06)]" />
            <span className="text-[10px] text-[rgba(255,255,255,0.2)] uppercase tracking-[0.15em]">or sign in</span>
            <div className="h-[0.5px] flex-1 bg-[rgba(255,255,255,0.06)]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="flex-1 min-w-0 glass text-[#F0EDE6] placeholder:text-[rgba(255,255,255,0.2)] h-[46px] rounded-xl px-4 text-[13px] outline-none focus:border-[rgba(184,255,87,0.3)] transition-all duration-300"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="flex-1 min-w-0 glass text-[#F0EDE6] placeholder:text-[rgba(255,255,255,0.2)] h-[46px] rounded-xl px-4 text-[13px] outline-none focus:border-[rgba(184,255,87,0.3)] transition-all duration-300"
              />
            </div>
            <motion.button
              type="submit"
              disabled={submitting}
              className="w-full h-[46px] rounded-xl font-semibold text-[14px] disabled:opacity-50 overflow-hidden relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              style={{
                background: 'linear-gradient(135deg, rgba(184,255,87,0.12), rgba(87,255,209,0.08))',
                border: '0.5px solid rgba(184,255,87,0.2)',
                color: '#B8FF57',
              }}
            >
              {submitting ? (
                <motion.span
                  className="flex items-center justify-center"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  Logging in...
                </motion.span>
              ) : "Log in"}
            </motion.button>
          </form>

          <p className="text-center text-[13px] text-[rgba(255,255,255,0.3)] pt-2">
            New here?{" "}
            <Link href="/signup" className="text-[#B8FF57] hover:text-[#d4ff8a] transition-colors">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
