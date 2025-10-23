# Deployment Guide - Moto Marse

## 📦 Publication sur Internet (Vercel - Gratuit)

### Étape 1: Préparer le projet

1. **Créer un compte GitHub** (si vous n'en avez pas)
   - Allez sur https://github.com/signup
   - Créez votre compte gratuitement

2. **Initialiser Git localement**
   ```bash
   cd /Users/augustin_bertholon/Downloads/motomars-main
   git init
   git add .
   git commit -m "Initial commit - Moto Marse app"
   ```

3. **Créer un repository GitHub**
   - Allez sur https://github.com/new
   - Nom: `motomarse-app`
   - Public ou Private (au choix)
   - Ne cochez RIEN (pas de README, .gitignore, etc.)
   - Cliquez "Create repository"

4. **Pousser le code sur GitHub**
   ```bash
   git remote add origin https://github.com/VOTRE_USERNAME/motomarse-app.git
   git branch -M main
   git push -u origin main
   ```

### Étape 2: Déployer sur Vercel

1. **Créer un compte Vercel**
   - Allez sur https://vercel.com/signup
   - Connectez-vous avec votre compte GitHub
   - Autorisez Vercel à accéder à vos repositories

2. **Importer le projet**
   - Cliquez "Add New..." → "Project"
   - Sélectionnez votre repository `motomarse-app`
   - Cliquez "Import"

3. **Configurer les variables d'environnement**
   Dans Vercel, avant de déployer, ajoutez ces variables:
   
   ```
   JWT_SECRET=CHANGEZ_CETTE_CLE_PAR_UNE_ALEATOIRE_LONGUE_64_CARACTERES
   DRIVER_SIGNUP_CODE=MOTOMARSE2025
   GOOGLE_MAPS_API_KEY=AIzaSyBVV1w-MYjBFbOKgDpMa1hRUF5pGg39O2Y
   RESEND_API_KEY=re_T8xUd4MQ_GXJyozGFpS8mST5qhofQawB3
   BOOKING_EMAIL_TO=contact.motomarse@gmail.com
   BOOKING_EMAIL_FROM=Moto Marse <noreply@motomarse.vercel.app>
   NOMINATIM_EMAIL=contact.motomarse@gmail.com
   ```

   **IMPORTANT - Clés Stripe:**
   ```
   # Mode TEST (pour commencer):
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_STRIPE_PUBLISHABLE
   STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_STRIPE_SECRET
   
   # Plus tard en PRODUCTION (vrais paiements):
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_VOTRE_CLE
   STRIPE_SECRET_KEY=sk_live_VOTRE_CLE
   STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_PRODUCTION
   ```

4. **Déployer**
   - Cliquez "Deploy"
   - Attendez 2-3 minutes
   - Votre site sera en ligne sur: `https://motomarse-app.vercel.app`

### Étape 3: Configurer Stripe Webhook (Production)

1. **Allez sur Stripe Dashboard**
   - https://dashboard.stripe.com/webhooks

2. **Créer un nouveau webhook**
   - Cliquez "Add endpoint"
   - URL: `https://VOTRE-DOMAINE.vercel.app/api/payment/webhook`
   - Events: Sélectionnez `checkout.session.completed`
   - Cliquez "Add endpoint"

3. **Copier le signing secret**
   - Cliquez sur le webhook créé
   - Copiez le `Signing secret` (commence par `whsec_`)
   - Ajoutez-le dans Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`

4. **Redéployer**
   - Dans Vercel: Deployments → ... → Redeploy

### Étape 4: Domaine personnalisé (Optionnel)

1. **Acheter un domaine** (ex: motomarse.fr sur OVH, Namecheap, etc.)

2. **Dans Vercel**
   - Settings → Domains
   - Ajouter votre domaine: `motomarse.fr`
   - Suivre les instructions DNS

3. **Mettre à jour les URLs**
   - Modifier `.env.production`: `NEXT_PUBLIC_APP_URL=https://motomarse.fr`
   - Stripe webhook: Changer l'URL vers `https://motomarse.fr/api/payment/webhook`

### Étape 5: Tester l'application en ligne

#### Tests essentiels:

1. **Homepage**: `https://votre-site.vercel.app`
2. **Géolocalisation**: `/reserver` → Autoriser localisation
3. **Carte**: Vérifier que la carte s'affiche
4. **Réservation**: Faire une vraie réservation test
5. **Paiement**: Tester avec carte test Stripe:
   - Numéro: `4242 4242 4242 4242`
   - Date: n'importe quelle date future
   - CVC: n'importe quel 3 chiffres
6. **PWA**: Sur mobile, cliquer "Ajouter à l'écran d'accueil"
7. **Admin**: `/admin/paiements` → Vérifier les revenus

### Étape 6: Mode Production Stripe (Vrais paiements)

⚠️ **Attendez d'avoir bien testé avant d'activer les vrais paiements!**

1. **Activer votre compte Stripe**
   - Remplir les informations légales
   - Vérifier votre identité
   - Configurer le compte bancaire

2. **Basculer vers les clés Live**
   - Dashboard Stripe → Developers → API keys
   - Copier `pk_live_...` et `sk_live_...`
   - Mettre à jour dans Vercel (variables d'environnement)

3. **Webhook production**
   - Créer un nouveau webhook avec l'URL production
   - Copier le nouveau `whsec_...`

4. **Redéployer**

## 🎉 Félicitations!

Votre application est maintenant:
- ✅ En ligne 24/7
- ✅ Accessible depuis n'importe où
- ✅ Installable comme une app (PWA)
- ✅ Avec géolocalisation et carte
- ✅ Paiements sécurisés Stripe
- ✅ Dashboard admin fonctionnel
- ✅ Tarifs dynamiques (nuit + trafic)

## 📱 Installation PWA

### Sur Android (Chrome):
1. Ouvrir le site
2. Menu (⋮) → "Installer l'application"
3. Accepter

### Sur iOS (Safari):
1. Ouvrir le site
2. Bouton Partage (□↑)
3. "Sur l'écran d'accueil"
4. Ajouter

## 🔄 Mises à jour

Pour mettre à jour votre site:
```bash
git add .
git commit -m "Description des changements"
git push
```
→ Vercel redéploie automatiquement en 2 minutes!

## 💰 Coûts

- **Vercel**: Gratuit (jusqu'à 100 GB bandwidth/mois)
- **GitHub**: Gratuit
- **Stripe**: 1.4% + 0.25€ par transaction en Europe
- **Domaine**: ~10€/an (optionnel)

## 🆘 Support

En cas de problème:
1. Vérifier les logs Vercel: Dashboard → Deployments → Logs
2. Tester localement: `npm run build && npm start`
3. Vérifier les variables d'environnement dans Vercel
