// config/pricing.ts

// Catégories de véhicules avec tarification et options bagage
export type VehicleCategory = {
  id: string
  name: string
  description: string
  icon: string // emoji ou classe icon
  basePrice: number // prix de base
  pricePerKm: number // prix au kilomètre
  maxBags: number // nombre max de bagages autorisés
  baggageFee: number // coût par bagage
  baggageOptions: { label: string; value: number }[]
}

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: 'scooter',
    name: 'Scooter 125+',
    description: 'Trajets urbains rapides, petit bagage seulement',
    icon: '🛵',
    basePrice: 7,
    pricePerKm: 1.3,
    maxBags: 1,
    baggageFee: 2,
    baggageOptions: [
      { label: 'Sans bagage', value: 0 },
      { label: 'Petit bagage', value: 1 },
    ],
  },
  {
    id: 'standard',
    name: 'Moto Standard 600-900cc',
    description: 'Confort standard, bagage cabine autorisé',
    icon: '🏍️',
    basePrice: 10,
    pricePerKm: 1.8,
    maxBags: 2,
    baggageFee: 3,
    baggageOptions: [
      { label: 'Sans bagage', value: 0 },
      { label: '1 bagage cabine', value: 1 },
      { label: '2 bagages cabine', value: 2 },
    ],
  },
  {
    id: 'touring',
    name: 'Moto GT / Touring',
    description: 'BMW R1250RT / Honda Gold Wing - Grand confort, grande valise possible',
    icon: '🏍️✨',
    basePrice: 14,
    pricePerKm: 2.2,
    maxBags: 3,
    baggageFee: 4,
    baggageOptions: [
      { label: 'Sans bagage', value: 0 },
      { label: '1 bagage cabine', value: 1 },
      { label: '2 bagages cabine', value: 2 },
      { label: 'Bagage cabine + grande valise', value: 3 },
    ],
  },
]

// Cartes "règles générales" si tu veux les garder
export const PRICING = [
  { title: "Ville ↔ Aéroport MRS", price: "€62", desc: "Prix indicatif, confirmé avant départ." },
  { title: "Attente", price: "€15 / 15 min", desc: "Premières 5 minutes incluses." },
];

// 👉 Trajets classiques (affichés avec un bouton Réserver)
export const CLASSIC_ROUTES = [
  { from: "Aéroport MRS", to: "Gare Saint-Charles", price: "€62" },
  { from: "Vieux-Port", to: "Aéroport MRS", price: "€55" },
  { from: "Castellane", to: "Pointe Rouge", price: "€28" },
  { from: "Gare Saint-Charles", to: "Porte d'Aix", price: "€15" },
  { from: "La Joliette", to: "Prado", price: "€24" },
];
// 👉 Tu changes les prix/libellés ici quand tu veux.

// Tarification dynamique
export const PRICING_MODIFIERS = {
  nightSurcharge: 0.20, // +20% entre 22h et 6h
  nightStartHour: 22, // Début tarif nuit (22h)
  nightEndHour: 6, // Fin tarif nuit (6h)
  
  // Majoration selon le trafic (basé sur duration_in_traffic de Google Maps)
  // Ratio = (durée avec trafic) / (durée sans trafic)
  trafficSurcharges: [
    { minRatio: 1.5, surcharge: 0.30, label: 'Trafic très dense' }, // +30% si 1.5x plus lent
    { minRatio: 1.3, surcharge: 0.20, label: 'Trafic dense' },      // +20% si 1.3x plus lent
    { minRatio: 1.15, surcharge: 0.10, label: 'Trafic modéré' },   // +10% si 1.15x plus lent
    { minRatio: 1.0, surcharge: 0, label: 'Trafic fluide' },        // Pas de majoration
  ],
}

// Fonction pour calculer le coefficient multiplicateur selon l'heure
export function getPriceMultiplier(time: string): number {
  // time format: "HH:MM"
  const [hours] = time.split(':').map(Number)
  
  // Vérifier si c'est l'heure de nuit (22h-6h)
  const isNightTime = hours >= PRICING_MODIFIERS.nightStartHour || hours < PRICING_MODIFIERS.nightEndHour
  
  return isNightTime ? 1 + PRICING_MODIFIERS.nightSurcharge : 1
}

// Fonction pour obtenir le label de majoration
export function getPriceModifierLabel(time: string): string | null {
  const multiplier = getPriceMultiplier(time)
  if (multiplier > 1) {
    return `Tarif nuit (+${Math.round((multiplier - 1) * 100)}%)`
  }
  return null
}

// Fonction pour calculer la majoration due au trafic
export function getTrafficSurcharge(trafficRatio: number): { surcharge: number; label: string } {
  // Trouver la majoration appropriée selon le ratio
  const modifier = PRICING_MODIFIERS.trafficSurcharges.find(t => trafficRatio >= t.minRatio)
  return modifier || { surcharge: 0, label: 'Trafic fluide' }
}

