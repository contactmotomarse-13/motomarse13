# Icônes pour PWA

## ⚠️ Action requise: Créer vos icônes

Les icônes suivantes doivent être ajoutées dans `/public/`:

1. **icon-192.png** (192x192 px)
2. **icon-512.png** (512x512 px)  
3. **apple-touch-icon.png** (180x180 px)
4. **favicon.ico** (32x32 px)

## 🎨 Options pour créer les icônes

### Option 1: Utiliser un générateur en ligne (Recommandé)
1. Allez sur https://realfavicongenerator.net
2. Uploadez votre logo (minimum 512x512 px)
3. Configurez les options
4. Téléchargez le package
5. Copiez les fichiers dans `/public/`

### Option 2: Photoshop / Figma / Canva
Créez un carré 512x512 px avec:
- Fond: #3b82f6 (bleu brand)
- Logo/Icône: Moto ou "MM" en blanc
- Exportez en PNG

Puis redimensionnez pour les autres tailles:
```bash
# Avec ImageMagick (macOS: brew install imagemagick)
convert icon-512.png -resize 192x192 icon-192.png
convert icon-512.png -resize 180x180 apple-touch-icon.png
convert icon-512.png -resize 32x32 favicon.ico
```

### Option 3: Utiliser l'emoji 🏍️ (Temporaire)
Ouvrez `generate-icons.html` dans votre navigateur pour générer une icône basique.

## 📱 Après avoir ajouté les icônes

Testez l'installation:
1. Ouvrir votre site sur mobile
2. Chrome Android: Menu → "Installer l'application"
3. Safari iOS: Partager → "Sur l'écran d'accueil"
4. Vérifier que votre icône s'affiche correctement

## 🔄 Si vous changez les icônes plus tard

Videz le cache du service worker:
1. Chrome DevTools → Application → Clear storage
2. Ou changez la version dans `manifest.json`
