import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "MASAIC | Intelligence Assembled",
  description: "High Agency Systems",
  icons: {
    icon: '/masaic.ico', // This is the favicon path
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={GeistMono.className}>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
