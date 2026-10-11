'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSelector from '@/components/LanguageSelector'
import { 
  LayoutDashboard, 
  Menu,
  X,
  LogOut,
  LifeBuoy,
  Shield,
  Settings,
  Boxes,
  Activity,
  Calendar,
  DollarSign,
  Bird,
  Beef,
  ShieldAlert,
  TrendingUp,
  Warehouse
} from 'lucide-react'
import { DeviseProvider } from '@/components/DeviseProvider'

export default function ClientLayout({
  children,
  subscriptionTier,
  role,
  permissions,
  entrepriseNom,
  devise = 'FCFA',
  dict,
  locale
}: {
  children: React.ReactNode
  subscriptionTier: string
  role: string
  permissions: any
  entrepriseNom: string
  devise?: string
  dict: any
  locale: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { key: 'dashboard', label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { key: 'bandes', label: 'Bandes & Volailles', href: '/elevage/bandes', icon: Bird },
    { key: 'animaux', label: 'Bovins & Ruminants', href: '/elevage/animaux', icon: Beef },
    { key: 'suivi', label: 'Suivi & Mortalités', href: '/elevage/suivi', icon: Activity },
    { key: 'prophylaxie', label: 'Santé & Latence', href: '/elevage/sanitaire', icon: ShieldAlert },
    { key: 'intrants', label: 'Aliments & Stocks', href: '/elevage/stocks', icon: Boxes },
    { key: 'batiments', label: 'Bâtiments & Enclos', href: '/elevage/batiments', icon: Warehouse },
    { key: 'finances', label: 'Finances & Marges', href: '/elevage/finances', icon: DollarSign },
    { key: 'abonnement', label: 'Abonnement', href: '/abonnement', icon: Shield },
    { key: 'parametres', label: 'Paramètres', href: '/parametres', icon: Settings },
    { key: 'support', label: 'Support & Aide', href: '/support', icon: LifeBuoy },
  ]

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <DeviseProvider devise={devise}>
      <div>
        {/* Mobile sidebar */}
        <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0 bg-background/80" onClick={() => setSidebarOpen(false)} />
          
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                  <span className="sr-only">Fermer la barre latérale</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[var(--sidebar)] px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center gap-2">
                  <Bird className="w-7 h-7 text-primary" />
                  <h1 className="text-2xl font-bold text-primary font-heading">D-ÉLEVAGE</h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.key}>
                            <Link
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                                ${pathname === item.href
                                  ? 'bg-primary text-white'
                                  : 'text-foreground-muted hover:text-foreground hover:bg-black/5'
                                }
                              `}
                            >
                              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r border-surface-border bg-[var(--sidebar)]">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border">
              <div className="flex items-center gap-2">
                <Bird className="w-7 h-7 text-primary" />
                <span className="text-xl font-bold text-primary font-heading tracking-wide">D-ÉLEVAGE</span>
              </div>
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {subscriptionTier}
              </span>
            </div>

            <div className="text-xs font-medium text-foreground-muted truncate">
              Exploitation : <span className="font-semibold text-foreground">{entrepriseNom}</span>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.key}>
                        <Link
                          href={item.href}
                          className={`
                            group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                            ${pathname === item.href
                              ? 'bg-primary text-white'
                              : 'text-foreground-muted hover:text-foreground hover:bg-black/5'
                            }
                          `}
                        >
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-surface-border bg-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-foreground lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Ouvrir la barre latérale</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
              <div className="text-sm font-medium text-foreground">
                <span className="hidden sm:inline">Connecté en tant que </span>
                <span className="font-semibold text-primary capitalize">{role}</span>
              </div>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <LanguageSelector currentLang={locale} />
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-sm font-medium text-danger hover:text-danger/80"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </DeviseProvider>
  )
}
