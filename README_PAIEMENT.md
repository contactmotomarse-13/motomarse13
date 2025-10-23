# Configuration du système de paiement

## Vue d'ensemble

Le système de paiement permet aux clients de payer leurs trajets en ligne via Stripe. La plateforme reçoit le paiement total et reverse automatiquement un pourcentage au chauffeur.

### Commission configurée
- **Plateforme** : 20% du montant total
- **Chauffeur** : 80% du montant total

Vous pouvez modifier ce pourcentage dans `lib/payment.ts` :
```typescript
export const PLATFORM_COMMISSION_PERCENT = 20 // Modifier ici
```

---

## Configuration Stripe

### 1. Créer un compte Stripe

1. Allez sur https://stripe.com
2. Créez un compte (utilisez le mode Test pour commencer)
3. Une fois connecté, allez dans **Developers** → **API keys**

### 2. Récupérer vos clés

Vous aurez besoin de 3 clés :

#### a) Clé publique (Publishable key)
- Commence par `pk_test_...` (mode test) ou `pk_live_...` (production)
- Visible par le client (frontend)

#### b) Clé secrète (Secret key)
- Commence par `sk_test_...` (mode test) ou `sk_live_...` (production)
- **NE JAMAIS partager publiquement**

#### c) Webhook secret
- Commence par `whsec_...`
- Pour recevoir les confirmations de paiement

### 3. Configurer le fichier .env.local

Remplacez les valeurs dans `.env.local` :

```bash
# Stripe Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLIQUE_ICI
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET_ICI
```

### 4. Configurer le Webhook Stripe

**En développement local** :

1. Installez Stripe CLI : https://stripe.com/docs/stripe-cli
2. Connectez-vous : `stripe login`
3. Lancez le webhook forwarding :
   ```bash
   stripe listen --forward-to localhost:3001/api/payment/webhook
   ```
4. Copiez le webhook secret qui s'affiche (`whsec_...`) dans `.env.local`

**En production** :

1. Allez dans **Developers** → **Webhooks** sur Stripe Dashboard
2. Cliquez sur **Add endpoint**
3. URL : `https://votredomaine.com/api/payment/webhook`
4. Événements à écouter : `checkout.session.completed`
5. Copiez le webhook secret dans vos variables d'environnement de production

---

## Fonctionnement

### Flux de paiement

1. **Client crée une réservation** → Statut : "En attente", Paiement : "Non payé"
2. **Client clique sur "Payer maintenant"** dans son profil
3. **Redirection vers Stripe Checkout** (page de paiement sécurisée)
4. **Client entre ses informations de carte**
5. **Stripe traite le paiement**
6. **Webhook Stripe notifie notre serveur** du paiement réussi
7. **Notre serveur met à jour la réservation** :
   - Statut → "Confirmée"
   - Paiement → "Payé"
   - Stocke les montants (total, commission plateforme, part chauffeur)
8. **Client est redirigé vers son profil** avec confirmation de paiement

### Calcul automatique des commissions

Quand un paiement est confirmé, le système calcule automatiquement :

**Exemple avec un trajet de 50€** :
- Montant total : 50,00 €
- Commission plateforme (20%) : 10,00 €
- Part chauffeur (80%) : 40,00 €

Ces montants sont stockés dans la base de données et visibles dans le dashboard admin.

---

## Utilisation

### Pour le client

1. **Créer un compte** ou se connecter
2. **Faire une réservation** (catégorie de véhicule, date, adresses)
3. **Aller sur "Mon profil"**
4. **Cliquer sur "Payer maintenant"** sur la réservation souhaitée
5. **Payer via Stripe Checkout**
6. **Confirmation automatique** après paiement réussi

### Pour l'admin (vous)

1. **Accéder au dashboard** : http://localhost:3001/admin/paiements
2. **Voir toutes les réservations** avec statuts de paiement
3. **Statistiques en temps réel** :
   - Nombre de paiements reçus
   - Chiffre d'affaires total
   - Commission plateforme à garder
   - Montant à verser aux chauffeurs
4. **Filtrer** : Toutes / Payées / Non payées
5. **Tableau détaillé** par réservation

---

## Test en mode développement

### Cartes de test Stripe

Utilisez ces numéros de carte pour tester :

**Paiement réussi** :
- Numéro : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : n'importe quel 3 chiffres

**Paiement refusé** :
- Numéro : `4000 0000 0000 0002`

Plus de cartes de test : https://stripe.com/docs/testing

### Scénario de test complet

1. Créez un compte sur http://localhost:3001/inscription
2. Faites une réservation sur http://localhost:3001/reserver
3. Allez sur http://localhost:3001/profil
4. Cliquez sur "Payer maintenant"
5. Utilisez la carte `4242 4242 4242 4242`
6. Confirmez le paiement
7. Vérifiez que :
   - La réservation passe à "Confirmée"
   - Le badge "Payé" apparaît
   - Le montant payé est affiché
8. Allez sur http://localhost:3001/admin/paiements
9. Vérifiez que les statistiques sont mises à jour

---

## Sécurité

✅ **Ce qui est sécurisé** :
- Les informations de carte ne passent jamais par votre serveur
- Stripe gère tout le processus de paiement (conforme PCI DSS)
- Les webhooks sont signés et vérifiés
- Les clés secrètes ne sont jamais exposées au client

⚠️ **À faire en production** :
- Utilisez les clés `pk_live_...` et `sk_live_...`
- Activez HTTPS (obligatoire pour Stripe)
- Configurez le webhook en production avec la bonne URL
- Ne committez JAMAIS vos clés dans Git

---

## Versement aux chauffeurs

**Actuellement** : Le système calcule et affiche les montants à verser, mais vous devez faire les virements manuellement.

**Pour automatiser** (avancé) :
- Utilisez Stripe Connect pour créer des comptes chauffeurs
- Les paiements seront automatiquement répartis
- Documentation : https://stripe.com/docs/connect

---

## Support

Pour toute question sur Stripe :
- Documentation : https://stripe.com/docs
- Dashboard : https://dashboard.stripe.com
- Support : https://support.stripe.com

---

## Fichiers importants

- `app/api/payment/create-checkout/route.ts` - Création session Stripe
- `app/api/payment/webhook/route.ts` - Réception confirmations
- `app/profil/page.tsx` - Bouton "Payer" pour les clients
- `app/admin/paiements/page.tsx` - Dashboard admin
- `lib/payment.ts` - Configuration commission (20%)
- `lib/db.ts` - Schéma avec champs paiement
