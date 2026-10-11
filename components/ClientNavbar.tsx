'use client'

import Link from 'next/link'
import { Menu, X, Bird, Sparkles } from 'lucide-react'
import { useState } from 'react'
import LanguageSelector from '@/components/LanguageSelector'

export default function ClientNavbar({ dict, currentLang }: { dict?: any, currentLang: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/85 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Bird className="w-5 h-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold font-heading text-primary leading-tight">
                D-ÉLEVAGE
              </span>
              <span className="text-[10px] text-foreground-muted -mt-0.5 tracking-wider uppercase font-semibold hidden sm:inline">
                Demba Solution
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            <Link href="/#especes" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Espèces & Élevages
            </Link>
            <Link href="/tarifs" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Tarifs & Forfaits
            </Link>
            <Link href="/guide" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Guide d&apos;utilisation
            </Link>
            <Link href="/demo" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors inline-flex items-center gap-1 text-primary font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Démo en direct
            </Link>
            <Link href="/#contact" className="text-sm font-medium text-foreground-muted hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex gap-2 sm:gap-3 items-center">
            <LanguageSelector currentLang={currentLang} />
            <Link
              href="/login"
              className="rounded-full border border-surface-border px-3.5 py-1.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-all"
            >
              Connexion
            </Link>
            <Link
              href="/tarifs"
              className="hidden sm:inline-flex rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-all"
            >
              S&apos;abonner
            </Link>
            <button
              type="button"
              className="md:hidden p-2 text-foreground-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-background/95 backdrop-blur-md px-4 py-4 space-y-3">
          <Link
            href="/#especes"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground hover:text-primary"
          >
            Espèces & Élevages
          </Link>
          <Link
            href="/tarifs"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground hover:text-primary"
          >
            Tarifs & Forfaits
          </Link>
          <Link
            href="/guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground hover:text-primary"
          >
            Guide d&apos;utilisation
          </Link>
          <Link
            href="/demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-primary font-semibold"
          >
            Démo en direct
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-foreground hover:text-primary"
          >
            Contact
          </Link>
          <div className="pt-3 border-t border-surface-border flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-xl border border-surface-border font-semibold text-sm"
            >
              Connexion
            </Link>
            <Link
              href="/tarifs"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-xl bg-primary text-white font-semibold text-sm"
            >
              S&apos;abonner
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
