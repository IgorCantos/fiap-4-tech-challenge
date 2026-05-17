import type { Metadata } from 'next'
import './globals.css'
import '@fontsource/inter'

export const metadata: Metadata = {
  title: 'Hello Next.js',
  description: 'Full-stack Next.js application with frontend and backend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
