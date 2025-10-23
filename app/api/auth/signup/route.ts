import { NextResponse } from 'next/server'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'
import { getUserByEmail, createUser } from '@/lib/db'
import type { UserWithPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, mot de passe et nom requis' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 })
    }

    // Create user
    const hashedPassword = await hashPassword(password)
    const newUser: UserWithPassword = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    const user = createUser(newUser)

    // Create token and set cookie
    const token = await createToken(user)
    await setAuthCookie(token)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du compte' }, { status: 500 })
  }
}
