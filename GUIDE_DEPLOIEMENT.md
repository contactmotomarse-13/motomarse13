# 🚀 GUIDE DE DÉPLOIEMENT - Moto Marse

## ✅ Préparation terminée

Votre application est maintenant prête pour la publication avec:
- ✅ PWA configurée (installable comme app)
- ✅ Service Worker pour mode hors ligne
- ✅ Manifest et métadonnées
- ✅ Configuration production
- ✅ Optimisations de cache

---

## 📦 ÉTAPES POUR PUBLIER (15 minutes)

### 1. Pousser sur GitHub

```bash
# Dans le terminal, exécutez:
cd /Users/augustin_bertholon/Downloads/motomars-main

# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "Ready for deployment - Moto Marse PWA"

# Créer le repository sur GitHub
# Allez sur: https://github.com/new
# Nom: motomarse-app
# Type: Public ou Private
# Ne cochez rien d'autre
# Cliquez "Create repository"

# Ensuite exécutez (remplacez VOTRE_USERNAME):
git remote add origin https://github.com/VOTRE_USERNAME/motomarse-app.git
git branch -M main
git push -u origin main
```

### 2. Déployer sur Vercel (GRATUIT)

#### A. Créer un compte
1. Allez sur https://vercel.com/signup
2. Cliquez "Continue with GitHub"
3. Autorisez Vercel

#### B. Importer le projet
1. Cliquez "Add New..." → "Project"
2. Sélectionnez `motomarse-app`
3. Cliquez "Import"

#### C. Configurer les variables d'environnement

**Avant de cliquer "Deploy"**, ajoutez ces variables:

```bash
# Authentication
JWT_SECRET=VotreCleSuperSecrete123ChangezCeciEnProduction456

# Driver Code
DRIVER_SIGNUP_CODE=MOTOMARSE2025

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyBVV1w-MYjBFbOKgDpMa1hRUF5pGg39O2Y
NOMINATIM_EMAIL=contact.motomarse@gmail.com

# Email
RESEND_API_KEY=re_T8xUd4MQ_GXJyozGFpS8mST5qhofQawB3
BOOKING_EMAIL_TO=contact.motomarse@gmail.com
BOOKING_EMAIL_FROM=Moto Marse <noreply@motomarse.vercel.app>

# Stripe TEST (pour commencer)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_PUBLISHABLE_STRIPE
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRET_STRIPE
```

#### D. Déployer
1. Cliquez "Deploy"
2. Attendez 2-3 minutes
3. Votre site sera live sur: `https://motomarse-app-xxx.vercel.app`

---

### 3. Configurer Stripe Webhook

1. Allez sur https://dashboard.stripe.com/test/webhooks
2. Cliquez "+ Add endpoint"
3. URL: `https://VOTRE-SITE.vercel.app/api/payment/webhook`
4. Events: Sélectionnez `checkout.session.completed`
5. Cliquez "Add endpoint"
6. Copiez le `Signing secret` (commence par `whsec_`)
7. Retournez dans Vercel → Settings → Environment Variables
8. Ajoutez: `STRIPE_WEBHOOK_SECRET` = le secret copié
9. Redéployez: Deployments → ... → Redeploy

---

### 4. TESTER votre application en ligne

#### Tests essentiels:
1. ✅ Homepage fonctionne
2. ✅ `/reserver` - Géolocalisation et carte
3. ✅ `/tarifs` - Estimateur avec trafic
4. ✅ Faire une réservation test
5. ✅ Payer avec carte test:
   - Numéro: `4242 4242 4242 4242`
   - Date: n'importe quelle date future
   - CVC: `123`
6. ✅ Vérifier `/profil` - voir la réservation
7. ✅ Vérifier `/admin/paiements` - voir les revenus

#### Tester la PWA:
**Sur Android (Chrome):**
- Menu (⋮) → "Installer l'application"

