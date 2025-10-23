"use client"
import React, { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import type { LatLngExpression, PathOptions } from "leaflet"

// Dynamic import react-leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then(m => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import("react-leaflet").then(m => m.TileLayer),
  { ssr: false }
)
const Polyline = dynamic(
  () => import("react-leaflet").then(m => m.Polyline),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import("react-leaflet").then(m => m.CircleMarker),
  { ssr: false }
)

export type LatLng = { lat: number; lon: number }

export type RouteMapProps = {
  origin?: LatLng | null
  destination?: LatLng | null
  height?: number | string
}

// Helper to convert OSRM GeoJSON coordinates [lon, lat] to Leaflet [lat, lon]
function toLatLngCoords(geo: number[][]): LatLngExpression[] {
  return geo.map(([x, y]) => [y, x] as LatLngExpression)
}

export default function RouteMap({ origin, destination, height = 260 }: RouteMapProps) {
  const [polyline, setPolyline] = useState<LatLngExpression[]>([])

  const center = useMemo<LatLngExpression>(() => {
    if (origin) return [origin.lat, origin.lon]
    return [43.2965, 5.3698] // Marseille par défaut
  }, [origin])

  useEffect(() => {
    setPolyline([])
    if (!origin || !destination) return

    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data?.routes?.[0]?.geometry?.coordinates) {
          const coords = toLatLngCoords(data.routes[0].geometry.coordinates)
          setPolyline(coords)
        }
      })
      .catch(() => setPolyline([]))
  }, [origin, destination])

  const greenPathOptions: PathOptions = { color: '#10b981' }
  const redPathOptions: PathOptions = { color: '#ef4444' }
  const bluePathOptions: PathOptions = { color: '#3b82f6', weight: 4, opacity: 0.8 }

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-white/20" style={{ height }}>
      {/* CSS for Leaflet is imported globally in app/globals.css */}
      <MapContainer center={center as any} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {origin && (
          <CircleMarker center={[origin.lat, origin.lon] as any} pathOptions={greenPathOptions} radius={8} />
        )}
        {destination && (
          <CircleMarker center={[destination.lat, destination.lon] as any} pathOptions={redPathOptions} radius={8} />
        )}
        {!!polyline.length && (
          <Polyline positions={polyline as any} pathOptions={bluePathOptions} />
        )}
      </MapContainer>
    </div>
  )
}
