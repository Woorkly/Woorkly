# Woorkly — Documentation Frontend

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Routing et pages](#4-routing-et-pages)
5. [Contexte et authentification](#5-contexte-et-authentification)
6. [Hooks personnalisés](#6-hooks-personnalisés)
7. [Services API](#7-services-api)
8. [Composants](#8-composants)
9. [Sécurité frontend](#9-sécurité-frontend)
10. [Variables d'environnement](#10-variables-denvironnement)

---

## 1. Vue d'ensemble

Woorkly est une application de réservation de salles de réunion. Le frontend est une **Single Page Application (SPA)** React. Il communique avec un backend Express/Node.js via une API REST sécurisée (cookies HttpOnly, CSRF, rate limiting).

L'application propose deux espaces distincts :
- **Espace public** : consultation des salles, inscription, connexion
- **Espace admin** : tableau de bord analytique, gestion des salles, réservations et utilisateurs
- **Espace utilisateur** : tableau de bord personnel, historique et statistiques de réservation

---

## 2. Stack technique

| Outil | Version | Rôle |
|-------|---------|------|
| React | 19.2.6 | Framework UI |
| Vite | 8.0.12 | Build tool et serveur de développement |
| React Router DOM | 7.15.0 | Routing côté client |
| Axios | 1.16.0 | Client HTTP avec intercepteurs |
| Recharts | 2.15.4 | Graphiques (area, bar, donut) |
| FullCalendar | 6.1.20 | Calendrier interactif des réservations |
| Leaflet / React-Leaflet | 1.9.4 / 5.0.0 | Cartes interactives avec marqueurs |
| ESLint | 10.3.0 | Linting du code |

---

## 3. Architecture du projet

```
frontend/src/
├── main.jsx                         # Point d'entrée : BrowserRouter + AuthProvider
├── App.jsx                          # Définition de toutes les routes
├── index.css                        # Variables CSS globales + animations
│
├── context/
│   └── AuthContext.jsx              # État global d'authentification (user, login, logout)
│
├── hooks/
│   ├── useAuth.js                   # Consommateur du AuthContext
│   ├── useRooms.js                  # Récupération des salles (liste, détail, filtrée)
│   ├── useReservation.js            # Création d'une réservation
│   ├── useUsers.js                  # Liste et gestion des utilisateurs (admin)
│   └── useAdminDashboard.js         # Données analytiques pour le dashboard admin
│
├── services/
│   ├── api.js                       # Instance Axios + intercepteurs CSRF + 429
│   ├── authService.js               # Appels /auth (login, logout, me)
│   ├── roomService.js               # Appels /rooms (CRUD + disponibilités)
│   ├── reservationService.js        # Appels /reservations (CRUD + stats)
│   ├── userService.js               # Appels /users (CRUD + avatar)
│   ├── equipmentService.js          # Appels /equipements
│   ├── typeService.js               # Appels /types
│   ├── adminDashboardService.js     # Appels /admin/dashboard
│   └── GestionSallesModal.jsx       # Composant modal formulaire salle
│
├── layouts/
│   ├── AdminLayout.jsx              # Sidebar fixe + contenu principal (responsive)
│   └── PublicLayout.jsx             # Header + Outlet + Footer
│
├── components/
│   ├── header.jsx                   # Navigation principale
│   ├── footer.jsx                   # Pied de page marketing
│   ├── AdminSidebar.jsx             # Barre latérale admin
│   ├── ProtectedRoute.jsx           # Garde de route (auth + rôle)
│   ├── Button.jsx                   # Bouton réutilisable (variantes, loading)
│   ├── ScrollToTop.jsx              # Scroll automatique au changement de route
│   ├── RateLimitToast.jsx           # Toast d'erreur 429 (rate limit)
│   │
│   ├── common/
│   │   ├── Avatar.jsx               # Avatar utilisateur (image ou initiales)
│   │   ├── KPICard.jsx              # Carte de métrique (tile / card)
│   │   ├── Pagination.jsx           # Contrôles de pagination
│   │   ├── RoleBadge.jsx            # Badge rôle (Admin / Utilisateur)
│   │   └── StatusBadge.jsx          # Badge statut de réservation
│   │
│   ├── charts/
│   │   ├── ChartShell.jsx           # Wrapper carte pour les graphiques
│   │   ├── AreaTrendChart.jsx       # Graphique tendance mensuelle (area)
│   │   ├── BarChartCard.jsx         # Graphique activité mensuelle (barres)
│   │   └── DonutChart.jsx           # Graphique répartition par type (donut)
│   │
│   └── icons/
│       └── Icons.jsx                # SVG centralisés (Œil, Crayon, Poubelle, Loupe)
│
├── page/
│   ├── Landing/                     # Page d'accueil marketing
│   ├── Login/                       # Formulaire de connexion
│   ├── Register/                    # Formulaire d'inscription
│   ├── Rooms/                       # Liste des salles + carte Leaflet
│   ├── SalleDetail/                 # Détail d'une salle (galerie, équipements, carte)
│   ├── FormReservation/             # Formulaire de réservation (formule, créneau)
│   ├── NotFound/                    # Page 404
│   └── Dashboard/
│       ├── DashBoardAdmin/          # Pages admin (tableau de bord, salles, réservations, users)
│       └── DashboardUser/           # Tableau de bord utilisateur
│
└── utils/
    └── dateUtils.js                 # Utilitaires de formatage de dates/heures
```

---

## 4. Routing et pages

### Routes publiques (accessibles sans connexion)

| Chemin | Composant | Description |
|--------|-----------|-------------|
| `/` | `Landing` | Page d'accueil : présentation, galerie de salles, FAQ, contact |
| `/salle` | `Rooms` | Recherche et liste des salles avec filtres + carte Leaflet |
| `/salle/:id` | `SalleDetail` | Détail d'une salle : galerie, équipements, tarifs, localisation |
| `/login` | `Login` | Formulaire de connexion par email/mot de passe |
| `/register` | `Register` | Formulaire d'inscription |
| `*` | `NotFound` | Page 404 |

### Routes protégées — utilisateurs et admins

| Chemin | Rôles | Description |
|--------|-------|-------------|
| `/reservation/:roomId` | user, admin | Formulaire de réservation : choix de la formule et du créneau |

### Routes protégées — utilisateurs

| Chemin | Rôles | Description |
|--------|-------|-------------|
| `/dashboardUser` | user | Tableau de bord : KPIs, graphiques, tableaux de réservations, profil |

### Routes protégées — admins

| Chemin | Rôles | Description |
|--------|-------|-------------|
| `/dashboardAdmin` | admin | Analytique : 4 KPIs, tendances mensuelles, répartition par type, dernières réservations |
| `/Gestionsalles` | admin | CRUD des salles : création, édition, suppression, upload photos |
| `/GestionReservations` | admin | Calendrier FullCalendar + filtres + changement de statut |
| `/GestionUser` | admin | Liste des utilisateurs, fiche détail, changement de rôle, suppression |

### Logique de redirection (`ProtectedRoute`)

1. Si l'utilisateur n'est pas authentifié → redirige vers `/login`
2. Si le rôle ne correspond pas → redirige vers le dashboard du rôle réel
   - Admin sur une route user → `/dashboardAdmin`
   - User sur une route admin → `/dashboardUser`

---

## 5. Contexte et authentification

### `AuthContext.jsx`

Fournit l'état d'authentification global à toute l'application via React Context.

**État exposé :**

| Propriété | Type | Description |
|-----------|------|-------------|
| `user` | `object \| null` | Objet utilisateur (id, nom, email, role, avatar_url) ou null |
| `loading` | `boolean` | true pendant la vérification initiale de session |
| `isAuthenticated` | `boolean` | Raccourci : `!!user` |
| `login(credentials)` | `function` | POST /auth/login + met à jour `user` |
| `logout()` | `function` | POST /auth/logout + vide `user` |
| `refreshUser()` | `function` | Relit /auth/me (après modification de profil) |
| `updateUser(patch)` | `function` | Merge partiel de l'objet user sans appel réseau |

**Flux de vérification de session au démarrage :**

```
App mount
  └─ AuthProvider useEffect
       └─ authService.me() → GET /auth/me (cookie HttpOnly envoyé automatiquement)
            ├─ succès → setUser(userData)
            └─ échec  → setUser(null)
                └─ setLoading(false) dans tous les cas
```

### `useAuth.js`

Hook consommateur du contexte — à utiliser dans tous les composants nécessitant les données utilisateur.

```js
const { user, loading, login, logout, isAuthenticated } = useAuth()
```

---

## 6. Hooks personnalisés

### `useRooms(filters)`

Récupère les salles selon les filtres passés en paramètre.

| Filtre | Comportement |
|--------|-------------|
| `filters.roomId` | Récupère une seule salle par id (`GET /rooms/:id`) |
| `filters.date` | Récupère les salles disponibles (`GET /rooms/available`) |
| aucun | Récupère toutes les salles (`GET /rooms`) |

**Retourne :** `{ rooms, room, loading, error }`

Se re-déclenche automatiquement à chaque changement de filtres (via `JSON.stringify`).

---

### `useReservation()`

Encapsule la création d'une réservation avec gestion des états loading/erreur.

**Retourne :** `{ createReservation, loading, error }`

---

### `useUsers()`

Charge la liste complète des utilisateurs et calcule les champs dérivés (initiales, couleur d'avatar, libellé de rôle).

**Retourne :** `{ users, loading, error, updateUserInList, removeUserFromList }`

| Méthode | Description |
|---------|-------------|
| `updateUserInList(id, role)` | Met à jour le rôle d'un user dans la liste locale sans refetch |
| `removeUserFromList(id)` | Retire un user de la liste locale après suppression |

---

### `useAdminDashboard()`

Agrège en parallèle les données de 4 endpoints pour alimenter le dashboard admin.

**Sources :** `adminDashboardService`, `roomService`, `userService`, `reservationService`

**Calcul des KPIs côté client :**

| KPI | Calcul |
|-----|--------|
| `total_salles` | `rooms.length` |
| `total_utilisateurs` | `users.length` |
| `reservations_today` | Réservations du jour hors `annulee` |
| `taux_occupation` | `(heures_réservées_ce_mois / (nb_salles × 10h × nb_jours_écoulés)) × 100` |

**Fallback :** En cas d'échec des appels parallèles, retombe sur `adminDashboardService` seul.

**Retourne :** `{ dashboard, loading, error }`

---

## 7. Services API

### `api.js` — Instance Axios centrale

Toutes les requêtes passent par cette instance.

```js
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000/api',
  withCredentials: true,  // envoie le cookie HttpOnly automatiquement
})
```

**Intercepteur requête — CSRF :**
- Avant chaque mutation (POST, PUT, PATCH, DELETE), vérifie si un token CSRF est en mémoire
- Si absent, appelle `GET /csrf-token` pour en obtenir un
- Ajoute `x-csrf-token: <token>` dans les headers
- En cas de 403 (token expiré), renouvelle le token et rejoue la requête une seule fois (`_csrfRetry`)

**Intercepteur réponse — Rate Limit 429 :**
- Si le serveur répond 429, dispatch un `CustomEvent('rate-limit')` sur `window`
- Le composant `RateLimitToast` écoute cet événement et affiche un message à l'utilisateur

---

### `authService.js`

| Méthode | Requête | Description |
|---------|---------|-------------|
| `login(credentials)` | POST /auth/login | Connexion, reçoit { email, password } |
| `logout()` | POST /auth/logout | Déconnexion, demande au backend de supprimer le cookie |
| `me()` | GET /auth/me | Vérifie la session active et retourne l'utilisateur |

---

### `roomService.js`

| Méthode | Requête | Description |
|---------|---------|-------------|
| `getRooms(filters)` | GET /rooms | Liste toutes les salles, filtres optionnels |
| `getAvailableRooms(filters)` | GET /rooms/available | Salles disponibles à une date donnée |
| `getRoomById(id)` | GET /rooms/:id | Détail d'une salle |
| `getRoomAvailability(id, date)` | GET /rooms/:id/availability | Disponibilité d'une salle |
| `createRoom(data)` | POST /rooms | Crée une salle (admin) |
| `updateRoom(id, data)` | PUT /rooms/:id | Met à jour une salle (admin) |
| `deleteRoom(id)` | DELETE /rooms/:id | Supprime une salle (admin) |

---

### `reservationService.js`

| Méthode | Requête | Description |
|---------|---------|-------------|
| `createReservation(data)` | POST /reservations | Crée une réservation |
| `getMyUpcoming()` | GET /reservations/me/upcoming | Prochaines réservations de l'utilisateur |
| `getMyHistory()` | GET /reservations/me/history | Historique de l'utilisateur |
| `getMyStats()` | GET /reservations/me/stats | KPIs et graphiques utilisateur |
| `getAllReservations(filters)` | GET /reservations | Toutes les réservations (admin) |
| `getFiltersData()` | GET /reservations/filters-data | Listes salles/users pour les menus déroulants |
| `updateStatut(id, statut)` | PATCH /reservations/:id/statut | Change le statut (admin) |
| `getDisponibilite(salleId, date)` | GET /reservations/disponibilite | Créneaux disponibles pour une salle/date |

---

### `userService.js`

| Méthode | Requête | Description |
|---------|---------|-------------|
| `register(data)` | POST /users | Inscription avec role='user' par défaut |
| `getAllUsers()` | GET /users | Liste tous les utilisateurs (admin) |
| `updateUserRole(id, role)` | PATCH /users/:id | Change le rôle d'un user (admin) |
| `deleteUser(id)` | DELETE /users/:id | Supprime un user (admin) |
| `getUserReservations(id)` | GET /reservations/user/:id | Réservations d'un user (admin) |
| `uploadAvatar(file)` | POST /upload | Upload d'une image vers Cloudinary |
| `updateMyProfile(id, data)` | PATCH /users/:id | Mise à jour du profil connecté |

---

## 8. Composants

### Layouts

**`AdminLayout`**
- Desktop : sidebar fixe à gauche + contenu à droite
- Mobile : header avec menu hamburger + menu déroulant
- Détecte la route active pour surligner le bouton de navigation correspondant

**`PublicLayout`**
- Header en haut, contenu au centre, footer en bas
- Footer masqué sur `/dashboardUser`

### `ProtectedRoute`

Garde de route qui vérifie l'état d'authentification et le rôle.

Comportement :
1. Si `loading` → rendu null (attente de la vérification de session)
2. Si pas de `user` → `<Navigate to="/login" />`
3. Si rôle non autorisé → redirection vers le dashboard du rôle réel
4. Sinon → `<Outlet />`

### Composants communs

**`Avatar`**
- Affiche l'image Cloudinary si `avatar_url` est défini
- Sinon, affiche les initiales dans un cercle coloré
- Couleur assignée par `COLORS[(user.id - 1) % 7]`

**`KPICard`**
- Variante `tile` : grande carte pleine couleur (dashboard admin)
- Variante `card` : carte légère avec bordure (dashboard utilisateur)
- Props : `label`, `value`, `unit`, `color`, `variant`

**`Pagination`**
- Props : `page`, `total`, `pageSize`, `onChange`
- Ne s'affiche que si `total > pageSize`
- Taille de page par défaut : 5

**`StatusBadge`**
- Statuts : `en-attente` (jaune), `confirmee` (vert), `annulee` (rouge), `terminee` (gris), `abandonne` (orange)

**`RateLimitToast`**
- Écoute l'événement `CustomEvent('rate-limit')` déclenché par l'intercepteur Axios
- Affiche un toast rouge en bas à droite avec le message du backend
- Fermeture automatique après 8 secondes, ou manuelle via le bouton ✕

### Graphiques (Recharts)

**`AreaTrendChart`** — Tendances mensuelles (dashboard admin)
- Axe X : mois de l'année
- Deux séries : total réservations vs confirmées

**`BarChartCard`** — Activité mensuelle (dashboard utilisateur)
- Axe X : mois de l'année
- Deux séries : total réservations vs annulations

**`DonutChart`** — Répartition par type
- Affiche les pourcentages par type de salle ou formule de réservation
- Gère l'état vide avec un message dédié
- Légende colorée avec pourcentages

### `GestionSallesModal`

Composant modal pour la création et l'édition des salles (admin).

Fonctionnalités :
- Upload d'image principale + galerie de photos
- Sélection multiple d'équipements
- Sélection du type de salle
- Validation et affichage des erreurs

---

## 9. Sécurité frontend

### Authentification par cookies HttpOnly

Le token JWT est stocké dans un cookie `HttpOnly` posé par le backend. JavaScript n'y a jamais accès directement, ce qui protège contre les attaques XSS.

```
Browser ──cookie: token=<JWT>──▶ Backend
```

### Protection CSRF (double-submit cookie)

Pour chaque requête mutation (POST/PUT/PATCH/DELETE) :
1. Un token CSRF est récupéré depuis `GET /api/csrf-token` (une seule fois)
2. Il est ajouté en header `x-csrf-token`
3. Le backend valide ce header via `csrf-csrf`
4. En cas d'expiration (403), le token est renouvelé et la requête rejouée automatiquement

### Rate limiting (429)

Le backend limite chaque IP à 100 requêtes par 15 minutes (10 pour `/login`). Quand cette limite est atteinte :
1. Le backend répond 429 avec un message JSON
2. L'intercepteur Axios dispatch un `CustomEvent('rate-limit')`
3. `RateLimitToast` affiche le message à l'utilisateur

---

## 10. Variables d'environnement

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `VITE_API_BASE` | `http://localhost:3000/api` | URL de base de l'API backend |

À définir dans un fichier `.env` à la racine du dossier `frontend/`.
