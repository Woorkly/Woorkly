-- ============================================================
-- SCRIPT DE MIGRATION SÉCURISÉ - PROJET WOORKLY
-- Ce script crée la structure sans écraser les données existantes.
-- ============================================================

-- 1. Création de la base de données
CREATE DATABASE IF NOT EXISTS `workly` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `workly`;

-- 2. Table des types de salles
CREATE TABLE IF NOT EXISTS `types` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 3. Table des équipements
CREATE TABLE IF NOT EXISTS `equipements` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 4. Table des utilisateurs
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'user'
) ENGINE=InnoDB;

-- 5. Table des salles
CREATE TABLE IF NOT EXISTS `salles` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `statut` VARCHAR(20) DEFAULT 'disponible',
  `adresse` VARCHAR(255),
  `code_postal` VARCHAR(10),
  `ville` VARCHAR(100),
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `capacite` INT,
  `description` TEXT,
  `prix_heure` DECIMAL(5, 2),
  `prix_demi_journee` DECIMAL(5, 2),
  `prix_journee` DECIMAL(6, 2),
  `type_id` INT NOT NULL,
  CONSTRAINT `fk_salle_type` FOREIGN KEY (`type_id`) REFERENCES `types`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Table des réservations
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `heure_debut` TIME NOT NULL,
  `heure_fin` TIME NOT NULL,
  `type_reservation` VARCHAR(50), 
  `statut` VARCHAR(20) DEFAULT 'en-attente',
  `prix_total` DECIMAL(7, 2),
  `salle_id` INT NOT NULL,
  `utilisateur_id` INT NOT NULL,
  CONSTRAINT `fk_reserva_salle` FOREIGN KEY (`salle_id`) REFERENCES `salles`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reserva_user` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Table de liaison (Many-to-Many)
CREATE TABLE IF NOT EXISTS `salle_equipements` (
  `salle_id` INT NOT NULL,
  `equipement_id` INT NOT NULL,
  PRIMARY KEY (`salle_id`, `equipement_id`),
  CONSTRAINT `fk_pivot_salle` FOREIGN KEY (`salle_id`) REFERENCES `salles`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pivot_equip` FOREIGN KEY (`equipement_id`) REFERENCES `equipements`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- ZONE DE MISE À JOUR (ALTER TABLE)
-- Ajoutez vos modifications ci-dessous pour ne pas perdre de données
-- ============================================================

-- Exemple pour plus tard :
-- ALTER TABLE `utilisateurs` ADD COLUMN IF NOT EXISTS `avatar_url` VARCHAR(255);