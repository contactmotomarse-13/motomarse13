import Link from 'next/link'

export function Footer() {
return (
<footer className="border-t border-white/10 py-10 text-sm">
<div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
<p className="text-white/70">© {new Date().getFullYear()} Moto Marse — Tous droits réservés.</p>
<div className="flex items-center gap-4 text-white/70">
<Link href="/tarifs">Tarifs</Link>
<Link href="/reserver">Réservation</Link>
<Link href="/contact">Contact</Link>
</div>
</div>
</footer>
)
}
