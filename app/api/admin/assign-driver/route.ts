import { NextResponse } from 'next/server'
import { getBookingById, getUserById, getBookings, saveBookings } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { bookingId, driverId } = await req.json()

    if (!bookingId || !driverId) {
      return NextResponse.json({ error: 'bookingId et driverId requis' }, { status: 400 })
    }

    const booking = getBookingById(bookingId)
    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    const driver = getUserById(driverId)
    if (!driver || (driver.role || 'user') !== 'driver') {
      return NextResponse.json({ error: 'Chauffeur introuvable' }, { status: 404 })
    }

    const bookings = getBookings()
    const idx = bookings.findIndex(b => b.id === bookingId)
    if (idx === -1) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    bookings[idx] = { ...bookings[idx], driverId }
    saveBookings(bookings)

    return NextResponse.json({ success: true, booking: bookings[idx] })
  } catch (error) {
    console.error('Assign driver error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
