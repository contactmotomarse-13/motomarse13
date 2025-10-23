'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ConnexionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Erreur de connexion')
      }

      // Redirect to profile
      router.push('/profil')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="text-white/60 mt-2">Connectez-vous à votre compte</p>
      </div>

      <form onSubmit={onSubmit} className="card grid gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20"
            placeholder="vous@exemple.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <div className="rounded-xl bg-red-500/10 p-3 text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <p className="text-sm text-white/60 text-center">
          Pas encore de compte client ?{' '}
          <Link href="/inscription" className="text-brand-500 hover:underline">
            Créer un compte client
          </Link>
        </p>

        <div className="text-xs text-white/50 text-center">
          Espace Chauffeur: {' '}
          <Link href="/chauffeur/connexion" className="text-brand-500 hover:underline">Se connecter</Link>
          {' '}•{' '}
          <Link href="/chauffeur/inscription" className="text-brand-500 hover:underline">Créer un compte chauffeur</Link>
        </div>
      </form>
    </div>
  )
}
