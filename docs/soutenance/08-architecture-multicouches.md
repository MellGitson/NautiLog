# Architecture Multi-Couches : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

1. Introduction : deux notions à ne pas confondre
2. Modèle MVC (couche logique)
3. Architecture n-tiers (tiers physique)
4. Séparation des responsabilités : bonnes pratiques de code

---

## 1. Introduction : deux notions à ne pas confondre

Ce document distingue volontairement deux notions souvent confondues dans un dossier CDA :

- **Le modèle MVC** est un patron de conception **logique** : il organise le code d'une application au sein d'une même couche applicative (ici, le backend), en séparant la réception de requête, la logique métier et la représentation des données.
- **L'architecture n-tiers** est une organisation **physique** : elle décrit comment les différentes responsabilités de l'application sont réparties sur des processus, conteneurs ou machines distincts.

NautiLog applique les deux, à des niveaux différents : un MVC adapté (sans vue serveur, l'API étant consommée par un frontend séparé) à l'intérieur du backend, et une architecture n-tiers au niveau du déploiement Docker Compose.

---

## 2. Modèle MVC (couche logique)

### 2.1 Adaptation du MVC à une API REST

NautiLog n'utilise pas de MVC "classique" avec génération de vues HTML côté serveur (pas de moteur de template Twig exposé au client) : le backend Symfony est une **API REST pure**, consommée par une SPA React. Le triptyque MVC est donc réinterprété comme suit :

| Rôle MVC classique | Équivalent dans NautiLog | Exemple |
|---|---|---|
| **Modèle** (Model) | Entités Doctrine + Repositories | `Boat`, `Reservation`, `ReservationRepository` |
| **Vue** (View) | Représentation JSON sérialisée de la ressource (pas de rendu HTML serveur) | Réponse `Symfony\Component\Serializer` sur `GET /api/bateaux/{id}` |
| **Contrôleur** (Controller) | Contrôleurs Symfony, point d'entrée HTTP | `BateauController`, `ReservationController` |

Le "V" de MVC est donc délégué entièrement au frontend React, qui reçoit du JSON et construit sa propre représentation visuelle, cohérent avec l'architecture API-first du projet (cf. `03-cahier-des-charges.md`, section 5.1).

### 2.2 Où se trouve la logique métier ?

Un contrôleur "gras" (fat controller) contenant toute la logique métier est une anti-pattern classique du MVC mal appliqué. NautiLog évite cet écueil en extrayant la logique métier complexe vers une couche **Service** dédiée, que le contrôleur orchestre sans l'implémenter lui-même :

- `ReservationController` délègue la détection de conflit de dates à `ReservationRepository::trouverChevauchement()` plutôt que de l'implémenter en boucle PHP dans le contrôleur.
- `ProfilController::supprimer()` délègue l'intégralité de la logique de suppression RGPD en cascade à `SuppressionCompteService`, le contrôleur ne faisant qu'appeler ce service et retourner la réponse HTTP.
- `EncryptionService` encapsule le chiffrement AES-256-CBC, invoqué automatiquement par un `EventListener` Doctrine plutôt que par chaque contrôleur individuellement.

Ce détail est développé en section 4 (Séparation des responsabilités) et illustré par les diagrammes de séquence de `07-conception-uml.md`.

---

## 3. Architecture n-tiers (tiers physique)

### 3.1 Les tiers de NautiLog

L'architecture n-tiers concerne la répartition physique de l'application sur des processus/conteneurs distincts, indépendamment de l'organisation interne du code. NautiLog est structuré en **4 tiers physiques**, orchestrés par Docker Compose :

```
Tier 1 : Client        : Navigateur (exécute le bundle React/Vite)
Tier 2 : Présentation   : Nginx (reverse-proxy, point d'entrée unique, port 80)
Tier 3 : Application    : Conteneur "api", Symfony / PHP-FPM (logique métier, API REST)
Tier 4 : Données        : Conteneur "db", PostgreSQL 15
```

Un service complémentaire, `mailhog` (capture des emails sortants), n'est pas un tier applicatif mais un outil de développement.

### 3.2 Pourquoi cette distinction compte

Le piège classique évoqué dans la checklist est de confondre le tier "présentation" (Nginx, qui ne fait que router les requêtes) avec la "vue" du MVC (qui, elle, n'existe pas côté serveur dans NautiLog, cf. section 2.1). Nginx ne génère aucune donnée métier : il route `/` vers le conteneur `client` (serveur de développement Vite) et `/api` vers le conteneur `api` (PHP-FPM), sans connaître la logique applicative de part et d'autre.

### 3.3 Bénéfice de la séparation physique

Chaque tier peut évoluer, être redéployé ou mis à l'échelle indépendamment : le frontend (Tier 1-2) pourrait être servi par un CDN statique sans toucher au backend, et l'API (Tier 3) pourrait être répliquée horizontalement sans modifier le frontend, car aucun état de session n'est partagé (authentification stateless par JWT, cf. `03-cahier-des-charges.md`, section 6.1).

---

## 4. Séparation des responsabilités : bonnes pratiques de code

### 4.1 Couches internes du backend

Au sein du Tier 3 (Application), le code backend est lui-même structuré en couches internes, chacune avec une responsabilité unique et un dossier dédié (`backend/src/`) :

| Dossier | Couche | Responsabilité |
|---|---|---|
| `Controller/` | Présentation HTTP | Réception de la requête, appel de la validation et des services, formatage de la réponse |
| `Dto/` | Transfert de données | Structure des données entrantes, découplée de l'entité de persistance |
| `Entity/` | Modèle de domaine | Représentation objet des tables, relations Doctrine |
| `Repository/` | Accès aux données | Requêtes DQL/SQL spécifiques (ex. `trouverChevauchement()`), encapsulées hors du contrôleur |
| `Service/` | Logique métier | Règles métier réutilisables et indépendantes du contexte HTTP (`SuppressionCompteService`, `EncryptionService`, `NotificationService`, `WeatherService`) |
| `Security/` | Autorisation | Voters Symfony pour le contrôle d'accès fin (`BoatVoter`) |
| `EventListener/` | Transverse | Traitements automatiques déclenchés par le cycle de vie Doctrine (chiffrement à la volée) |
| `Attribute/` | Métadonnées | Attributs PHP personnalisés (ex. `#[Encrypted]`) pilotant le comportement de l'EventListener |

### 4.2 Pourquoi cette séparation plutôt qu'un contrôleur monolithique

| Bénéfice | Illustration concrète |
|---|---|
| Testabilité | Les tests fonctionnels (`backend/tests/Controller/*`) valident le comportement HTTP sans avoir à dupliquer la logique métier dans chaque test |
| Réutilisabilité | `NotificationService` est appelé aussi bien depuis `ReservationController` (notification de réservation) que depuis `SuppressionCompteService` (notification RGPD) sans duplication de code |
| Évolutivité | Ajouter une nouvelle propriété chiffrée ne nécessite qu'un attribut `#[Encrypted]`, sans toucher aux contrôleurs (mécanisme transverse via `EventListener`) |
| Lisibilité | Un contrôleur reste court et lisible : il orchestre, il n'implémente pas la règle métier lui-même |

### 4.3 Autorisation fine : le rôle du Voter

`BoatVoter` illustre une séparation des responsabilités appliquée à l'autorisation : plutôt que de vérifier "est-ce que cet utilisateur est propriétaire de ce bateau ?" dans chaque contrôleur concerné (`BateauController`, futurs contrôleurs liés aux bateaux), cette règle est centralisée dans un unique Voter, invoqué via `denyAccessUnlessGranted('BOAT_EDIT', $boat)`. Toute nouvelle route touchant à un bateau réutilise cette règle sans la réécrire.

---

## Synthèse

| Niveau | Patron appliqué | Où le voir dans le projet |
|---|---|---|
| Logique (au sein du backend) | MVC adapté à une API REST (Modèle = Entity/Repository, Vue = JSON sérialisé, Contrôleur = Controller) | `backend/src/Controller/`, `backend/src/Entity/` |
| Physique (déploiement) | Architecture n-tiers à 4 tiers (client, présentation, application, données) | `docker-compose.yml`, schéma en `03-cahier-des-charges.md` section 5.1 |
| Transverse | Séparation des responsabilités par couche (DTO/Service/Repository/Voter) | `backend/src/` (arborescence complète) |
