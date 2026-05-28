# PROJET : Déploiement du serveur Back-end Node.js sur Render et interconnexion

## Étape 1 : Préparation du code local et du dépôt GitHub

- Isolement du dossier "backend" (suppression du dossier front imbriqué pour éviter les conflits sur Render).
- Initialisation d'un Git propre dans le dossier backend local.
- Création d'un dépôt GitHub privé nommé `dwwm-projet-back`.
- Push du code backend propre sur la branche `master` de ce dépôt GitHub.

## Étape 2 : Inscription et autorisation sur Render

- Connexion sur render.com via l'option "Sign in with GitHub".
- Validation du compte via le lien reçu dans la boîte e-mail.
- Face au problème d'invisibilité du dépôt privé, utilisation du lien direct [github.com/apps/render](https://github.com/apps/render) pour installer l'application Render sur le profil GitHub.
- Configuration des accès sur GitHub : sélection de "All repositories" (ou sélection spécifique du dépôt) pour permettre à Render de voir le projet privé.

## Étape 3 : Configuration du Web Service sur Render

- Sur Render, clic sur "New +" -> "Web Service".
- Recherche du dépôt `dwwm-projet-back` et clic sur "Connect".
- Remplissage du formulaire de configuration : Name : woorkly-back
- Region : Frankfurt (EU) (pour de meilleures performances en France)
- Branch : master
- Language : Node
- Build Command : npm install
- Start Command : npm start (qui exécute la commande de production `node src/server.js` définie dans le package.json, à la place de nodemon réservé au local).

## Étape 4 : Configuration des variables d'environnement (Base de données & Sécurité)

- Dans la section "Environment Variables" de Render, ajout manuel des clés nécessaires au fonctionnement du projet en ligne (sans toucher au fichier .env local du PC) : PORT : 10000
- DB_HOST : mysql-woorkly.alwaysdata.net (hôte Alwaysdata)
- DB_USER : woorkly
- DB_PASS : [Mot de passe de la base Alwaysdata]
- DB_NAME : woorkly_db
- JWT_SECRET : [Clé secrète de production]
- FRONTEND_ORIGIN : [https://dwwm-projet-front-t2d9.vercel.app](https://dwwm-projet-front-t2d9.vercel.app) (URL Vercel)

- Note : La variable `NODE_ENV=production` est automatiquement injectée par Render, ce qui permet au code des cookies (secure, sameSite: 'none') de fonctionner parfaitement en ligne tout en restant compatible avec le localhost sans HTTPS.

## Étape 5 : Résolution du problème CORS (Wildcard pour les Previews Vercel)

- Problème rencontré : Les requêtes du Front-end étaient bloquées par le navigateur (CORS error) car Vercel génère des URL de déploiement dynamiques (URL de preview) qui ne correspondaient pas exactement à la chaîne fixe `FRONTEND_ORIGIN`.
- Solution appliquée dans le code Backend : Remplacement de la configuration de l'origin CORS fixe par une fonction utilisant un tableau et une expression régulière (Regex) permettant d'accepter le localhost ainsi que toutes les adresses dynamiques se terminant par `.vercel.app`.
- Commande de mise à jour : Git add, commit et push sur GitHub pour déclencher le déploiement automatique de la correction sur Render.

## Étape 6 : Validation finale

- Le serveur passe au statut "Live" vert sur Render.
- Test de l'URL racine [https://dwwm-projet-back.onrender.com](https://dwwm-projet-back.onrender.com) : Affichage réussi du message de bienvenue "Serveur Workly opérationnel !".
- Configuration finale du Front-end sur Vercel : Mise à jour de la variable `VITE_API_BASE` avec l'URL de Render pour lier définitivement les deux environnements.