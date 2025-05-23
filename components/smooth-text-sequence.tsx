"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const lines = [
  "It's not AI.",
  "It's an operating system for human agency.",
  "",
  "You won't use it. You'll build with it.",
  "From the builders of Eclipse LMOS.",
]

export function SmoothTextSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])

  useEffect(() => {
    // Show each line with a short delay between them
    const timeouts: NodeJS.Timeout[] = []

    lines.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleLines((prev) => [...prev, index])

        // If this is the last line, wait a moment then call onComplete
        if (index === lines.length - 1) {
          setTimeout(() => {
            onComplete()
          }, 1000)
        }
      }, index * 700) // 700ms between each line appearing

      timeouts.push(timeout)
    })

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [onComplete])

  return (
    <div className="fixed top-8 left-8 z-20 max-w-md">
      <div className="font-mono text-sm leading-relaxed text-white/80">
        <AnimatePresence>
          {lines.map(
            (line, index) =>
              visibleLines.includes(index) && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: line === "" ? 0 : 0.8, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={line === "" ? "h-4" : ""}
                >
                  {line}
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
