"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return

    const wasDismissed = localStorage.getItem("pwa-install-dismissed")
    if (wasDismissed) return

    setDismissed(false)

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDismissed(true)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("pwa-install-dismissed", "1")
  }

  if (dismissed || !deferredPrompt) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#111113]/95 backdrop-blur-xl border-b border-red-500/10 text-white px-4 py-3 flex items-center justify-between gap-3 animate-fade-up">
      <div className="flex items-center gap-2.5 text-sm">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
          <Download className="h-3.5 w-3.5 text-red-400" />
        </div>
        <span className="text-zinc-300 text-xs">Install for the best experience</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all active:scale-95"
          onClick={handleInstall}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
