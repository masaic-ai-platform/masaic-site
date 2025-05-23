"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cursor } from "./cursor"

const lines = [
  "It's not AI.",
  "It's an operating system for human agency.",
  "",
  "You won't use it.",
  "You'll build with it.",
  "From the builders of Eclipse LMOS.",
]

export function TypingSequence({ onComplete }: { onComplete: () => void }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [completedLines, setCompletedLines] = useState<string[]>([])

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      // All lines complete
      setTimeout(() => {
        onComplete()
      }, 1000)
      return
    }

    const currentLine = lines[currentLineIndex]

    // Handle empty lines (for spacing)
    if (currentLine === "") {
      setTimeout(() => {
        setCompletedLines((prev) => [...prev, ""])
        setCurrentLineIndex((prev) => prev + 1)
        setCurrentText("")
      }, 500)
      return
    }

    if (isTyping && currentText.length < currentLine.length) {
      // Still typing the current line
      const timeout = setTimeout(
        () => {
          setCurrentText(currentLine.slice(0, currentText.length + 1))
        },
        50 + Math.random() * 30, // Slightly faster, more consistent typing
      )
      return () => clearTimeout(timeout)
    } else if (isTyping) {
      // Finished typing the current line
      setIsTyping(false)
      setTimeout(() => {
        // Add to completed lines and prepare for next line
        setCompletedLines((prev) => [...prev, currentLine])
        setCurrentLineIndex((prev) => prev + 1)
        setCurrentText("")
        setIsTyping(true)
      }, 700) // Pause at the end of each line
    }
  }, [currentText, currentLineIndex, isTyping, onComplete])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="max-w-2xl text-center">
        <div className="font-mono text-lg leading-relaxed text-white/80">
          {/* Render completed lines with AnimatePresence for smooth transitions */}
          <AnimatePresence mode="wait">
            {completedLines.map((line, index) => (
              <motion.div
                key={`completed-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: line === "" ? 0 : 0.8 }}
                transition={{ duration: 0.3 }}
                className={line === "" ? "h-6" : "mb-2"}
              >
                {line}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Current typing line */}
          {currentLineIndex < lines.length && (
            <motion.div
              className="flex items-center justify-center mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span>{currentText}</span>
              {isTyping && <Cursor />}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
