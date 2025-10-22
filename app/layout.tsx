import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '../components/ui/Navbar'
import { Footer } from '../components/Footer'



export const metadata: Metadata = {
title: 'Moto Marse — Moto‑Taxi Marseille',
description: 'Service de moto‑taxi rapide à Marseille : tarifs clairs, réservation simple, simulateur express.',
icons: {
icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="fr">
<body>
<Navbar />
<main className="container py-10 min-h-[70vh]">{children}</main>
<Footer />
</body>
</html>
)
}
