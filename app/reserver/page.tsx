'use client'
import { useState, useEffect, useMemo } from 'react'
import { VEHICLE_CATEGORIES } from '@/config/pricing'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Leaflet
const RouteMap = dynamic(() => import('@/components/ui/RouteMap'), { ssr: false })

type GeoLocation = { lat: number; lon: number; name: string }

export default function ReservationPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string>('')
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_CATEGORIES[1].id) // Moto Standard par défaut

  // Geolocation state
  const [geolocating, setGeolocating] = useState(false)
  const [pickup, setPickup] = useState<GeoLocation | null>(null)
  const [dropoff, setDropoff] = useState<GeoLocation | null>(null)
  const [pickupQuery, setPickupQuery] = useState('')
  const [dropoffQuery, setDropoffQuery] = useState('')
  const [pickupOptions, setPickupOptions] = useState<GeoLocation[]>([])
  const [dropoffOptions, setDropoffOptions] = useState<GeoLocation[]>([])

  // Form fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [passengers, setPassengers] = useState('1')
  const [luggage, setLuggage] = useState('0')
  const [notes, setNotes] = useState('')

  // Auto-detect user location on mount
  useEffect(() => {
    if (navigator.geolocation && !pickup) {
      handleGeolocate()
    }
  }, [])

  // Debounced search for pickup
  useEffect(() => {
    if (!pickupQuery || pickup) return
    const t = setTimeout(() => {
      fetch(`/api/geo?q=${encodeURIComponent(pickupQuery)}`)
        .then(r => r.json())
        .then(d => {
          const features = (d.features || []).map((f: any) => ({
            lat: f.lat,
            lon: f.lon,
            name: f.name,
          }))
          setPickupOptions(features)
        })
        .catch(() => setPickupOptions([]))
    }, 300)
    return () => clearTimeout(t)
  }, [pickupQuery, pickup])

  // Debounced search for dropoff
  useEffect(() => {
    if (!dropoffQuery || dropoff) return
    const t = setTimeout(() => {
      fetch(`/api/geo?q=${encodeURIComponent(dropoffQuery)}`)
        .then(r => r.json())
        .then(d => {
          const features = (d.features || []).map((f: any) => ({
            lat: f.lat,
            lon: f.lon,
            name: f.name,
          }))
          setDropoffOptions(features)
        })
        .catch(() => setDropoffOptions([]))
    }, 300)
    return () => clearTimeout(t)
  }, [dropoffQuery, dropoff])

  function handleGeolocate() {
    if (!navigator.geolocation) {
      alert("Votre navigateur ne supporte pas la géolocalisation")
      return
    }
    setGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(`/api/geo/reverse?lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          if (data.feature) {
            const loc: GeoLocation = {
              lat: data.feature.lat,
              lon: data.feature.lon,
              name: data.feature.name,
            }
            setPickup(loc)
            setPickupQuery(loc.name)
          }
        } catch {
          alert("Impossible de récupérer l'adresse")
        } finally {
          setGeolocating(false)
        }
      },
      () => {
        alert("Géolocalisation refusée ou impossible")
        setGeolocating(false)
      }
    )
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!pickup || !dropoff) {
      setError("Veuillez sélectionner un départ et une arrivée")
      return
    }
    setLoading(true)
    setError('')
    
    const data = {
      fullName,
      phone,
      email,
      date,
      time,
      pickup: pickup.name,
      dropoff: dropoff.name,
      passengers,
      luggage,
      notes,
      vehicleCategory: selectedVehicle,
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

      const result = await res.json()
      
      // Redirect to profile or login with booking info
      if (result.needsAuth) {
        // User not logged in - redirect to login with return URL
        window.location.href = `/connexion?redirect=profil&newBooking=${result.bookingId}`
      } else {
        // User logged in - redirect to profile to pay
        window.location.href = `/profil?newBooking=${result.bookingId}`
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  const mapOrigin = useMemo(() => pickup ? { lat: pickup.lat, lon: pickup.lon } : null, [pickup])
  const mapDest = useMemo(() => dropoff ? { lat: dropoff.lat, lon: dropoff.lon } : null, [dropoff])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Réservation</h1>

      {/* Map visualization */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Votre trajet</h3>
        <RouteMap origin={mapOrigin} destination={mapDest} height={300} />
        {!pickup && (
          <p className="text-sm text-white/60 mt-2">
            📍 Géolocalisez-vous pour voir votre trajet sur la carte
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="card grid gap-4 md:grid-cols-2">
        {/* Vehicle category selector */}
        <div className="md:col-span-2">
          <label className="flex flex-col gap-3">
            <span className="text-sm text-white/70 font-medium">Catégorie de véhicule souhaitée</span>
            <div className="grid gap-2">
              {VEHICLE_CATEGORIES.map((cat) => {
                const isSelected = selectedVehicle === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedVehicle(cat.id)}
                    className={`
                      relative text-left p-3 rounded-lg transition-all
                      ring-2 flex items-center gap-3
                      ${isSelected 
                        ? 'ring-brand-500 bg-brand-500/20' 
                        : 'ring-white/20 bg-white/5 hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="text-2xl">{cat.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{cat.name}</div>
                      <div className="text-xs text-white/50 mt-0.5">
                        Base: {cat.basePrice}€ · {cat.pricePerKm}€/km · Bagage: {cat.baggageFee}€
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Nom complet</span>
          <input 
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
            placeholder="Votre nom" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Email (optionnel)</span>
          <input 
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email" 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
            placeholder="vous@exemple.com" 
          />
        </label>

        {/* Pickup with geolocate button */}
        <div className="md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Départ</span>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  value={pickup ? pickup.name : pickupQuery}
                  onChange={e => {
                    setPickup(null)
                    setPickupQuery(e.target.value)
                  }}
                  required 
                  className="w-full rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
                  placeholder="Adresse de départ" 
                />
                {!!pickupOptions.length && !pickup && (
                  <ul className="absolute top-full mt-1 left-0 right-0 max-h-40 overflow-auto rounded-md bg-slate-900 border border-white/20 z-10">
                    {pickupOptions.map((opt, i) => (
                      <li
                        key={i}
                        className="p-2 hover:bg-white/10 cursor-pointer text-sm"
                        onClick={() => {
                          setPickup(opt)
                          setPickupQuery(opt.name)
                          setPickupOptions([])
                        }}
                      >
                        {opt.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={geolocating}
                className="btn btn-outline px-4 whitespace-nowrap"
              >
                {geolocating ? '📍...' : '📍 Me localiser'}
              </button>
            </div>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Arrivée</span>
            <div className="relative">
              <input 
                value={dropoff ? dropoff.name : dropoffQuery}
                onChange={e => {
                  setDropoff(null)
                  setDropoffQuery(e.target.value)
                }}
                required 
                className="w-full rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
                placeholder="Adresse d'arrivée" 
              />
              {!!dropoffOptions.length && !dropoff && (
                <ul className="absolute top-full mt-1 left-0 right-0 max-h-40 overflow-auto rounded-md bg-slate-900 border border-white/20 z-10">
                  {dropoffOptions.map((opt, i) => (
                    <li
                      key={i}
                      className="p-2 hover:bg-white/10 cursor-pointer text-sm"
                      onClick={() => {
                        setDropoff(opt)
                        setDropoffQuery(opt.name)
                        setDropoffOptions([])
                      }}
                    >
                      {opt.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Date</span>
          <input 
            value={date}
            onChange={e => setDate(e.target.value)}
            type="date" 
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Heure</span>
          <input 
            value={time}
            onChange={e => setTime(e.target.value)}
            type="time" 
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Téléphone</span>
          <input 
            value={phone}
            onChange={e => setPhone(e.target.value)}
            type="tel" 
            required 
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
            placeholder="06 xx xx xx xx" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Nombre de passagers</span>
          <input 
            value={passengers}
            onChange={e => setPassengers(e.target.value)}
            type="number" 
            min="1"
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Bagages</span>
          <input 
            value={luggage}
            onChange={e => setLuggage(e.target.value)}
            type="number" 
            min="0"
            className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" 
          />
        </label>
        <label className="md:col-span-2 flex flex-col gap-2">
          <span className="text-sm text-white/70">Notes additionnelles</span>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
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
