# Guide de déploiement et de configuration multi-dépôts pour Woorkly Frontend

## Introduction
Ce document explique comment nous avons isolé le dossier frontend du projet Woorkly pour le déployer gratuitement sur Vercel (sans conflit d'organisation d'école payante) tout en gardant la possibilité de travailler en équipe avec l'organisation GitHub principale.

## Étape 1 : Pourquoi avoir isolé le dossier frontend ?
À l'origine, tout le projet (backend et frontend) était dans un seul dépôt Git appartenant à l'organisation de l'école (Woorkly). Vercel bloque le déploiement gratuit des dépôts qui appartiennent à des organisations et demande un compte d'équipe payant. La solution a été de créer un dépôt Git totalement indépendant et personnel pour le dossier frontend, qui contient directement les fichiers React (package.json, index.html, etc.) à sa racine.

## Étape 2 : Initialisation du Git indépendant en local
Dans le terminal, nous nous sommes placés dans le dossier frontend : `cd C:\wamp64\www\Woorkly\frontend`.
Nous avons nettoyé et initialisé un nouveau Git avec les commandes suivantes :

- `git init` (qui a créé une branche par défaut nommée master).
- `git add .` (pour ajouter tous les fichiers du front).
- `git commit -m "first commit front clean"` (pour figer le code propre).

## Étape 3 : Liaison avec le GitHub personnel
Nous avons créé un dépôt GitHub personnel totalement vide (sans README ni .gitignore) nommé `dwwm-projet-front`. Nous avons lié notre dossier local à ce dépôt et envoyé le code :

- `git remote add origin https://github.com/AchrafJarhou/dwwm-projet-front.git`
- `git push -u origin master`

## Étape 4 : Résolution des erreurs de Build Linux sur Vercel
Lors du premier déploiement, Vercel a planté à cause d'une erreur de casse (majuscules/minuscules). Sous Windows, le code fonctionnait, mais les serveurs Linux de Vercel sont très stricts.
L'erreur était dans `src/layouts/AdminLayout.jsx` à la ligne 3 avec un problème de chemin vers le fichier `adminStyle.css`.
Après correction du code, comme le Git de Windows a du mal à capter les changements de majuscules, nous avons vidé le cache de Git pour forcer la mise à jour :

- `git rm -r --cached .`
- `git add .`
- `git commit -m "fix: derniere majuscule adminStyle"`
- `git push origin master`

## Étape 5 : Configuration du fichier vercel.json pour React Router
Pour éviter les erreurs 404 de Vercel lorsqu'on rafraîchit une page du site (F5) gérée par React Router, nous avons créé un fichier nommé `vercel.json` à la racine du dossier frontend (à côté du package.json) contenant une règle de réécriture (rewrites) qui redirige toutes les requêtes vers `index.html`.
Le code du fichier :

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Nous l'avons envoyé sur GitHub avec `git add`, `git commit` et `git push`.

## Étape 6 : Configuration et déploiement final sur l'interface Vercel
Sur le tableau de bord de Vercel, nous avons importé le projet personnel. Dans les paramètres avant de déployer :

- Nous n'avons pas touché au "Root Directory" car le projet React est déjà à la racine.
- Nous avons changé la "Production Branch" de `main` à `master` pour correspondre à notre branche locale.
- Nous avons ajouté la variable d'environnement `VITE_API_BASE` (avec l'URL locale temporaire en attendant le déploiement du backend).
- Le déploiement a réussi avec le statut "Ready".

## Étape 7 : Configuration du Double-Dépôt (Remote Multiples) pour le travail d'équipe
Pour pouvoir mettre à jour Vercel (via le GitHub perso) ET envoyer le travail aux collègues (via l'organisation de l'école), nous avons configuré une deuxième destination nommée `ecole`.
Commande tapée :

`git remote add ecole https://github.com/Woorkly/dwwm-projet-front.git`

La commande `git remote -v` confirme que le dossier possède maintenant deux destinations :

- `origin` : qui pointe vers le GitHub personnel (pour Vercel).
- `ecole` : qui pointe vers l'organisation de l'école (pour le groupe).

## Guide des commandes au quotidien pour l'équipe
- Pour mettre à jour mon Vercel perso : `git push origin master`
- Pour envoyer mon code à mon groupe sur l'organisation : `git push ecole master`
- Pour récupérer le travail des collègues et actualiser mon Vercel : `git pull ecole main` puis `git push origin master`. Les collègues continuent d'utiliser leur commande habituelle `git push origin main` de leur côté sans rien changer.
