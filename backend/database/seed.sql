-- On s'assure d'utiliser la bonne base
USE `workly`;

-- 1. Insertion des Types (Bureau, Réunion, etc.)
INSERT INTO `types` (nom) 
SELECT * FROM (SELECT 'Bureau privé') AS tmp WHERE NOT EXISTS (SELECT nom FROM `types` WHERE nom = 'Bureau privé') LIMIT 1;
INSERT INTO `types` (nom) 
SELECT * FROM (SELECT 'Salle de réunion') AS tmp WHERE NOT EXISTS (SELECT nom FROM `types` WHERE nom = 'Salle de réunion') LIMIT 1;
INSERT INTO `types` (nom) 
SELECT * FROM (SELECT 'Open Space') AS tmp WHERE NOT EXISTS (SELECT nom FROM `types` WHERE nom = 'Open Space') LIMIT 1;

-- 2. Insertion des Équipements
INSERT INTO `equipements` (nom) 
SELECT * FROM (SELECT 'Wi-Fi') AS tmp WHERE NOT EXISTS (SELECT nom FROM `equipements` WHERE nom = 'Wi-Fi') LIMIT 1;
INSERT INTO `equipements` (nom) 
SELECT * FROM (SELECT 'Vidéoprojecteur') AS tmp WHERE NOT EXISTS (SELECT nom FROM `equipements` WHERE nom = 'Vidéoprojecteur') LIMIT 1;
INSERT INTO `equipements` (nom) 
SELECT * FROM (SELECT 'Machine à café') AS tmp WHERE NOT EXISTS (SELECT nom FROM `equipements` WHERE nom = 'Machine à café') LIMIT 1;

-- 3. Utilisateur de test Jean Workly (password: password123 — plain, non bcrypt)
INSERT INTO `utilisateurs` (nom, email, password, avatar_url, role)
SELECT * FROM (SELECT 'Jean Workly', 'jean@workly.fr', 'password123', 'avatar1.png', 'user') AS tmp
WHERE NOT EXISTS (SELECT email FROM `utilisateurs` WHERE email = 'jean@workly.fr') LIMIT 1;

-- 3b. Utilisateur partagé équipe (password: AZERTY!123)
INSERT INTO `utilisateurs` (nom, email, password, avatar_url, role)
SELECT * FROM (SELECT 'Gadjou Bernard', 'gadjou@gmail.com', '$2b$10$mMcGbxB6yDwa.E8T6Uvs0e80gaYEGSn1rEu8IMR6IKGVipIXK74mG', 'default-avatar.png', 'user') AS tmp
WHERE NOT EXISTS (SELECT email FROM `utilisateurs` WHERE email = 'gadjou@gmail.com') LIMIT 1;

-- 4. Insertion d'une salle de test
INSERT INTO `salles` (nom, statut, adresse, code_postal, ville, capacite, prix_heure, prix_demi_journee, prix_journee, image_principale, type_id)
SELECT * FROM (SELECT 'La Station', 'disponible', '12 Rue de la République', '13001', 'Marseille', 6, 25.00, 75.00, 150.00, 'default-room.jpg', 2) AS tmp
WHERE NOT EXISTS (SELECT nom FROM `salles` WHERE nom = 'La Station') LIMIT 1;

-- 4b. Mise à jour des prix si La Station existait déjà sans prix_demi_journee/prix_journee
UPDATE `salles`
SET prix_demi_journee = 75.00, prix_journee = 150.00
WHERE nom = 'La Station' AND (prix_demi_journee IS NULL OR prix_journee IS NULL);

