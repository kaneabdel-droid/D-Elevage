import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'D-Élevage — Gestion & Rentabilité d’Élevage',
  description: 'Logiciel de gestion pour exploitations d’élevage avicole, bovin, ovin, caprin et porcin.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
