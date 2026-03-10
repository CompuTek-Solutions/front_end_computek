# 🚀 Guide de Déploiement - Computek Solutions

## Build pour Production

### 1. Préparation

```bash
# Installer les dépendances
npm install

# Vérifier les erreurs
npm run lint

# Build de production
npm run build
```

### 2. Vérification du Build

```bash
# Prévisualiser localement
npm run preview

# L'application est accessible sur un URL local
```

### 3. Contenu du Build

Le dossier `dist/` contient:
- `index.html` - Fichier principal
- `assets/` - CSS, JS, images optimisés
- Tout est minifié et optimisé

---

## Options de Déploiement

### Option 1: Vercel (Recommandé)

**Avantages:**
- Déploiement gratuit et rapide
- Domaine personnalisé possible
- SSL automatique
- Support React excellent

**Étapes:**
1. Créez un compte sur [vercel.com](https://vercel.com)
2. Connectez votre repo GitHub
3. Vercel détecte automatiquement Vite
4. Cliquez sur "Deploy"
5. Votre app est en ligne en 2 minutes

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Option 2: Netlify

**Étapes:**
1. Allez sur [netlify.com](https://netlify.com)
2. Connectez votre repo GitHub
3. Configurez:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Cliquez sur "Deploy"

### Option 3: Server Personnel

#### Avec Apache

1. Copiez le contenu de `dist/` vers votre serveur
2. Configurez le `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Avec Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/computek-solutions/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Avec Node.js (Express)

```bash
npm install -g serve
serve -s dist -l 3000
```

Ou créez un server.js:

```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Option 4: Docker

Créez un `Dockerfile`:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build et run:

```bash
docker build -t computek-solutions .
docker run -p 3000:3000 computek-solutions
```

---

## Configuration Post-Déploiement

### 1. Variables d'Environnement

Créez un fichier `.env`:

```env
VITE_API_URL=https://votre-api.com
VITE_APP_NAME=Computek Solutions
```

Utilisez dans le code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

### 2. HTTPS/SSL

- **Vercel/Netlify:** Automatique
- **Server personnel:**
  - Générez un certificat Let's Encrypt
  - Redirigez HTTP vers HTTPS

### 3. Domaine Personnalisé

**Vercel:**
1. Settings > Domains
2. Ajoutez votre domaine
3. Pointez le DNS vers Vercel

**Netlify:**
1. Domain settings
2. Custom domain
3. Configurez le DNS

### 4. Base de Données (Futures)

Pour intégrer une BD:

1. Créez une API backend (Node.js, Python, etc.)
2. Remplacez localStorage par des appels API
3. Configurez CORS

Exemple avec API:

```javascript
// Avant (localStorage)
const products = JSON.parse(localStorage.getItem('products'));

// Après (API)
const response = await fetch('/api/products');
const products = await response.json();
```

---

## Optimisations de Performance

### 1. Compression

```bash
# Gzip automatiquement
gzip -r dist/
```

### 2. Cache

Configurez les en-têtes HTTP:

```nginx
# Images et assets (1 an)
expires 1y;

# HTML (1 jour)
expires 1d;
```

### 3. CDN

- Utilisez CloudFlare pour la distribution globale
- Cache les assets statiques
- Protection DDoS incluse

### 4. Analyse de Bundle

```bash
npm install --save-dev rollup-plugin-visualizer
```

### 5. Optimisation des Images

```bash
npm install --save-dev imagemin
```

---

## Monitoring et Logs

### Vercel Analytics

Activé automatiquement. Consultez le dashboard.

### Sentry (Gestion d'Erreurs)

```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN",
  environment: "production",
});
```

### Google Analytics

```bash
npm install gtag.js
```

```javascript
import { pageview } from 'gtag.js';

window.dataLayer = window.dataLayer || [];
window.gtag = function() { window.dataLayer.push(arguments); }
window.gtag('config', 'G-XXXXXXX');
```

---

## Checklist Pre-Déploiement

- [ ] Code testé localement
- [ ] Pas d'erreurs dans la console
- [ ] localStorage -> API (si nécessaire)
- [ ] Variables d'environnement configurées
- [ ] Logo présent dans public/
- [ ] README et GUIDE à jour
- [ ] Package.json version mise à jour
- [ ] Build testé (`npm run preview`)
- [ ] Sécurité vérifiée
- [ ] Performance optimisée

---

## Troubleshooting Déploiement

### Erreur: "Cannot find module"
```bash
rm -rf node_modules
npm install
npm run build
```

### Erreur: "404 sur rechargement"
- Configurez les redirects SPA (voir sections ci-dessus)
- Vercel/Netlify le font automatiquement

### Erreur: "CORS"
- Ajoutez CORS headers côté serveur
- Utilisez un proxy API si besoin

### Erreur: "Caméra ne fonctionne pas"
- L'app doit être en HTTPS
- Les appels localhost fonctionnent sans HTTPS

### Performance lente
- Activez la compression Gzip
- Utilisez un CDN
- Minifiez les assets
- Lazy-load les images

---

## Mise à Jour de l'Application

### Déployer une nouvelle version

**Via Git:**
```bash
git add .
git commit -m "Version 1.1.0"
git push origin main
```

Vercel/Netlify redéployent automatiquement.

**Manuel:**
```bash
npm run build
# Téléchargez dist/ sur votre serveur
```

### Versioning

Mettez à jour dans `package.json`:
```json
{
  "version": "1.1.0"
}
```

---

## Migration de Données

Si vous passez de localStorage à une BD:

1. **Export** des données localStorage
2. **Transformation** au format BD
3. **Import** dans la nouvelle DB
4. **Test** des données
5. **Migration** progressive des utilisateurs

---

## Support Production

- Documentez les procédures
- Créez des backups réguliers
- Monitorer les logs
- Alertes sur les erreurs
- Plan de récupération d'urgence

---

**Dernière mise à jour:** Mars 2026  
**Pour:** Computek Solutions
