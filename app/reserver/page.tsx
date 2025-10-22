'use client'
import { useState } from 'react'

export default function ReservationPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string>('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Get form data
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const data = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      pickup: formData.get('pickup') as string,
      dropoff: formData.get('dropoff') as string,
      passengers: formData.get('passengers') as string,
      luggage: formData.get('luggage') as string,
      notes: formData.get('notes') as string,
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erreur lors de l\'envoi')
      }

      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Réservation</h1>
      <form onSubmit={onSubmit} className="card grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Nom complet</span>
          <input 
            name="fullName"
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
            placeholder="Votre nom" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Email (optionnel)</span>
          <input 
            name="email"
            type="email" 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
            placeholder="vous@exemple.com" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Départ</span>
          <input 
            name="pickup"
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
            placeholder="Adresse de départ" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Arrivée</span>
          <input 
            name="dropoff"
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
            placeholder="Adresse d'arrivée" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Date</span>
          <input 
            name="date"
            type="date" 
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Heure</span>
          <input 
            name="time"
            type="time" 
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Téléphone</span>
          <input 
            name="phone"
            type="tel" 
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
            placeholder="06 xx xx xx xx" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Nombre de passagers</span>
          <input 
            name="passengers"
            type="number" 
            min="1"
            defaultValue="1"
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Bagages</span>
          <input 
            name="luggage"
            type="number" 
            min="0"
            defaultValue="0"
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
          />
        </label>
        <label className="md:col-span-2 flex flex-col gap-2">
          <span className="text-sm text-white/70">Notes additionnelles</span>
          <textarea
            name="notes"
            rows={3}
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20"
            placeholder="Informations complémentaires pour votre trajet..."
          />
        </label>
        
        {error && (
          <div className="md:col-span-2 rounded-xl bg-red-500/10 p-3 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="md:col-span-2">
          <button disabled={loading || sent} className="btn btn-primary w-full">
            {sent ? 'Demande envoyée ✅' : loading ? 'Envoi…' : 'Envoyer la demande'}
          </button>
        </div>
      </form>
      
      {!sent && (
        <p className="text-sm text-white/60">
          Vos données sont utilisées uniquement pour traiter votre demande de réservation.
        </p>
      )}
      
      {sent && (
        <div className="rounded-xl bg-green-500/10 p-4 text-green-500">
          <p className="font-medium">Demande envoyée avec succès !</p>
          <p className="text-sm mt-1">Nous vous contacterons rapidement pour confirmer votre réservation.</p>
        </div>
      )}
    </div>
  )
}
