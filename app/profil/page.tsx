'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@/lib/auth'
import type { Booking } from '@/lib/db'
import { VEHICLE_CATEGORIES } from '@/config/pricing'
import { formatEuros } from '@/lib/payment'

export default function ProfilPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [newBookingId, setNewBookingId] = useState<string | null>(null)

  useEffect(() => {
    // Check for payment success and confirm booking
    const paymentStatus = searchParams?.get('payment')
    const bookingId = searchParams?.get('booking')
    
    if (paymentStatus === 'success' && bookingId) {
      // Get the booking to calculate amount
      const booking = bookings.find(b => b.id === bookingId)
      const amount = booking ? estimatePrice(booking) : 0
      
      // Confirmer le paiement manuellement (car webhook peut ne pas être configuré)
      fetch('/api/payment/confirm-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount }),
      })
      .then(() => {
        setShowPaymentSuccess(true)
        setTimeout(() => {
          setShowPaymentSuccess(false)
          // Reload page to show updated status
          window.location.href = '/profil'
        }, 2000)
      })
      .catch(err => console.error('Error confirming payment:', err))
    }
  }, [searchParams, bookings])

  useEffect(() => {
    async function loadUserData() {
      try {
        // Get current user
        const userRes = await fetch('/api/auth/me')
        const userData = await userRes.json()

        if (!userData.user) {
          router.push('/connexion')
          return
        }

        setUser(userData.user)

        // Get user bookings
        const bookingsRes = await fetch('/api/bookings')
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.bookings || [])
        
        // Check for new booking to highlight
        const newBooking = searchParams?.get('newBooking')
        if (newBooking) {
          setNewBookingId(newBooking)
          // Clear after 10 seconds
          setTimeout(() => setNewBookingId(null), 10000)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router, searchParams])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  async function handlePay(booking: Booking, estimatedAmount: number) {
    setPaymentLoading(booking.id)
    try {
      const res = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: estimatedAmount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors du paiement')
      setPaymentLoading(null)
    }
  }

  function estimatePrice(booking: Booking): number {
    const cat = VEHICLE_CATEGORIES.find((v) => v.id === booking.vehicleCategory) || VEHICLE_CATEGORIES[1]
    // Simple estimation: base price + 10€/km estimé + bagages
    const estimatedKm = 10 // Default estimate
    const luggage = parseInt(booking.luggage || '0')
    return cat.basePrice + estimatedKm * cat.pricePerKm + luggage * cat.baggageFee
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-white/60">Chargement...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getVehicleName = (categoryId: string) => {
    const cat = VEHICLE_CATEGORIES.find(v => v.id === categoryId)
    return cat?.name || categoryId
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      completed: 'Terminée',
      cancelled: 'Annulée',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      confirmed: 'bg-blue-500/20 text-blue-500',
      completed: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
    }
    return colors[status] || 'bg-white/10 text-white/60'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mon profil</h1>
          <p className="text-white/60 mt-2">Bienvenue, {user.name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 text-sm transition-colors"
        >
          Déconnexion
        </button>
      </div>

      {/* User info card */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Informations du compte</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Nom</span>
            <span className="font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Membre depuis</span>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* Bookings history */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Mes réservations ({bookings.length})</h2>

        {showPaymentSuccess && (
          <div className="rounded-xl bg-green-500/10 p-4 text-green-500 border border-green-500/20">
            <p className="font-medium">✓ Paiement réussi !</p>
            <p className="text-sm mt-1">Votre réservation a été confirmée.</p>
          </div>
        )}

        {newBookingId && (
          <div className="rounded-xl bg-blue-500/10 p-4 text-blue-500 border border-blue-500/20">
            <p className="font-medium">✓ Réservation créée avec succès !</p>
            <p className="text-sm mt-1">Vous pouvez maintenant payer votre trajet ci-dessous.</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-white/60 mb-4">Vous n'avez pas encore de réservation</p>
            <a href="/reserver" className="btn btn-primary inline-block">
              Réserver maintenant
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const estimatedPrice = estimatePrice(booking)
              const isPaid = booking.paymentStatus === 'paid'
              const canPay = !isPaid && booking.status !== 'cancelled'
              const isNewBooking = booking.id === newBookingId

              return (
                <div key={booking.id} className={`card ${isNewBooking ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold">{booking.pickup}</div>
                      <div className="text-sm text-white/60 mt-1">→ {booking.dropoff}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                      {isPaid ? (
                        <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-500">
                          ✓ Payé
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-500">
                          Non payé
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-white/70">
                    <div>
                      <div className="text-xs text-white/50">Date</div>
                      <div className="font-medium text-white">
                        {new Date(booking.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Heure</div>
                      <div className="font-medium text-white">{booking.time}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Véhicule</div>
                      <div className="font-medium text-white text-xs">
                        {getVehicleName(booking.vehicleCategory)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50">Bagages</div>
                      <div className="font-medium text-white">{booking.luggage || '0'}</div>
                    </div>
                  </div>

                  {/* Payment info */}
                  {isPaid && booking.amountTotal ? (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-white/50">Montant payé</div>
                        <div className="font-medium text-green-500">{formatEuros(booking.amountTotal)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Payé le</div>
                        <div className="font-medium text-white text-xs">
                          {booking.paidAt && new Date(booking.paidAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ) : canPay ? (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/70">Prix estimé</div>
                        <div className="text-lg font-bold text-white">{estimatedPrice.toFixed(2)} €</div>
                        <div className="text-xs text-white/50 mt-1">Tarif final confirmé avant départ</div>
                      </div>
                      <button
                        onClick={() => handlePay(booking, estimatedPrice)}
                        disabled={paymentLoading === booking.id}
                        className="btn btn-primary"
                      >
                        {paymentLoading === booking.id ? 'Chargement...' : 'Payer maintenant'}
                      </button>
                    </div>
                  ) : null}

                  {booking.notes && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-sm text-white/60">
                      <span className="text-xs text-white/50">Notes: </span>
                      {booking.notes}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-white/40">
                    Réservé le {new Date(booking.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
