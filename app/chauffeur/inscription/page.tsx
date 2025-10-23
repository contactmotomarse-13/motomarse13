'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChauffeurInscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password,
      code: formData.get('code') as string | undefined,
    }

    try {
      const res = await fetch('/api/auth/driver/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur lors de la création du compte chauffeur')

      router.push('/chauffeur')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte chauffeur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Créer un compte Chauffeur</h1>
        <p className="text-white/60 mt-2">Rejoignez Moto Marse en tant que chauffeur</p>
      </div>

      <form onSubmit={onSubmit} className="card grid gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Nom complet</span>
          <input name="name" type="text" required className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" placeholder="Jean Dupont" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Email</span>
          <input name="email" type="email" required className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" placeholder="vous@exemple.com" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Mot de passe</span>
          <input name="password" type="password" required minLength={6} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" placeholder="••••••••" />
          <span className="text-xs text-white/50">Minimum 6 caractères</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Confirmer le mot de passe</span>
          <input name="confirmPassword" type="password" required minLength={6} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" placeholder="••••••••" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Code d'invitation chauffeur *</span>
          <input name="code" type="text" required className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" placeholder="Entrez le code fourni par Moto Marse" />
          <span className="text-xs text-white/50">Code requis pour devenir chauffeur partenaire</span>
        </label>

        {error && <div className="rounded-xl bg-red-500/10 p-3 text-red-500 text-sm">{error}</div>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Création...' : 'Créer mon compte chauffeur'}
        </button>

        <p className="text-sm text-white/60 text-center">
          Déjà un compte ?{' '}
          <Link href="/chauffeur/connexion" className="text-brand-500 hover:underline">Se connecter</Link>
        </p>
      </form>
    </div>
  )
}
