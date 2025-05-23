"use client"

import { useEffect, useState } from "react"

export function Cursor() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Slow down the blinking to a more reasonable speed (300ms)
    const interval = setInterval(() => {
      setVisible((v) => !v)
    }, 300)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="inline-block h-5 w-2"
      style={{
        backgroundColor: visible ? "rgba(255, 255, 255, 0.7)" : "transparent",
      }}
    />
  )
}
