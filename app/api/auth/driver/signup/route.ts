import { NextResponse } from 'next/server'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'
import { getUserByEmail, createUser } from '@/lib/db'
import type { UserWithPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password, name, code } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, mot de passe et nom requis' }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ error: 'Code d\'invitation chauffeur requis' }, { status: 400 })
    }

    const requiredCode = process.env.DRIVER_SIGNUP_CODE
    if (!requiredCode) {
      return NextResponse.json({ error: 'Configuration serveur manquante (DRIVER_SIGNUP_CODE)' }, { status: 500 })
    }
    
    if (code !== requiredCode) {
      return NextResponse.json({ error: 'Code d\'invitation chauffeur invalide' }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Create driver user
    const hashedPassword = await hashPassword(password)
    const newUser: UserWithPassword = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'driver',
      createdAt: new Date().toISOString(),
    }

    const user = createUser(newUser)

    // Create token and set cookie
    const token = await createToken(user)
    await setAuthCookie(token)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Driver signup error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du compte chauffeur' }, { status: 500 })
  }
}