**Sur iOS (Safari):**
- Bouton Partage (□↑) → "Sur l'écran d'accueil"

---

### 5. (OPTIONNEL) Domaine personnalisé

#### Acheter un domaine
- OVH, Namecheap, Google Domains, etc.
- Ex: `motomarse.fr` (~10€/an)

#### Configurer dans Vercel
1. Settings → Domains
2. Ajouter `motomarse.fr` et `www.motomarse.fr`
3. Suivre les instructions DNS

#### Mettre à jour
- Vercel → Environment Variables → `NEXT_PUBLIC_APP_URL` = `https://motomarse.fr`
- Stripe webhook → Changer l'URL
- Redéployer

---

## 🎨 IMPORTANT: Ajouter vos icônes d'app

Créez et ajoutez dans `/public/`:
1. `icon-192.png` (192x192 px)
2. `icon-512.png` (512x512 px)
3. `apple-touch-icon.png` (180x180 px)
4. `favicon.ico` (32x32 px)

**Outil recommandé:** https://realfavicongenerator.net

Une fois ajoutées:
```bash
git add public/*.png public/favicon.ico
git commit -m "Add app icons"
git push
```
→ Vercel redéploie automatiquement!

---

## 💰 Activer les VRAIS paiements (Plus tard)

⚠️ **Attendez d'avoir bien testé!**

1. **Stripe Dashboard** → Basculer en mode "Production"
2. **Récupérer les clés Live:**
   - `pk_live_...`
   - `sk_live_...`
3. **Vercel** → Variables d'environnement → Remplacer par les clés Live
4. **Webhook production** → Créer un nouveau endpoint en mode Live
5. **Redéployer**

---

## 🔄 Mettre à jour votre site

À chaque modification:
```bash
git add .
git commit -m "Description du changement"
git push
```
→ **Vercel redéploie automatiquement en 2 minutes!**

---

## 📊 Fonctionnalités disponibles

- ✅ **Site public** accessible 24/7
- ✅ **PWA installable** (Android + iOS)
- ✅ **Géolocalisation** automatique
- ✅ **Carte interactive** avec trajet
- ✅ **Tarifs dynamiques** (nuit + trafic)
- ✅ **Paiements Stripe** sécurisés
- ✅ **Dashboard admin** avec revenus
- ✅ **Espace chauffeur** avec courses
- ✅ **Mode hors ligne** (cache PWA)
- ✅ **Notifications** (si configurées)

---

## 💡 Après le déploiement

### Optimisations SEO
- Ajoutez Google Analytics
- Configurez Google Search Console
- Créez un sitemap XML

### Marketing
- Partagez le lien sur les réseaux sociaux
- Imprimez des QR codes pointant vers votre site
- Ajoutez "Installer l'app" dans vos communications

### Monitoring
- Vérifiez les logs Vercel régulièrement
- Testez les paiements avec de vraies cartes (petit montant)
- Surveillez les revenus dans `/admin/paiements`

---

## 🆘 Problèmes courants

### Build échoue
```bash
# Tester localement:
npm run build
```

### Variables d'environnement manquantes
- Vérifier dans Vercel → Settings → Environment Variables
- Redéployer après modification

### Paiements ne fonctionnent pas
- Vérifier le webhook Stripe
- Vérifier `STRIPE_WEBHOOK_SECRET` dans Vercel
- Tester avec carte test: `4242 4242 4242 4242`

### Carte ne s'affiche pas
- Vérifier la clé Google Maps
- Ouvrir la console navigateur (F12) pour voir les erreurs

---

## 🎉 Félicitations!

Votre application Moto Marse est maintenant:
- 📱 Installable comme une app native
- 🌍 Accessible depuis n'importe où
- 💳 Prête à recevoir des paiements
- 🚀 Hébergée gratuitement sur Vercel
- ⚡ Optimisée et rapide

**URL de votre site:** https://motomarse-app-xxx.vercel.app

Bon lancement! 🏍️💨
