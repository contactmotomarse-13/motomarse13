'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import type { User } from '@/lib/auth'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        setUser(data.user)
      } catch (error) {
        setUser(null)
      }
    }
    checkAuth()
  }, [pathname])

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={clsx(
        'rounded-xl px-4 py-2 text-sm hover:bg-white/10 transition',
        pathname === href && 'bg-white/10'
      )}
    >
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur border-b border-white/10">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-bold text-white">Moto Marse</Link>
        <nav className="flex items-center gap-2">
          {link('/', 'Accueil')}
          {link('/tarifs', 'Tarifs')}
          {link('/reserver', 'Réservation')}
          {link('/contact', 'Contact')}
          {link('/devenir', 'Devenir chauffeur')}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={(user.role || 'user') === 'driver' ? '/chauffeur' : '/profil'}
                className={clsx(
                  'rounded-xl px-4 py-2 text-sm transition font-medium',
                  ((user.role || 'user') === 'driver' ? pathname === '/chauffeur' : pathname === '/profil')
                    ? 'bg-brand-500 text-white'
                    : 'bg-brand-500/20 text-brand-500 hover:bg-brand-500/30'
                )}
              >
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' })
                    window.location.href = '/'
                  } catch {}
                }}
                className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/20 transition"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              href="/connexion"
              className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/20 transition"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
