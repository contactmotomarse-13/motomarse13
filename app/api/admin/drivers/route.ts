import { NextResponse } from 'next/server'
import { getUsers } from '@/lib/db'

export async function GET() {
  try {
    const users = getUsers()
    const drivers = users
      .filter(u => (u.role || 'user') === 'driver')
      .map(({ password, ...rest }) => rest)

    return NextResponse.json({ drivers })
  } catch (error) {
    console.error('List drivers error:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement des chauffeurs' }, { status: 500 })
  }
}
