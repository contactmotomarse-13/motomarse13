'use client'
import { useEffect, useState } from 'react'
import type { Booking } from '@/lib/db'
import { formatEuros, PLATFORM_COMMISSION_PERCENT } from '@/lib/payment'
import { VEHICLE_CATEGORIES } from '@/config/pricing'

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [drivers, setDrivers] = useState<Array<{id: string; name: string; email: string}>>([])
  const [assigning, setAssigning] = useState<string | null>(null)

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch('/api/admin/bookings')
        const data = await res.json()
        setBookings(data.bookings || [])
      } catch (error) {
        console.error('Error loading bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [])

  useEffect(() => {
    async function loadDrivers() {
      try {
        const res = await fetch('/api/admin/drivers')
        const data = await res.json()
        setDrivers(data.drivers || [])
      } catch (error) {
        console.error('Error loading drivers:', error)
      }
    }
    loadDrivers()
  }, [])

  async function assignDriver(bookingId: string, driverId: string) {
    setAssigning(bookingId)
    try {
      const res = await fetch('/api/admin/assign-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, driverId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur assignation')

      // Update local state
      setBookings(prev => prev.map(b => (b.id === bookingId ? data.booking : b)))
    } catch (e) {
      console.error(e)
      alert('Impossible d\'assigner le chauffeur')
    } finally {
      setAssigning(null)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'paid') return b.paymentStatus === 'paid'
    if (filter === 'unpaid') return b.paymentStatus !== 'paid'
    return true
  })

  const stats = {
    totalPaid: bookings.filter((b) => b.paymentStatus === 'paid').length,
    totalRevenue: bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.amountTotal || 0), 0),
    platformRevenue: bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.amountPlatform || 0), 0),
    driverRevenue: bookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.amountDriver || 0), 0),
  }

  const getVehicleName = (categoryId: string) => {
    const cat = VEHICLE_CATEGORIES.find((v) => v.id === categoryId)
    return cat?.name || categoryId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-white/60">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gestion des paiements</h1>
        <p className="text-white/60 mt-2">Suivi des paiements et commissions chauffeurs</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-white/70">Total payé</div>
          <div className="text-2xl font-bold mt-1">{stats.totalPaid}</div>
          <div className="text-xs text-white/50 mt-1">réservations</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/70">Chiffre d'affaires</div>
          <div className="text-2xl font-bold mt-1 text-green-500">{formatEuros(stats.totalRevenue)}</div>
          <div className="text-xs text-white/50 mt-1">total encaissé</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/70">Commission plateforme ({PLATFORM_COMMISSION_PERCENT}%)</div>
          <div className="text-2xl font-bold mt-1 text-brand-500">{formatEuros(stats.platformRevenue)}</div>
          <div className="text-xs text-white/50 mt-1">à garder</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/70">À verser aux chauffeurs</div>
          <div className="text-2xl font-bold mt-1 text-orange-500">{formatEuros(stats.driverRevenue)}</div>
          <div className="text-xs text-white/50 mt-1">{100 - PLATFORM_COMMISSION_PERCENT}% du total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === 'all' ? 'bg-brand-500 text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Toutes ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === 'paid' ? 'bg-brand-500 text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Payées ({stats.totalPaid})
        </button>
        <button
          onClick={() => setFilter('unpaid')}
          className={`px-4 py-2 rounded-lg text-sm transition ${
            filter === 'unpaid' ? 'bg-brand-500 text-white' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          Non payées ({bookings.length - stats.totalPaid})
        </button>
      </div>

      {/* Bookings table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr className="text-left">
              <th className="pb-3 font-medium text-white/70">Client</th>
              <th className="pb-3 font-medium text-white/70">Trajet</th>
              <th className="pb-3 font-medium text-white/70">Date</th>
              <th className="pb-3 font-medium text-white/70">Véhicule</th>
              <th className="pb-3 font-medium text-white/70">Chauffeur</th>
              <th className="pb-3 font-medium text-white/70">Montant total</th>
              <th className="pb-3 font-medium text-white/70">Commission ({PLATFORM_COMMISSION_PERCENT}%)</th>
              <th className="pb-3 font-medium text-white/70">Part chauffeur</th>
              <th className="pb-3 font-medium text-white/70">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-white/60">
                  Aucune réservation
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-white/5">
                  <td className="py-3">
                    <div className="font-medium">{booking.fullName}</div>
                    <div className="text-xs text-white/50">{booking.phone}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-xs">{booking.pickup}</div>
                    <div className="text-xs text-white/50">→ {booking.dropoff}</div>
                  </td>
                  <td className="py-3">
                    <div>{new Date(booking.date).toLocaleDateString('fr-FR')}</div>
                    <div className="text-xs text-white/50">{booking.time}</div>
                  </td>
                  <td className="py-3 text-xs">{getVehicleName(booking.vehicleCategory)}</td>
                  <td className="py-3 text-xs min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue={booking.driverId || ''}
                        onChange={(e) => assignDriver(booking.id, e.target.value)}
                        className="bg-white/10 rounded px-2 py-1 text-sm"
                      >
                        <option value="">— Non assigné —</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
                        ))}
                      </select>
                      {assigning === booking.id && (
                        <span className="text-xs text-white/60">Assignation...</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 font-medium">
                    {booking.amountTotal ? formatEuros(booking.amountTotal) : '—'}
                  </td>
                  <td className="py-3 text-brand-500 font-medium">
                    {booking.amountPlatform ? formatEuros(booking.amountPlatform) : '—'}
                  </td>
                  <td className="py-3 text-orange-500 font-medium">
                    {booking.amountDriver ? formatEuros(booking.amountDriver) : '—'}
                  </td>
                  <td className="py-3">
                    {booking.paymentStatus === 'paid' ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                        ✓ Payé
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-500">
                        Non payé
                      </span>
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
