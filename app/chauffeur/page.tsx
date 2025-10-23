"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Booking } from '@/lib/db'
import type { User } from '@/lib/auth'
import { formatEuros } from '@/lib/payment'

export default function ChauffeurDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ totalTrips: number; totalEarningsPaid: number; unpaidTrips: number } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        if (!meData.user) {
          router.push('/chauffeur/connexion')
          return
        }
        setUser(meData.user)
        if ((meData.user.role || 'user') !== 'driver') {
          // Redirect users to their profile if not driver
          router.push('/profil')
          return
        }
        const res = await fetch('/api/driver/bookings')
        const data = await res.json()
        setBookings(data.bookings || [])
        setStats(data.stats || null)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (e) {
      console.error('Erreur de déconnexion', e)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-white/60">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Espace Chauffeur</h1>
          <p className="text-white/60 mt-2">Bienvenue {user?.name}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Se déconnecter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-white/70">Trajets assignés</div>
          <div className="text-2xl font-bold mt-1">{stats?.totalTrips ?? 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/70">Revenus encaissés</div>
          <div className="text-2xl font-bold mt-1 text-green-500">{formatEuros(stats?.totalEarningsPaid ?? 0)}</div>
          <div className="text-xs text-white/50 mt-1">après commission</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/70">Trajets non payés</div>
          <div className="text-2xl font-bold mt-1 text-orange-500">{stats?.unpaidTrips ?? 0}</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="pb-3 font-medium text-white/70">Client</th>
              <th className="pb-3 font-medium text-white/70">Trajet</th>
              <th className="pb-3 font-medium text-white/70">Date</th>
              <th className="pb-3 font-medium text-white/70">Montant</th>
              <th className="pb-3 font-medium text-white/70">Statut</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-white/60">Aucun trajet assigné pour le moment</td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="border-b border-white/5">
                  <td className="py-3">
                    <div className="font-medium">{b.fullName}</div>
                    <div className="text-xs text-white/50">{b.phone}</div>
                  </td>
                  <td className="py-3 text-xs">
                    <div>{b.pickup}</div>
                    <div className="text-white/50">→ {b.dropoff}</div>
                  </td>
                  <td className="py-3">
                    <div>{new Date(b.date).toLocaleDateString('fr-FR')}</div>
                    <div className="text-xs text-white/50">{b.time}</div>
                  </td>
                  <td className="py-3 font-medium text-orange-500">
                    {b.amountDriver ? formatEuros(b.amountDriver) : '—'}
                  </td>
                  <td className="py-3">
                    {b.paymentStatus === 'paid' ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">✓ Payé</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-500">Non payé</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
