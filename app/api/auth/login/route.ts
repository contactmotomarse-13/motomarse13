import { NextResponse } from 'next/server'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'
import { getUserByEmail } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    // Find user
    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Create token and set cookie
    const token = await createToken(userWithoutPassword)
    await setAuthCookie(token)

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 })
  }
}
