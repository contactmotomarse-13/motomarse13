# ⚠️ ERREUR RÉSOLUE - Configuration Vercel

## Problème résolu
Le build échouait car les clés Stripe n'étaient pas configurées. Le code a été corrigé pour gérer ce cas.

---

## 🔧 CONFIGURATION VERCEL - Variables d'environnement

### Dans Vercel, allez dans: Settings → Environment Variables

Ajoutez ces variables **UNE PAR UNE** (cliquez "Add" après chaque):

| Name | Value |
|------|-------|
| `JWT_SECRET` | `ChangezCeciParUneCleSuperSecrete123456` |
| `DRIVER_SIGNUP_CODE` | `MOTOMARSE2025` |
| `GOOGLE_MAPS_API_KEY` | `AIzaSyBVV1w-MYjBFbOKgDpMa1hRUF5pGg39O2Y` |
| `NOMINATIM_EMAIL` | `contact.motomarse@gmail.com` |
| `RESEND_API_KEY` | `re_T8xUd4MQ_GXJyozGFpS8mST5qhofQawB3` |
| `BOOKING_EMAIL_TO` | `contact.motomarse@gmail.com` |
| `BOOKING_EMAIL_FROM` | `Moto Marse <noreply@motomarse.vercel.app>` |

### ⚠️ IMPORTANT - Clés Stripe (depuis votre .env.local)

Ouvrez `/Users/augustin_bertholon/Downloads/motomars-main/.env.local` et copiez:

| Name | Value (à copier depuis .env.local) |
|------|-----------------------------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51SL...` (ligne 16) |
| `STRIPE_SECRET_KEY` | `sk_test_51SL...` (ligne 17) |

**Ne pas ajouter STRIPE_WEBHOOK_SECRET maintenant** (on le fera après le premier déploiement)

---

## ✅ Après avoir ajouté les variables

1. Cliquez sur l'onglet **"Deployments"**
2. Cliquez sur **"Redeploy"** (bouton ...)
3. Attendez 2-3 minutes
4. Le build devrait maintenant réussir! ✓

---

## 🎉 Si le déploiement réussit

Votre site sera accessible sur: `https://motomarse13.vercel.app`

### Prochaines étapes:

1. **Tester le site**
2. **Configurer le webhook Stripe** (voir GUIDE_DEPLOIEMENT.md)
3. **Ajouter les icônes** de l'app
4. **Tester l'installation PWA** sur mobile

---

## 🆘 Si ça ne marche toujours pas

Vérifiez dans Vercel:
- Settings → Environment Variables
- Toutes les 9 variables sont bien là
- Pas de caractères bizarres ou espaces en trop
- Redéployer après modifications

Ou partagez-moi le message d'erreur!
