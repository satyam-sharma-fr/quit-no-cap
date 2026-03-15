"use client"

import { useRef, useCallback, useEffect, useState } from "react"

export function usePullRefresh(onRefresh: () => Promise<void>) {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const refreshing = useRef(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0 || refreshing.current) return
    const diff = e.touches[0].clientY - startY.current
    if (diff > 0 && diff < 120) {
      setPullDistance(diff)
      setPulling(true)
    }
  }, [])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && !refreshing.current) {
      refreshing.current = true
      await onRefresh()
      refreshing.current = false
    }
    setPulling(false)
    setPullDistance(0)
  }, [pullDistance, onRefresh])

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd)
    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return { pulling, pullDistance }
}
