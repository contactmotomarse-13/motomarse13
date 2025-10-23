# Configuration Google Maps API pour trafic en temps réel

## 1. Créer un compte Google Cloud Platform

1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet (ex: "Moto Marse")
3. Activez la facturation (nécessaire mais **gratuit jusqu'à 40 000 requêtes/mois**)

## 2. Activer les APIs nécessaires

1. Dans le menu, allez dans **APIs & Services** → **Library**
2. Recherchez et activez :
   - **Distance Matrix API** (pour le trafic en temps réel)
   - **Geocoding API** (optionnel, si besoin)

## 3. Créer une clé API

1. Allez dans **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **API Key**
3. Une clé sera générée (commence par `AIza...`)
4. **Important** : Cliquez sur **Restrict Key** pour sécuriser :
   - Application restrictions : **HTTP referrers**
   - Ajouter : `localhost:*` et votre domaine en production
   - API restrictions : Sélectionnez **Distance Matrix API**

## 4. Configurer dans l'application

Copiez votre clé API dans `.env.local` :

```bash
GOOGLE_MAPS_API_KEY=AIzaSy...votre_clé_ici
```

Redémarrez votre serveur Next.js :

```bash
npm run dev
```

## 5. Comment ça fonctionne

### Calcul du trafic

L'API Google Maps retourne :
- **duration** : Temps de trajet normal (sans trafic)
- **duration_in_traffic** : Temps de trajet avec trafic actuel

**Ratio de trafic** = `duration_in_traffic / duration`

### Majorations appliquées

| Ratio | Condition | Majoration | Label |
|-------|-----------|------------|-------|
| ≥ 1.5 | Trafic 1.5x plus lent | **+30%** | Trafic très dense |
| ≥ 1.3 | Trafic 1.3x plus lent | **+20%** | Trafic dense |
| ≥ 1.15 | Trafic 1.15x plus lent | **+10%** | Trafic modéré |
| < 1.15 | Trafic fluide | **0%** | Trafic fluide |

### Cumul avec tarif nuit

Les majorations se **multiplient** :
- Prix de base : 30€
- Tarif nuit (23h00) : **+20%** → 36€
- Trafic dense : **+20%** → 43.20€ (36€ × 1.20)

## 6. Tarifs Google Maps

- **Gratuit** : 40 000 requêtes/mois (environ 1 300/jour)
- Au-delà : 0.005$ par requête (5$ pour 1000 requêtes)
- **Crédit gratuit** : 200$/mois offert par Google

Pour une petite application, c'est **totalement gratuit**.

## 7. Tester

1. Allez sur http://localhost:3002/tarifs
2. Entrez un départ et une arrivée
3. Le système :
   - Calcule automatiquement le trafic en temps réel
   - Affiche "Analyse du trafic en cours..."
   - Applique la majoration selon le niveau de trafic
   - Affiche le label (ex: "Trafic dense (+20%)")

## 8. Fallback sans clé API

Si aucune clé n'est configurée :
- Le système fonctionne normalement
- Pas de majoration trafic (ratio = 1.0)
- Seule la majoration nuit s'applique

## 9. Modifier les seuils de majoration

Dans `config/pricing.ts` :

```typescript
trafficSurcharges: [
  { minRatio: 1.5, surcharge: 0.40, label: 'Trafic très dense' }, // +40%
  { minRatio: 1.3, surcharge: 0.25, label: 'Trafic dense' },      // +25%
  { minRatio: 1.15, surcharge: 0.15, label: 'Trafic modéré' },    // +15%
  { minRatio: 1.0, surcharge: 0, label: 'Trafic fluide' },
]
```

## Liens utiles

- Google Cloud Console : https://console.cloud.google.com/
- Documentation Distance Matrix : https://developers.google.com/maps/documentation/distance-matrix
- Tarifs : https://developers.google.com/maps/billing-and-pricing/pricing
