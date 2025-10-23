import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getBookings } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    if ((user.role || 'user') !== 'driver') return NextResponse.json({ error: 'Accès réservé aux chauffeurs' }, { status: 403 })

    const all = getBookings()
    const bookings = all
      .filter(b => b.driverId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const stats = {
      totalTrips: bookings.length,
      totalEarningsPaid: bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + (b.amountDriver || 0), 0),
      unpaidTrips: bookings.filter(b => b.paymentStatus !== 'paid').length,
    }

    return NextResponse.json({ bookings, stats })
  } catch (error) {
    console.error('Driver bookings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
