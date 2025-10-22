'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function Navbar() {
const pathname = usePathname()
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
</nav>
</div>
</header>
)
}
