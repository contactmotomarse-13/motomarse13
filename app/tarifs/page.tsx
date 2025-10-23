'use client'
import { useState } from 'react'
import { Estimator } from '../../components/ui/Estimator'
import { VEHICLE_CATEGORIES, type VehicleCategory } from '@/config/pricing'

export default function TarifsPage() {
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>(VEHICLE_CATEGORIES[1]) // Moto Standard par défaut

  const lignes = [
    { label: 'Prise en charge', price: selectedCategory.basePrice },
    { label: 'Prix / km', price: selectedCategory.pricePerKm },
    { label: 'Attente (15 min)', price: 0 },
    { label: 'Bagage (unité)', price: selectedCategory.baggageFee },
  ]

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Tarifs</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Grille tarifaire</h2>
          <div className="mb-4 text-sm text-white/70">
            Catégorie : <span className="font-semibold text-brand-500">{selectedCategory.name}</span>
          </div>
          <ul className="space-y-3">
            {lignes.map((l) => (
              <li key={l.label} className="flex items-center justify-between">
                <span className="text-white/80">{l.label}</span>
                <span className="font-semibold">{l.price} €</span>
              </li>
            ))}
          </ul>
        </div>
        <Estimator onCategoryChange={setSelectedCategory} />
      </div>

      <p className="text-sm text-white/60">* Prix indicatifs, soumis aux conditions de circulation et aux horaires.</p>
    </div>
  )
}
