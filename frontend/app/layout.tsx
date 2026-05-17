import type { Metadata } from 'next'
import './globals.css'
import '@fontsource/inter'

import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'Análise de Voz',
  description: 'Gravação e análise emocional de áudio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
