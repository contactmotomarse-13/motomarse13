// config/pricing.ts

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
  { from: "Gare Saint-Charles", to: "Porte d’Aix", price: "€15" },
  { from: "La Joliette", to: "Prado", price: "€24" },
];
// 👉 Tu changes les prix/libellés ici quand tu veux.

