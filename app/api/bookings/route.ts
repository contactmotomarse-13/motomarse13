import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getBookingsByUserId } from '@/lib/db'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const bookings = getBookingsByUserId(user.id)
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