-- 5. Réservations de test pour jean@workly.fr (insère seulement si aucune réservation n'existe)
INSERT INTO `reservations` (date, heure_debut, heure_fin, type_reservation, statut, prix_total, salle_id, utilisateur_id)
SELECT d, hd, hf, tr, st, pt,
    (SELECT id FROM salles       WHERE nom   = 'La Station'    LIMIT 1) AS salle_id,
    (SELECT id FROM utilisateurs WHERE email = 'gadjou@gmail.com' LIMIT 1) AS utilisateur_id
FROM (
    -- ── Janvier 2026 : 3 réservations, 1 annulation ──
    SELECT '2026-01-08' d, '09:00:00' hd, '12:00:00' hf, 'demi-journee' tr, 'terminee'   st,  75.00 pt UNION ALL
    SELECT '2026-01-15',   '14:00:00',    '15:00:00',    'heure',          'annulee',         25.00     UNION ALL
    SELECT '2026-01-22',   '09:00:00',    '17:00:00',    'journee',        'terminee',        150.00    UNION ALL
    -- ── Février 2026 : 3 réservations, 0 annulation ──
    SELECT '2026-02-05',   '09:00:00',    '12:00:00',    'demi-journee',   'terminee',        75.00     UNION ALL
    SELECT '2026-02-12',   '10:00:00',    '11:00:00',    'heure',          'terminee',        25.00     UNION ALL
    SELECT '2026-02-26',   '09:00:00',    '12:00:00',    'demi-journee',   'abandonne',       75.00     UNION ALL
    -- ── Mars 2026 : 4 réservations, 1 annulation ──
    SELECT '2026-03-04',   '09:00:00',    '17:00:00',    'journee',        'terminee',        150.00    UNION ALL
    SELECT '2026-03-11',   '14:00:00',    '16:00:00',    'heure',          'terminee',        50.00     UNION ALL
    SELECT '2026-03-18',   '09:00:00',    '12:00:00',    'demi-journee',   'annulee',         75.00     UNION ALL
    SELECT '2026-03-25',   '10:00:00',    '12:00:00',    'heure',          'terminee',        50.00     UNION ALL
    -- ── Avril 2026 : 3 réservations, 1 annulation ──
    SELECT '2026-04-02',   '09:00:00',    '17:00:00',    'journee',        'terminee',        150.00    UNION ALL
    SELECT '2026-04-16',   '09:00:00',    '12:00:00',    'demi-journee',   'annulee',         75.00     UNION ALL
    SELECT '2026-04-23',   '14:00:00',    '16:00:00',    'heure',          'terminee',        50.00     UNION ALL
    -- ── Mai 2026 : 4 réservations, 0 annulation ──
    SELECT '2026-05-07',   '09:00:00',    '17:00:00',    'journee',        'terminee',        150.00    UNION ALL
    SELECT '2026-05-14',   '09:00:00',    '12:00:00',    'demi-journee',   'terminee',        75.00     UNION ALL
    SELECT '2026-05-21',   '14:00:00',    '16:00:00',    'heure',          'terminee',        50.00     UNION ALL
    SELECT '2026-05-28',   '09:00:00',    '10:00:00',    'heure',          'abandonne',       25.00     UNION ALL
    -- ── Juin 2026 — passé (avant le 04/06/2026) ──
    SELECT '2026-06-02',   '09:00:00',    '12:00:00',    'demi-journee',   'terminee',        75.00     UNION ALL
    SELECT '2026-06-03',   '14:00:00',    '16:00:00',    'heure',          'terminee',        50.00     UNION ALL
    -- ── Juin 2026 — à venir ──
    SELECT '2026-06-10',   '09:00:00',    '10:00:00',    'heure',          'en-attente',      25.00     UNION ALL
    SELECT '2026-06-17',   '09:00:00',    '12:00:00',    'demi-journee',   'confirmee',       75.00     UNION ALL
    SELECT '2026-06-24',   '09:00:00',    '17:00:00',    'journee',        'en-attente',      150.00    UNION ALL
    -- ── Juillet 2026 — à venir ──
    SELECT '2026-07-08',   '14:00:00',    '16:00:00',    'heure',          'en-attente',      50.00
) AS data
WHERE NOT EXISTS (
    SELECT 1 FROM reservations
    WHERE utilisateur_id = (SELECT id FROM utilisateurs WHERE email = 'gadjou@gmail.com' LIMIT 1)
);