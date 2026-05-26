# PROJET : Déploiement de la base de données MySQL sur Alwaysdata

## Étape 1 : Création du compte et configuration de l'offre

- Inscription sur le site admin.alwaysdata.com avec l'adresse e-mail de l'école.
- Sélection du plan gratuit "Free Cloud" offrant 100 Mo d'espace (permet d'éviter la demande de carte bancaire).
- Accès au panneau d'administration global (Admin).

## Étape 2 : Création de la base de données MySQL

- Aller dans le menu de gauche : "Bases de données" -> "MySQL".
- Noter les informations de connexion fournies dans l'encadré beige : Host : mysql-woorkly.alwaysdata.net
- Utilisateur par défaut : woorkly

- Cliquer sur "Ajouter une base de données".
- Remplir le nom de la base pour obtenir le nom complet : "woorkly_db".
- Laisser les permissions sur "Tous les droits" pour l'utilisateur "woorkly".
- Définir un mot de passe sécurisé pour la base et valider.

## Étape 3 : Exportation des données locales (Wamp)

- Ouvrir le phpMyAdmin local (localhost/phpmyadmin) sur le PC.
- Sélectionner la base de données locale du projet ("workly").
- Aller dans l'onglet "Exporter".
- Choisir la méthode "Rapide" et le format "SQL", puis cliquer sur Exporter pour télécharger le fichier .sql contenant la structure et les données de test (Insomnia).

## Étape 4 : Importation sur Alwaysdata

- Depuis le panneau Alwaysdata, cliquer sur le lien rouge "phpMyAdmin" dans l'encadré beige.
- Se connecter avec l'utilisateur "woorkly" et le mot de passe de la base.
- Dans la colonne de gauche de phpMyAdmin en ligne, cliquer sur la base "woorkly_db".
- Aller dans l'onglet "Importer".
- Choisir le fichier .sql précédemment exporté depuis le PC.
- Cliquer sur "Exécuter" / "Importer" tout en bas.
- Résultat : Même si une erreur de création de base peut apparaître à cause des restrictions de droits d'Alwaysdata, les tables (users, appointments, etc.) et les données se créent correctement et la base est fonctionnelle en ligne.