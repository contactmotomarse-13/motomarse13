# 🚀 COMMANDES RAPIDES - Déploiement Moto Marse

## 📦 1. Pousser sur GitHub (Première fois)

```bash
cd /Users/augustin_bertholon/Downloads/motomars-main

git init
git add .
git commit -m "Initial deploy - Moto Marse PWA"

# Créez d'abord le repo sur https://github.com/new
# Puis exécutez (remplacez VOTRE_USERNAME):
git remote add origin https://github.com/VOTRE_USERNAME/motomarse-app.git
git branch -M main
git push -u origin main
```

## ☁️ 2. Déployer sur Vercel

1. Allez sur https://vercel.com/signup → Continue with GitHub
2. Import Project → Sélectionnez `motomarse-app`
3. Ajoutez les variables d'environnement (voir ci-dessous)
4. Deploy!

### Variables d'environnement Vercel:

```
JWT_SECRET=ChangezCeciParUneCleSuperSecreteEtLongue123456789
DRIVER_SIGNUP_CODE=MOTOMARSE2025
GOOGLE_MAPS_API_KEY=AIzaSyBVV1w-MYjBFbOKgDpMa1hRUF5pGg39O2Y
NOMINATIM_EMAIL=contact.motomarse@gmail.com
RESEND_API_KEY=re_T8xUd4MQ_GXJyozGFpS8mST5qhofQawB3
BOOKING_EMAIL_TO=contact.motomarse@gmail.com
BOOKING_EMAIL_FROM=Moto Marse <noreply@motomarse.vercel.app>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_TEST_STRIPE
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRET_STRIPE
```

## 🔗 3. Configurer Webhook Stripe

1. https://dashboard.stripe.com/test/webhooks → Add endpoint
2. URL: `https://VOTRE-SITE.vercel.app/api/payment/webhook`
3. Events: `checkout.session.completed`
4. Copier le `Signing secret`
5. Vercel → Environment Variables → Ajouter:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET
   ```
6. Redéployer

## 🔄 4. Mettre à jour (après modifications)

```bash
git add .
git commit -m "Description de vos changements"
git push
```
→ Vercel redéploie automatiquement!

## 🎨 5. Ajouter les icônes (Important!)

Générez vos icônes sur https://realfavicongenerator.net

Puis:
```bash
# Copiez icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico dans /public/
git add public/*.png public/favicon.ico
git commit -m "Add app icons"
git push
```

## ✅ 6. Tester votre site

- Homepage: https://VOTRE-SITE.vercel.app
- Réserver: `/reserver`
- Tarifs: `/tarifs`
- Admin: `/admin/paiements`
- Test paiement: carte `4242 4242 4242 4242`

## 📱 7. Installer comme app

**Android:** Menu → Installer l'application
**iOS:** Partager → Sur l'écran d'accueil

---

## 💡 Commandes utiles

```bash
# Tester le build localement
npm run build
npm start

# Développement local
npm run dev

# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Voir l'état git
git status

# Annuler les changements non commités
git checkout .
```

---

## 🎉 C'est fait!

Votre URL: `https://motomarse-app-xxx.vercel.app`

Partagez-la, testez-la, et recevez vos premières réservations! 🏍️
