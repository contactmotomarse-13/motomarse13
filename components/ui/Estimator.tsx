"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react"

export type EstimatorProps = {
  basePrice?: number
  pricePerKm?: number
  baggageFee?: number
}

type GeoItem = { id: string | number; name: string; lat: number; lon: number }

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180
  const R = 6371 // km
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const la = toRad(a.lat)
  const lb = toRad(b.lat)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const h = sinDLat * sinDLat + Math.cos(la) * Math.cos(lb) * sinDLon * sinDLon
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function Estimator({ basePrice = 10, pricePerKm = 2, baggageFee = 3 }: EstimatorProps) {
  const [originQuery, setOriginQuery] = useState("")
  const [destQuery, setDestQuery] = useState("")
  const [originOptions, setOriginOptions] = useState<GeoItem[]>([])
  const [destOptions, setDestOptions] = useState<GeoItem[]>([])
  const [origin, setOrigin] = useState<GeoItem | null>(null)
  const [dest, setDest] = useState<GeoItem | null>(null)
  const [bags, setBags] = useState<number>(0)
  const [loadingOrigin, setLoadingOrigin] = useState(false)
  const [loadingDest, setLoadingDest] = useState(false)

  // debounce search
  useEffect(() => {
    if (!originQuery) return setOriginOptions([])
    const t = setTimeout(() => {
      setLoadingOrigin(true)
      fetch(`/api/geo?q=${encodeURIComponent(originQuery)}`)
        .then((r) => r.json())
        .then((d) => setOriginOptions(d.features || []))
        .catch(() => setOriginOptions([]))
        .finally(() => setLoadingOrigin(false))
    }, 300)
    return () => clearTimeout(t)
  }, [originQuery])

  useEffect(() => {
    if (!destQuery) return setDestOptions([])
    const t = setTimeout(() => {
      setLoadingDest(true)
      fetch(`/api/geo?q=${encodeURIComponent(destQuery)}`)
        .then((r) => r.json())
        .then((d) => setDestOptions(d.features || []))
        .catch(() => setDestOptions([]))
        .finally(() => setLoadingDest(false))
    }, 300)
    return () => clearTimeout(t)
  }, [destQuery])

  const clearOrigin = useCallback(() => {
    setOrigin(null)
    setOriginQuery("")
    setOriginOptions([])
  }, [])

  const clearDest = useCallback(() => {
    setDest(null)
    setDestQuery("")
    setDestOptions([])
  }, [])

  const distance = useMemo(() => {
    if (!origin || !dest) return 0
    return haversineKm({ lat: origin.lat, lon: origin.lon }, { lat: dest.lat, lon: dest.lon })
  }, [origin, dest])

  // Estimate duration using an average speed (city): ~25 km/h
  const AVG_SPEED_KMH = 25
  const durationMinutes = useMemo(() => {
    if (distance <= 0) return 0
    const mins = (distance / AVG_SPEED_KMH) * 60
    return Math.max(5, Math.round(mins))
  }, [distance])

  // Use the tariff 'Attente (15 min) = 8' => per-minute rate
  const WAIT_RATE_PER_MIN = 8 / 15

  const total = useMemo(() => {
    const ride = basePrice + distance * pricePerKm
    const timeCost = durationMinutes * WAIT_RATE_PER_MIN
    const extras = bags * baggageFee
    return Math.max(ride + timeCost + extras, basePrice)
  }, [basePrice, pricePerKm, distance, durationMinutes, bags, baggageFee])

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold">Simulateur express</h3>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Départ</span>
            <input
              value={origin ? origin.name : originQuery}
              onChange={(e) => {
                setOrigin(null)
                setOriginQuery(e.target.value)
              }}
              placeholder="Adresse de départ"
              className="rounded-xl bg-white/10 p-3 outline-none ring-1 ring-white/20"
            />
          </label>
          {loadingOrigin && <div className="text-sm text-white/60">Recherche…</div>}
          {!!originOptions.length && !origin && (
            <ul className="max-h-40 overflow-auto rounded-md bg-slate-900/60 p-2">
              {originOptions.map((o: GeoItem) => (
                <li
                  key={o.id}
                  className="p-2 hover:bg-white/5 rounded cursor-pointer"
                  onClick={() => {
                    setOrigin(o)
                    setOriginQuery(o.name)
                    setOriginOptions([])
                  }}
                >
                  {o.name}
                </li>
              ))}
            </ul>
          )}
          {origin && (
            <div className="text-sm text-white/60 flex items-center gap-2">
              <span>Choisi:</span>
              <span className="truncate">{origin.name}</span>
              <button className="ml-auto text-xs underline" onClick={clearOrigin}>
                Modifier
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Arrivée</span>
            <input
              value={dest ? dest.name : destQuery}
              onChange={(e) => {
                setDest(null)
                setDestQuery(e.target.value)
              }}
              placeholder="Adresse d’arrivée"
              className="rounded-xl bg-white/10 p-3 outline-none ring-1 ring-white/20"
            />
          </label>
          {loadingDest && <div className="text-sm text-white/60">Recherche…</div>}
          {!!destOptions.length && !dest && (
            <ul className="max-h-40 overflow-auto rounded-md bg-slate-900/60 p-2">
              {destOptions.map((o: GeoItem) => (
                <li
                  key={o.id}
                  className="p-2 hover:bg-white/5 rounded cursor-pointer"
                  onClick={() => {
                    setDest(o)
                    setDestQuery(o.name)
                    setDestOptions([])
                  }}
                >
                  {o.name}
                </li>
              ))}
            </ul>
          )}
          {dest && (
            <div className="text-sm text-white/60 flex items-center gap-2">
              <span>Choisi:</span>
              <span className="truncate">{dest.name}</span>
              <button className="ml-auto text-xs underline" onClick={clearDest}>
                Modifier
              </button>
            </div>
          )}
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Bagages</span>
          <input
            type="number"
            min={0}
            value={bags}
            onChange={(e) => setBags(Number(e.target.value))}
            className="rounded-xl bg-white/10 p-3 outline-none ring-1 ring-white/20"
          />
        </label>

        <div className="rounded-2xl bg-brand-500/20 p-4 ring-1 ring-brand-500/40">
          <p className="text-sm text-white/70">Estimation</p>
          <p className="text-2xl font-bold">{total.toFixed(2)} €</p>
          <p className="text-sm text-white/60 mt-2">
            {distance.toFixed(2)} km · ~{durationMinutes} min
          </p>
          <div className="mt-2 text-sm text-white/60">
            <div>Base: {basePrice}€</div>
            <div>Distance: {(distance * pricePerKm).toFixed(2)}€ ({pricePerKm}€/km)</div>
            <div>Temps estimé: {(durationMinutes * WAIT_RATE_PER_MIN).toFixed(2)}€</div>
            <div>Bagages: {(bags * baggageFee).toFixed(2)}€</div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-white/60">
        Base {basePrice}€ · {pricePerKm}€/km · Bagage {baggageFee}€
      </p>
    </div>
  )
}

