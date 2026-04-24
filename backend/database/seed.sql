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

-- 3. Insertion d'un utilisateur de test (password: password123)
INSERT INTO `utilisateurs` (nom, email, password, role)
SELECT * FROM (SELECT 'Jean Workly', 'jean@workly.fr', 'password123', 'user') AS tmp 
WHERE NOT EXISTS (SELECT email FROM `utilisateurs` WHERE email = 'jean@workly.fr') LIMIT 1;

-- 4. Insertion d'une salle de test
INSERT INTO `salles` (nom, statut, adresse, code_postal, ville, capacite, prix_heure, type_id)
SELECT * FROM (SELECT 'La Station', 'disponible', '12 Rue de la République', '13001', 'Marseille', 6, 25.00, 2) AS tmp 
WHERE NOT EXISTS (SELECT nom FROM `salles` WHERE nom = 'La Station') LIMIT 1;