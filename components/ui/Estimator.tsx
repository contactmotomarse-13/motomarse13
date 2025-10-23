"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { VEHICLE_CATEGORIES, type VehicleCategory, getPriceMultiplier, getPriceModifierLabel } from "@/config/pricing"

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

export type EstimatorProps = {
  onCategoryChange?: (category: VehicleCategory) => void
}

export function Estimator({ onCategoryChange }: EstimatorProps = {}) {
  // Vehicle category selection
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>(VEHICLE_CATEGORIES[1]) // default: Moto Standard

  // Notify parent when category changes
  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategory)
    }
  }, [selectedCategory, onCategoryChange])
  const [originQuery, setOriginQuery] = useState("")
  const [destQuery, setDestQuery] = useState("")
  const [originOptions, setOriginOptions] = useState<GeoItem[]>([])
  const [destOptions, setDestOptions] = useState<GeoItem[]>([])
  const [origin, setOrigin] = useState<GeoItem | null>(null)
  const [dest, setDest] = useState<GeoItem | null>(null)
  const [bags, setBags] = useState<number>(0)
  const [time, setTime] = useState<string>("")
  const [loadingOrigin, setLoadingOrigin] = useState(false)
  const [loadingDest, setLoadingDest] = useState(false)
  const [trafficData, setTrafficData] = useState<{
    trafficRatio: number
    trafficLevel: string
    surcharge: number
  } | null>(null)
  const [loadingTraffic, setLoadingTraffic] = useState(false)

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

  // Fetch traffic data when origin and dest are set
  useEffect(() => {
    if (!origin || !dest) {
      setTrafficData(null)
      return
    }

    setLoadingTraffic(true)
    fetch(`/api/traffic?origin=${encodeURIComponent(origin.name)}&destination=${encodeURIComponent(dest.name)}`)
      .then(r => r.json())
      .then(data => {
        if (data.trafficRatio) {
          setTrafficData({
            trafficRatio: data.trafficRatio,
            trafficLevel: data.trafficLevel,
            surcharge: data.surcharge,
          })
        }
      })
      .catch(err => {
        console.error('Error fetching traffic:', err)
        setTrafficData(null)
      })
      .finally(() => setLoadingTraffic(false))
  }, [origin, dest])

  // Estimate duration using an average speed (city): ~25 km/h
  const AVG_SPEED_KMH = 25
  const durationMinutes = useMemo(() => {
    if (distance <= 0) return 0
    const mins = (distance / AVG_SPEED_KMH) * 60
    return Math.max(5, Math.round(mins))
  }, [distance])

  const total = useMemo(() => {
    const ride = selectedCategory.basePrice + distance * selectedCategory.pricePerKm
    const extras = bags * selectedCategory.baggageFee
    let baseTotal = Math.max(ride + extras, selectedCategory.basePrice)
    
    // Apply time-based multiplier if time is set
    const timeMultiplier = time ? getPriceMultiplier(time) : 1
    baseTotal = baseTotal * timeMultiplier
    
    // Apply traffic surcharge if available
    const trafficMultiplier = trafficData ? (1 + trafficData.surcharge) : 1
    return baseTotal * trafficMultiplier
  }, [selectedCategory, distance, bags, time, trafficData])

  const priceModifierLabel = useMemo(() => {
    return time ? getPriceModifierLabel(time) : null
  }, [time])

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold">Simulateur de prix</h3>

      <div className="grid gap-6">
        {/* Vehicle category selector */}
        <div className="grid gap-3">
          <span className="text-sm text-white/70 font-medium">Choisissez votre véhicule</span>
          <div className="grid gap-2">
            {VEHICLE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.id === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat)
                    // Reset bags if exceeds new max
                    if (bags > cat.maxBags) setBags(cat.maxBags)
                  }}
                  className={`
                    relative text-left p-4 rounded-xl transition-all
                    ring-2
                    ${isSelected 
                      ? 'ring-brand-500 bg-brand-500/20' 
                      : 'ring-white/20 bg-white/5 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{cat.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-base">{cat.name}</div>
                      <div className="text-sm text-white/60 mt-1">{cat.description}</div>
                      <div className="text-xs text-white/50 mt-2">
                        Base: {cat.basePrice}€ · {cat.pricePerKm}€/km · Bagage: {cat.baggageFee}€
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs">
                          ✓
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Address inputs */}
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
                placeholder="Adresse d'arrivée"
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

          {/* Baggage selector adapted to category */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Options bagage</span>
            <div className="grid gap-2">
              {selectedCategory.baggageOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                    ${bags === option.value 
                      ? 'bg-brand-500/20 ring-2 ring-brand-500' 
                      : 'bg-white/5 ring-1 ring-white/20 hover:bg-white/10'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="bags"
                    value={option.value}
                    checked={bags === option.value}
                    onChange={() => setBags(option.value)}
                    className="w-4 h-4"
                  />
                  <span className="flex-1">{option.label}</span>
                  {option.value > 0 && (
                    <span className="text-sm text-white/60">
                      +{(option.value * selectedCategory.baggageFee).toFixed(0)}€
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Time selector for dynamic pricing */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Heure du trajet (optionnel)</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl bg-white/10 p-3 outline-none ring-1 ring-white/20"
              placeholder="HH:MM"
            />
            <span className="text-xs text-white/50">
              Tarif nuit +20% (22h-6h)
            </span>
          </div>
        </div>

        {/* Price estimate */}
        <div className="rounded-2xl bg-brand-500/20 p-4 ring-1 ring-brand-500/40">
          <p className="text-sm text-white/70">Estimation du prix</p>
          <p className="text-3xl font-bold mt-1">{total.toFixed(2)} €</p>
          {priceModifierLabel && (
            <p className="text-sm text-orange-400 font-medium mt-1">{priceModifierLabel}</p>
          )}
          {trafficData && trafficData.surcharge > 0 && (
            <p className="text-sm text-red-400 font-medium mt-1">
              {trafficData.trafficLevel} (+{Math.round(trafficData.surcharge * 100)}%)
            </p>
          )}
          {loadingTraffic && (
            <p className="text-sm text-blue-400 mt-1">Analyse du trafic en cours...</p>
          )}
          <p className="text-sm text-white/60 mt-2">
            {distance.toFixed(1)} km · ~{durationMinutes} min
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 text-sm text-white/60 grid gap-1">
            <div className="flex justify-between">
              <span>Base ({selectedCategory.name})</span>
              <span>{selectedCategory.basePrice.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span>Distance ({distance.toFixed(1)} km × {selectedCategory.pricePerKm}€)</span>
              <span>{(distance * selectedCategory.pricePerKm).toFixed(2)}€</span>
            </div>
            {bags > 0 && (
              <div className="flex justify-between">
                <span>Bagages ({bags} × {selectedCategory.baggageFee}€)</span>
                <span>{(bags * selectedCategory.baggageFee).toFixed(2)}€</span>
              </div>
            )}
            {priceModifierLabel && (
              <div className="flex justify-between text-orange-400">
                <span>Majoration nuit (22h-6h)</span>
                <span>+20%</span>
              </div>
            )}
            {trafficData && trafficData.surcharge > 0 && (
              <div className="flex justify-between text-red-400">
                <span>{trafficData.trafficLevel}</span>
                <span>+{Math.round(trafficData.surcharge * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-white/50 text-center">
        Prix indicatif basé sur la distance et le temps estimé. Tarif final confirmé avant départ.
      </p>
    </div>
  )
}

