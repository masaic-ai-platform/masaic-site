"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from "next/dynamic"
import { TypingSequence } from "@/components/typing-sequence"

// Dynamically import the NodeNetwork component to avoid SSR issues with Three.js
const NodeNetwork = dynamic(() => import("@/components/node-network"), {
  ssr: false,
  loading: () => null, // No loading indicator during text phase
})

export default function Home() {
  const [showTyping, setShowTyping] = useState(false)
  const [typingComplete, setTypingComplete] = useState(false)
  const [showConstellation, setShowConstellation] = useState(false)
  const [showTitle, setShowTitle] = useState(false)

  useEffect(() => {
    // Start typing sequence immediately after a short delay
    const timer = setTimeout(() => setShowTyping(true), 500)

    return () => clearTimeout(timer)
  }, [])

  const handleTypingComplete = () => {
    setTypingComplete(true)
    // Show constellation first
    setTimeout(() => {
      setShowConstellation(true)
      // Then show MASAIC title
      setTimeout(() => {
        setShowTitle(true)
      }, 1000)
    }, 500)
  }

  const handleNotifyClick = () => {
    window.location.href =
     "mailto:aj@masaic.ai?subject=Join%20the%20Pilot&body=Hi%2C%20I'm%20interested%20in%20joining%20the%20Masaic%20pilot.%20Here's%20the%20outcome%20I'm%20envisioning%20for%20my%20team%20and%20our%20business%3A%20"
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      {/* Cosmic background - only show after typing is complete */}
      <AnimatePresence>
        {showConstellation && (
          <motion.div
            id="cosmic-background"
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 2 }}
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(20, 20, 40, 0.3), rgba(0, 0, 0, 0.8)), url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: "cover",
            }}
          />
        )}
      </AnimatePresence>

      {/* Typing sequence - centered where MASAIC will appear */}
      <AnimatePresence>
        {showTyping && !typingComplete && (
          <motion.div
            className="absolute z-10 flex h-full w-full flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TypingSequence onComplete={handleTypingComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Node network visualization - only after typing is complete */}
      <AnimatePresence>
        {showConstellation && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <NodeNetwork />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title - only shows after constellation appears, in same position as typing */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            className="absolute z-10 flex h-full w-full flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <motion.h1
              className="font-mono text-4xl font-light tracking-[1.5rem] text-white/80 text-center"
              initial={{ letterSpacing: "0.5rem", x: "0.8rem" }}
              animate={{ letterSpacing: "1.5rem", x: "0.8rem" }}
              transition={{ duration: 3, ease: "easeOut" }}
            >
              MASAIC
            </motion.h1>
            <motion.div
              className="mt-2 text-xs font-light tracking-widest text-center"
              style={{ color: "#AAB4D4" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
            >
              HIGH AGENCY SYSTEMS
            </motion.div>

            {/* Eclipse LMOS credit line */}
            <motion.div
              className="mt-3 text-[10px] font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2, delay: 2 }}
            >
              From the creators of{" "}
              <a
                href="https://eclipse.dev/lmos/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#AAB4D4]/80 hover:text-[#AAB4D4] transition-colors duration-300"
              >
                Eclipse LMOS
              </a>
              .
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tagline and Notify button - always visible */}
      <AnimatePresence>
        {showTyping && (
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-center sm:bottom-12 xs:bottom-20 max-sm:bottom-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
          >
<div className="font-mono text-sm text-white/60 mb-3 text-center px-4">
  <div className="mb-2">
    <span className="block sm:inline">Piloting quietly</span>
    <span className="block sm:inline whitespace-nowrap"> with top tier enterprise teams.</span>
  </div>
  <div>
    <span className="whitespace-nowrap">Those driven by outcomes and the long term.</span>
  </div>
  
<button
  onClick={handleNotifyClick}
  className="mt-5 relative group font-mono text-xs tracking-wider text-white/80 px-4 py-2 border border-white/30 overflow-hidden"
>
  <span className="relative z-10">[Join the Pilot]</span>
  <span className="absolute inset-0 border border-white/60 animate-glow-border pointer-events-none"></span>
</button>

</div>



       
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copyright footer - always visible */}
      <AnimatePresence>
        {showTyping && (
          <motion.div
            className="absolute bottom-4 left-0 right-0 z-10 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
          >
            <p className="text-xs tracking-wider text-white/40">© 2025 Masaic AI. All rights reserved.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
