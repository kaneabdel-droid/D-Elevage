import type { Metadata } from 'next'
import './globals.css'
import { getLocale } from '@/dictionaries'

export const metadata: Metadata = {
  title: 'D-Agroferme — Gestion Agro-Pastorale Intégrée',
  description: 'Logiciel tout-en-un pour exploitations agro-pastorales : élevage avicole, bovin, ovin, caprin, porcin et productions végétales (maraîchage, fruitière, fourrage).',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const isRtl = locale === 'ar'

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'}>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  )
}
