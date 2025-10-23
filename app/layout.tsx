import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '../components/ui/Navbar'
import { Footer } from '../components/Footer'



export const metadata: Metadata = {
  title: 'Moto Marse — Moto‑Taxi Marseille',
  description: 'Service de moto‑taxi rapide à Marseille : tarifs clairs, réservation simple, simulateur express.',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Moto Marse',
  },
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://motomarse.vercel.app',
    siteName: 'Moto Marse',
    title: 'Moto Marse — Moto-Taxi Marseille',
    description: 'Service de moto-taxi rapide à Marseille : tarifs clairs, réservation simple, simulateur express.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="fr">
<head>
<meta name="application-name" content="Moto Marse" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Moto Marse" />
<link rel="manifest" href="/manifest.json" />
</head>
<body>
<Navbar />
<main className="container py-10 min-h-[70vh]">{children}</main>
<Footer />
</body>
</html>
)
}
