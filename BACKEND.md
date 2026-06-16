# Woorkly — Documentation Backend

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Routes API](#4-routes-api)
5. [Middlewares](#5-middlewares)
6. [Modèle de données](#6-modèle-de-données)
7. [Services et logique métier](#7-services-et-logique-métier)
8. [Authentification et sécurité](#8-authentification-et-sécurité)
9. [Upload de fichiers](#9-upload-de-fichiers)
10. [Variables d'environnement](#10-variables-denvironnement)
11. [Codes HTTP utilisés](#11-codes-http-utilisés)

---

## 1. Vue d'ensemble

Le backend de Woorkly est une **API REST** construite avec Node.js et Express. Il gère :
- L'authentification des utilisateurs (JWT en cookie HttpOnly)
- La gestion des salles, équipements et types
- La gestion des réservations avec détection de chevauchement
- L'upload d'images vers Cloudinary
- Le tableau de bord analytique admin
- La protection CSRF et la limitation de débit (rate limiting)

**Port par défaut :** 3000  
**Base URL :** `http://localhost:3000/api`

---

## 2. Stack technique

| Outil | Version | Rôle |
|-------|---------|------|
| Node.js | LTS | Runtime JavaScript |
| Express | 5.2.1 | Framework web |
| MySQL 2 | 3.22.2 | Base de données relationnelle |
| jsonwebtoken | 9.0.3 | Génération et vérification JWT |
| bcrypt | 6.0.0 | Hachage des mots de passe |
| csrf-csrf | 4.0.3 | Protection CSRF (double-submit pattern) |
| helmet | 8.2.0 | Headers de sécurité HTTP |
| express-rate-limit | 8.5.2 | Limitation du débit par IP |
| multer | 2.1.1 | Upload de fichiers en mémoire |
| cloudinary | 2.10.0 | Stockage cloud des images |
| express-validator | 7.3.2 | Validation des entrées |
| cors | 2.8.6 | Gestion des origines cross-origin |
| cookie-parser | 1.4.7 | Parsing des cookies |
| dotenv | 17.4.2 | Variables d'environnement |
| nodemon | 3.1.14 | Rechargement automatique en dev |

---

## 3. Architecture du projet

```
backend/src/
├── server.js                        # Point d'entrée : middlewares globaux + montage des routes
│
├── config/
│   ├── db.js                        # Pool de connexions MySQL (mysql2/promise)
│   └── cloudinary.js                # Configuration Cloudinary
│
├── models/
│   ├── BaseModel.js                 # Classe abstraite : findAll, findById, delete, getConnection
│   ├── User.js                      # Requêtes utilisateurs (findByEmail, create, update...)
│   ├── Room.js                      # Requêtes salles (getById, getAll, create, update...)
│   ├── Reservation.js               # Requêtes réservations (hasConflict, autoUpdateExpiredStatuses...)
│   ├── Equipements.js               # Requêtes équipements
│   └── Types.js                     # Requêtes types de salles
│
├── services/
│   ├── authService.js               # login, generateToken, verifyToken
│   ├── reservationService.js        # Logique métier réservations (prix, créneaux, conflits)
│   ├── adminDashboardService.js     # Requêtes analytiques (KPIs, tendances, usage)
│   └── uploadService.js             # Upload buffer → Cloudinary
│
├── controllers/
│   ├── authController.js            # Handlers /auth
│   ├── userController.js            # Handlers /users
│   ├── roomController.js            # Handlers /rooms (+ géocodage)
│   ├── reservationController.js     # Handlers /reservations
│   ├── equipementController.js      # Handlers /equipements
│   ├── typeController.js            # Handlers /types
│   ├── adminController.js           # Handler /admin/dashboard
│   └── uploadController.js          # Handler /upload
│
├── routes/
│   ├── authRoute.js                 # POST /login, GET /me, POST /logout
│   ├── userRoutes.js                # CRUD /users
│   ├── roomRoutes.js                # CRUD /rooms + disponibilités
│   ├── reservationRoutes.js         # CRUD /reservations + stats
│   ├── equipementsRoutes.js         # CRUD /equipements
│   ├── typeRoutes.js                # CRUD /types
│   ├── adminRoutes.js               # GET /admin/dashboard
│   └── uploadRoutes.js              # POST /upload
│
├── middlewares/
│   ├── auth.js                      # authRequired, requireRole
│   ├── rateLimiter.js               # globalLimiter (100/15min), loginLimiter (10/15min)
│   ├── upload.js                    # Multer mémoire + filtre image/* + 5MB
│   └── validate.js                  # Collecte et renvoie les erreurs express-validator
│
└── validators/
    ├── authValidator.js             # Règles email + mot de passe
    ├── userValidator.js             # Règles création/mise à jour utilisateur
    ├── roomValidator.js             # Règles création/mise à jour salle
    └── reservationValidator.js      # Règles création/mise à jour réservation
```

---

## 4. Routes API

### 4.1 Authentification — `/api/auth`

| Méthode | Chemin | Middleware | Description |
|---------|--------|------------|-------------|
| POST | `/login` | `loginValidator`, `validate`, `loginLimiter` | Connexion : vérifie email/mot de passe, génère un JWT en cookie |
| GET | `/me` | — | Retourne l'utilisateur connecté depuis le cookie JWT |
| POST | `/logout` | — | Supprime le cookie JWT |

**Réponse POST /login (200) :**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "nom": "Jean Dupont",
  "role": "user",
  "avatar_url": "https://res.cloudinary.com/..."
}
```

---

### 4.2 Utilisateurs — `/api/users`

| Méthode | Chemin | Middleware | Description |
|---------|--------|------------|-------------|
| GET | `/` | — | Liste tous les utilisateurs avec leur nombre de réservations |
| GET | `/:id` | — | Détail d'un utilisateur |
| POST | `/` | `createUserValidator`, `validate` | Inscription (crée un compte avec role='user') |
| PUT | `/:id` | `updateUserValidator`, `validate` | Mise à jour complète d'un utilisateur |
| PATCH | `/:id` | `upload.single('avatar')`, `patchUserValidator`, `validate` | Mise à jour partielle (profil + avatar) + renouvellement JWT |
| DELETE | `/:id` | — | Suppression (bloquée si l'utilisateur a des réservations à venir) |

**Champs utilisateur :**

| Champ | Type | Contrainte |
|-------|------|------------|
| `nom` | VARCHAR(100) | Requis |
| `email` | VARCHAR(150) | Requis, unique, format email |
| `password` | VARCHAR(255) | Haché bcrypt (sel 10 tours) |
| `avatar_url` | VARCHAR(255) | URL Cloudinary ou `default-avatar.png` |
| `role` | VARCHAR(20) | `user` ou `admin` |

---

### 4.3 Salles — `/api/rooms`

| Méthode | Chemin | Middleware | Description |
|---------|--------|------------|-------------|
| GET | `/` | — | Liste des salles avec filtres (`ville`, `capacite`, `type`, `equipement`) |
| GET | `/available` | — | Salles disponibles (`statut='disponible'`) à une date donnée |
| GET | `/:id` | — | Détail : infos + galerie photos + équipements |
| POST | `/` | `createRoomValidator`, `validate` | Création avec géocodage de l'adresse |
| PUT | `/:id` | `updateRoomValidator`, `validate` | Mise à jour avec géocodage si l'adresse change |
| DELETE | `/:id` | — | Suppression de la salle et ses photos/équipements associés |

**Champs salle :**

| Champ | Type | Description |
|-------|------|-------------|
| `nom` | VARCHAR(100) | Nom de la salle |
| `statut` | VARCHAR(20) | `disponible` par défaut |
| `adresse` | VARCHAR(255) | Adresse physique |
| `code_postal` | VARCHAR(10) | 5 chiffres exactement |
| `ville` | VARCHAR(100) | Ville |
| `latitude` / `longitude` | DECIMAL | Auto-calculées via l'API geo.gouv.fr |
| `capacite` | INT | Nombre de personnes (min 1) |
| `description` | TEXT | Jusqu'à 1000 caractères |
| `prix_heure` | DECIMAL(5,2) | Tarif horaire |
| `prix_demi_journee` | DECIMAL(5,2) | Tarif demi-journée |
| `prix_journee` | DECIMAL(6,2) | Tarif journée |
| `image_principale` | VARCHAR(255) | URL Cloudinary image de couverture |
| `type_id` | INT | FK → `types.id` |

**Géocodage :**  
À la création/modification d'une salle, l'adresse est envoyée à l'API gouvernementale `api-adresse.data.gouv.fr` pour calculer automatiquement latitude et longitude. En cas d'échec : erreur `ADDRESS_NOT_FOUND` (400) ou `GEOCODING_FAILED` (502).

---

### 4.4 Réservations — `/api/reservations`

| Méthode | Chemin | Middleware | Description |
|---------|--------|------------|-------------|
| GET | `/disponibilite?salle_id=X&date=Y` | `authRequired` | Disponibilité des créneaux matin / après-midi / journée |
| GET | `/me/upcoming` | `authRequired` | Prochaines réservations de l'utilisateur connecté |
| GET | `/me/history` | `authRequired` | Historique des réservations (terminées, annulées, abandonnées) |
| GET | `/me/stats` | `authRequired` | KPIs et graphiques pour le dashboard utilisateur |
| GET | `/me` | `authRequired` | Toutes les réservations de l'utilisateur |
| GET | `/` | `authRequired`, `requireRole('admin')` | Toutes les réservations avec filtres (admin) |
| GET | `/filters-data` | `authRequired`, `requireRole('admin')` | Listes salles + utilisateurs pour les menus déroulants |
| GET | `/user/:userId` | `authRequired`, `requireRole('admin')` | Réservations d'un utilisateur (admin) |
| GET | `/:id` | `authRequired` | Détail d'une réservation |
| POST | `/` | `authRequired`, `createReservationValidator`, `validate` | Crée une réservation (avec détection de conflit et calcul de prix) |
| PATCH | `/:id/cancel` | `authRequired` | Annule une réservation (propriétaire ou admin) |
| PATCH | `/:id/statut` | `authRequired`, `requireRole('admin')`, `updateStatutValidator`, `validate` | Change le statut (admin) |

**Champs réservation :**

| Champ | Type | Valeurs |
|-------|------|---------|
| `date` | DATE | Format ISO, ne peut pas être dans le passé |
| `heure_debut` | TIME | Format HH:MM |
| `heure_fin` | TIME | Format HH:MM, doit être > heure_debut |
| `type_reservation` | VARCHAR(50) | `heure`, `demi-journee`, `journee` |
| `statut` | VARCHAR(20) | `en-attente`, `confirmee`, `annulee`, `terminee`, `abandonne` |
| `prix_total` | DECIMAL(7,2) | Calculé automatiquement |
| `salle_id` | INT | FK → `salles.id` |
| `utilisateur_id` | INT | FK → `utilisateurs.id` |

**Créneaux disponibles :**

| Créneau | Horaires |
|---------|---------|
| Journée | 08h00 – 18h00 |
| Matin | 08h00 – 12h00 |
| Après-midi | 13h00 – 18h00 |

---

### 4.5 Équipements — `/api/equipements`

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `/` | Liste tous les équipements |
| GET | `/:id` | Détail d'un équipement |
| POST | `/` | Crée un équipement (200 si existe déjà, 201 si nouveau) |
| PUT | `/:id` | Met à jour un équipement |
| DELETE | `/:id` | Supprime un équipement |

---

### 4.6 Types de salles — `/api/types`

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `/` | Liste tous les types |
| GET | `/:id` | Détail d'un type |
| POST | `/` | Crée un type |
| PUT | `/:id` | Met à jour un type |
| DELETE | `/:id` | Supprime un type |

---

### 4.7 Dashboard admin — `/api/admin`

| Méthode | Chemin | Middleware | Description |
|---------|--------|------------|-------------|
| GET | `/dashboard` | `authRequired`, `requireRole('admin')` | KPIs, tendances mensuelles, répartition par type, dernières réservations |

**Réponse (200) :**
```json
{
  "kpis": {
    "total_salles": 12,
    "reservations_today": 5,
    "total_utilisateurs": 48,
    "taux_occupation": 37.5
  },
  "monthly_trends": [
    { "month": "Jan", "total_reservations": 45, "confirmees": 38 },
    ...
  ],
  "type_usage": [
    { "type": "Salle de réunion", "total": 120, "percentage": 60 },
    ...
  ],
  "recent_reservations": [
    { "id": 42, "date": "2025-06-15", "heure_debut": "09:00", ... }
  ]
}
```

---

### 4.8 Upload — `/api/upload`

| Méthode | Chemin | Middleware | Description |
|---------|--------|------------|-------------|
| POST | `/` | `upload.single('image')` | Upload d'une image vers Cloudinary |

**Réponse (200) :**
```json
{ "url": "https://res.cloudinary.com/dnrtsikua/image/upload/v.../woorkly/salles/..." }
```

---

### 4.9 Token CSRF — `/api/csrf-token`

| Méthode | Chemin | Description |
|---------|--------|-------------|
| GET | `/csrf-token` | Fournit un token CSRF au frontend (appelé une fois au chargement) |

---

## 5. Middlewares

### `auth.js`

**`authRequired`**  
Vérifie la présence et la validité du JWT. Priorité :
1. Cookie HttpOnly `token`
2. Header `Authorization: Bearer <token>` (compatibilité)

Peuple `req.user` avec `{ userId, email, nom, role, avatar_url }`.  
Retourne 401 si token absent ou invalide.

**`requireRole(role)`**  
Factory de middleware, vérifie que `req.user.role === role`.  
Retourne 403 si le rôle ne correspond pas.

---

### `rateLimiter.js`

| Limiteur | Cible | Limite | Fenêtre |
|----------|-------|--------|---------|
| `globalLimiter` | Toutes les routes | 100 requêtes / IP | 15 minutes |
| `loginLimiter` | POST /api/auth/login | 10 requêtes / IP | 15 minutes |

En cas de dépassement : réponse 429 avec message `"Trop de requêtes, veuillez réessayer dans 15 minutes."`.

---

### `upload.js`

Multer configuré avec **stockage en mémoire** (RAM, aucun fichier écrit sur disque).

- Filtre MIME : accepte uniquement `image/*`
- Taille maximale : 5 Mo par fichier
- Le fichier est disponible sous forme de `Buffer` dans `req.file.buffer`

---

### `validate.js`

Collecte les erreurs générées par `express-validator` et renvoie une réponse 422 si des règles ne sont pas respectées. Sinon, passe au handler suivant.

---

## 6. Modèle de données

### Schéma relationnel

```
types
  └─ id, nom

equipements
  └─ id, nom

utilisateurs
  └─ id, nom, email, password, avatar_url, role

salles
  ├─ id, nom, statut, adresse, code_postal, ville
  ├─ latitude, longitude
  ├─ capacite, description
  ├─ prix_heure, prix_demi_journee, prix_journee
  ├─ image_principale
  └─ type_id → types.id

salle_equipements  (table de jonction N:N)
  ├─ salle_id → salles.id
  └─ equipement_id → equipements.id

salle_photos       (galerie d'images)
  ├─ id, url
  └─ salle_id → salles.id

reservations
  ├─ id, date, heure_debut, heure_fin
  ├─ type_reservation, statut, prix_total
  ├─ salle_id → salles.id
  └─ utilisateur_id → utilisateurs.id
```

### Relations

| Relation | Type | Description |
|----------|------|-------------|
| types → salles | 1:N | Un type peut s'appliquer à plusieurs salles |
| salles ↔ equipements | N:N | Via `salle_equipements` |
| salles → salle_photos | 1:N | Une salle peut avoir plusieurs photos de galerie |
| utilisateurs → reservations | 1:N | Un utilisateur peut avoir plusieurs réservations |
| salles → reservations | 1:N | Une salle peut avoir plusieurs réservations |

---

### `BaseModel.js`

Classe mère partagée par tous les modèles.

| Méthode | Description |
|---------|-------------|
| `findAll(table)` | `SELECT * FROM table` |
| `findById(id, table)` | `SELECT * FROM table WHERE id = ?` |
| `delete(id, table)` | `DELETE FROM table WHERE id = ?` |
| `getConnection()` | Retourne une connexion du pool (pour les transactions) |

---

## 7. Services et logique métier

### `authService.js`

| Fonction | Description |
|----------|-------------|
| `login(data)` | Cherche l'utilisateur par email, compare le mot de passe via `bcrypt.compare` |
| `generateToken(user)` | Crée un JWT signé (expire dans 7 jours) avec `{ userId, email, nom, role, avatar_url }` |
| `verifyToken(token)` | Valide le JWT, retourne le payload décodé ou `null` |

---

### `reservationService.js`

**`calculatePrice(room, type, heureDebut, heureFin)`**

| Type | Calcul |
|------|--------|
| `heure` | `prix_heure × durée_en_heures` |
| `demi-journee` | `prix_demi_journee` (fixe) |
| `journee` | `prix_journee` (fixe) |

**`getDisponibilite(salleId, date)`**

Vérifie pour chaque créneau si une réservation existante (statut `en-attente` ou `confirmee`) chevauche l'horaire :

```
journée    : 08:00 – 18:00
matin      : 08:00 – 12:00
après-midi : 13:00 – 18:00
```

Retourne `{ journee_disponible, matin_disponible, apres_midi_disponible }`.

**`createReservation(data, userId)`**

Chaîne de validation :
1. Vérification des champs obligatoires
2. Date non passée
3. Salle existante
4. Absence de chevauchement (`Reservation.hasConflict`)
5. Calcul du prix
6. Insertion en base

**`getDashboardStats(userId)`**

Agrège en parallèle :
- `heures_ce_mois` : somme des heures réservées ce mois (confirmées + terminées)
- `taux_presence` : `(confirmées + terminées) / (confirmées + terminées + abandonnées) × 100`
- `monthly[]` : statistiques mensuelles sur l'année
- `type_usage[]` : répartition par formule (heure / demi-journée / journée)

**Mise à jour automatique des statuts expirés**

Avant chaque appel à `getUpcoming` ou `getHistory` :
- `en-attente` expirée → `abandonne`
- `confirmee` expirée → `terminee`

---

### `adminDashboardService.js`

Toutes les requêtes sont exécutées en parallèle via `Promise.all` pour minimiser la latence.

| Requête | Description |
|---------|-------------|
| `COUNT(*) FROM salles` | Nombre total de salles |
| `COUNT(*) WHERE date = CURDATE() AND statut <> 'annulee'` | Réservations du jour |
| `COUNT(*) FROM utilisateurs` | Nombre total d'utilisateurs |
| Calcul taux d'occupation | `(heures_réservées_aujourd'hui / (nb_salles × 10h)) × 100` |
| Tendances mensuelles | 12 mois : total + confirmées (données manquantes = 0) |
| Répartition par type | JOIN salles → types, avec pourcentages |
| 4 dernières réservations | Triées par date décroissante |

**Hypothèse :** 10 heures disponibles par jour et par salle (08h00–18h00).

---

### `uploadService.js`

```
Buffer (req.file.buffer)
  → streamifier.createReadStream()
  → cloudinary.uploader.upload_stream({ folder: 'woorkly/salles' | 'woorkly/avatars' })
  → secure_url retournée au contrôleur
```

---

## 8. Authentification et sécurité

### Flux de connexion complet

```
Client POST /api/auth/login { email, password }
  → Validation (express-validator)
  → Rate limit login (10 req/15min)
  → authService.login()
      → User.findByEmail(email)
      → bcrypt.compare(password, hash)
  → authService.generateToken(user) → JWT (7 jours)
  → res.cookie('token', jwt, { httpOnly, secure, sameSite })
  → Réponse 200 { userId, email, nom, role, avatar_url }
```

### Flux de requête protégée

```
Client GET /api/reservations/me
  → cookie token envoyé automatiquement par le navigateur
  → authRequired middleware
      → jwt.verify(token, JWT_SECRET)
      → req.user = { userId, email, nom, role, avatar_url }
  → Handler de route
```

### Protection CSRF (double-submit cookie)

Le token CSRF est lié à l'identifiant de session (le JWT cookie).

```
1. Frontend : GET /api/csrf-token
   → Backend génère token basé sur (JWT + CSRF_SECRET)
   → Retourne { csrfToken }

2. Frontend stocke token en mémoire (variable JS, jamais localStorage)

3. Pour chaque mutation :
   → Frontend ajoute header x-csrf-token: <token>
   → doubleCsrfProtection middleware valide le header
   → Bloque la requête (403) si invalide
```

### Headers de sécurité (Helmet)

Helmet ajoute automatiquement :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (en production)
- `Content-Security-Policy` (valeurs par défaut)

### CORS

Origines autorisées :
- `http://localhost:5173` (développement)
- `https://dwwm-projet-front-*.vercel.app` (regex Vercel)
- Pas d'origine (outils type Postman/Insomnia)

---

## 9. Upload de fichiers

### Configuration Cloudinary

```
Dossier salles : woorkly/salles
Dossier avatars : woorkly/avatars
```

### Flux complet

```
1. Client : POST /api/upload (multipart/form-data, champ: image)
2. Multer : stocke le fichier en RAM (Buffer, max 5 Mo, image/* uniquement)
3. uploadService.uploadFromBuffer(buffer, 'woorkly/salles')
     → streamifier convertit le Buffer en ReadableStream
     → cloudinary.uploader.upload_stream() uploade vers Cloudinary
     → Retourne { secure_url, ... }
4. Contrôleur retourne { url: secure_url }
5. Frontend stocke l'URL en base via POST/PUT /api/rooms
```

---

## 10. Variables d'environnement

Fichier : `backend/src/.env`

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port d'écoute du serveur | `3000` |
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASS` | Mot de passe MySQL | *(vide en local)* |
| `DB_NAME` | Nom de la base de données | `workly` |
| `JWT_SECRET` | Clé secrète de signature JWT | Chaîne aléatoire longue |
| `CSRF_SECRET` | Clé secrète CSRF | 64 caractères hex recommandés |
| `CLOUDINARY_CLOUD_NAME` | Nom du compte Cloudinary | `dnrtsikua` |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary | — |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | — |
| `NODE_ENV` | Environnement (`production` / `development`) | Affecte cookies et CORS |
| `FRONTEND_ORIGIN` | URL du frontend autorisée en CORS | `http://localhost:5173` |

---

## 11. Codes HTTP utilisés

| Code | Signification | Cas d'utilisation |
|------|--------------|-------------------|
| 200 | OK | Succès général, mise à jour |
| 201 | Créé | Création d'une ressource |
| 400 | Mauvaise requête | Champs manquants, date passée, type invalide |
| 401 | Non authentifié | Token absent ou invalide |
| 403 | Interdit | Rôle insuffisant, propriétaire différent |
| 404 | Introuvable | Ressource inexistante |
| 409 | Conflit | Créneau déjà réservé, utilisateur a des réservations à venir |
| 422 | Entité non traitable | Erreurs de validation (express-validator) |
| 429 | Trop de requêtes | Rate limit dépassé |
| 500 | Erreur serveur | Erreur inattendue |
| 502 | Mauvaise passerelle | API de géocodage indisponible |
