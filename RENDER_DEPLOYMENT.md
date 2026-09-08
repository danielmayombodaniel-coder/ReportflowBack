# Guide de déploiement sur Render

## Backend (ReportflowBack)

### Variables d'environnement requises sur Render

Dans le dashboard de Render, ajoutez ces variables d'environnement :

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/plume_noire
JWT_SECRET=<your-secret-key>
PORT=5000
MAX_UPLOAD_SIZE_MB=50
FRONTEND_URL=https://reportflow-front.onrender.com
```

### Configuration MongoDB Atlas

1. Créez un compte sur MongoDB Atlas
2. Créez un cluster gratuit
3. Créez un utilisateur de base de données
4. Configurez l'accès réseau (autorisez l'accès depuis partout ou ajoutez l'IP de Render)
5. Copiez la chaîne de connexion et remplacez les placeholders dans MONGO_URI

## Frontend (ReportFlow_Front)

### Variables d'environnement

Le frontend utilise déjà la configuration Vite :
- `.env.production` utilise automatiquement l'URL de production du backend
- `.env.development` utilise l'URL locale du backend

### Build Settings sur Render

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Install Command**: `npm install`

## Workflow de développement

1. **Travail en local** :
   - Backend : utilise `.env` avec les variables locales
   - Frontend : utilise `.env.local` (non versionné) ou `.env.development`
   - Le frontend communique avec `http://localhost:5000`

2. **Déploiement** :
   - Poussez les changements avec `git push`
   - Render détecte automatiquement les changements
   - Le backend utilise les variables d'environnement configurées sur Render
   - Le frontend utilise `.env.production` pour l'URL de production

## Résolution des problèmes courants

### Erreur "Cannot find package 'zod'"
Cette erreur a été corrigée en ajoutant `zod` aux dépendances. Assurez-vous d'avoir la dernière version du package.json.

### Erreur CORS
Assurez-vous que `FRONTEND_URL` est correctement configuré dans les variables d'environnement du backend sur Render.

### Connexion MongoDB
Vérifiez que la chaîne de connexion MONGO_URI est correcte et que l'accès réseau est configuré sur MongoDB Atlas.
