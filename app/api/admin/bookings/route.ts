import { NextResponse } from 'next/server'
import { getBookings } from '@/lib/db'

// TODO: Add admin authentication here
export async function GET() {
  try {
    const bookings = getBookings()
    // Sort by date (most recent first)
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
