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
  generator: 'v0.dev',
  openGraph: {
    title: "MASAIC | Intelligence Assembled",
    description: "High Agency Systems",
    images: [
      {
        url: '/Masaic-og-Image.png',
        width: 1200,
        height: 630,
        alt: 'MASAIC | Intelligence Assembled'
      }
    ]
  }
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
