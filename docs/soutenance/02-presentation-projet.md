# Présentation du Projet : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

> Ce document est une synthèse orientée oral/diaporama. Le détail exhaustif de chaque point figure dans le Cahier des Charges Fonctionnel (DOC-03, sections 1, 4 et 5).

---

## Sommaire

1. Contexte et problématique
2. Solution développée
3. Technologies utilisées

---

## 1. Contexte et problématique

### 1.1 Contexte

NautiLog est une application de gestion de flotte nautique développée en solo sur 10 semaines, dans le cadre du titre professionnel Concepteur Développeur d'Applications (CDA). Le secteur ciblé est celui de la location et de la gestion de bateaux de plaisance.

### 1.2 Problématique

Les gestionnaires de flotte (loueurs, capitaineries, propriétaires multi-bateaux) s'appuient encore fréquemment sur des outils disparates (tableurs, échanges par email ou téléphone) pour suivre trois informations critiques et changeantes en permanence :

- la **disponibilité réelle** de chaque bateau (disponible / loué / en réparation) ;
- son **emplacement précis** dans un port (ponton, quai) ;
- l'**historique de maintenance** et les **réservations en cours**.

Cette dispersion génère des erreurs évitables : double réservation d'un même bateau, emplacement mal communiqué, historique de réparation perdu. NautiLog répond à ce besoin par une plateforme unique, sécurisée, avec des droits d'accès adaptés à chaque profil d'utilisateur.

---

## 2. Solution développée

### 2.1 Vue d'ensemble fonctionnelle

| Brique fonctionnelle | Ce qu'elle apporte |
|---|---|
| Gestion de la flotte | CRUD complet des bateaux, statut en temps réel, historique de réparations, export PDF du carnet de bateau |
| Ports et emplacements | Carte interactive (Leaflet) des ports, gestion fine des emplacements d'amarrage (Berth), demandes d'attribution arbitrées par un administrateur |
| Météo marine | Affichage de la météo actuelle par port (température, vent, état de la mer), via l'API publique Open-Meteo |
| Réservations | Réservation en ligne avec détection automatique des conflits de dates sur un même bateau |
| Signalements & notifications | Un utilisateur peut signaler un problème lié à une réservation ; système de notifications internes avec compteur non lus |
| Portail d'administration | Dashboard avec indicateurs clés (KPIs), gestion des utilisateurs, de la flotte et des ports à l'échelle globale |

### 2.2 Trois profils d'utilisateurs

La plateforme distingue trois rôles avec des droits différenciés (RBAC) :

- **Administrateur** : vue d'ensemble complète, arbitrage des emplacements et des litiges ;
- **Propriétaire** : gestion de son propre parc de bateaux ;
- **Locataire** : recherche et réservation d'un bateau disponible.

### 2.3 Ce qui différencie NautiLog d'un simple CRUD

Deux éléments illustrent une réflexion produit au-delà de la simple gestion de données :

1. **La carte interactive n'est pas qu'un affichage statique** : la visibilité des emplacements occupés est filtrée par rôle (un administrateur voit tous les bateaux amarrés, un propriétaire ne voit que les siens), ce qui évite d'exposer des informations sans rapport avec l'utilisateur connecté.
2. **La suppression de compte (droit à l'oubli RGPD) est une opération métier à part entière**, pas une simple suppression en base : elle notifie les locataires impactés en leur suggérant des bateaux alternatifs dans le même port, avant de supprimer les données en cascade (détail en DOC-07, section 3.3).

---

## 3. Technologies utilisées

### 3.1 Architecture générale

NautiLog suit une architecture **API-first découplée** : un frontend React consomme une API REST Symfony, les deux étant conteneurisés indépendamment et communiquant via HTTP/JSON derrière un reverse-proxy Nginx.

```
Navigateur → Nginx → ├── client (React/Vite)
                      ├── api (Symfony, PHP-FPM)
                      └── uploads (fichiers statiques)
                              ↓
                          db (PostgreSQL 15)
```

### 3.2 Stack technique en un coup d'œil

| Couche | Technologie |
|---|---|
| Backend | Symfony 8.1 (PHP ≥ 8.4), Doctrine ORM, LexikJWTAuthenticationBundle |
| Frontend | React 18.3, Vite, Tailwind CSS, React Router, Axios |
| Cartographie | Leaflet / React-Leaflet + OpenStreetMap |
| Base de données | PostgreSQL 15 |
| Infrastructure | Docker Compose (5 services), Nginx (reverse-proxy) |
| CI/CD | GitHub Actions (lint, tests PHPUnit, scan Trivy, build & publication d'images Docker) |

### 3.3 Pourquoi ces choix

L'architecture découplée répond directement à l'exigence de séparation en couches du référentiel CDA (CCP2) et permet une évolution indépendante du frontend et du backend. Le détail des choix techniques et leurs alternatives (comparatifs, versions) est documenté dans la Veille Technologique et Sécurité (DOC-09) et dans le journal des décisions (`docs/decisions.md`).

---

## Pour aller plus loin

- Spécifications fonctionnelles détaillées : Cahier des Charges Fonctionnel (DOC-03)
- Architecture en couches et sécurité : Cahier des Charges Fonctionnel (DOC-03, sections 5-6)
- Modélisation de la base de données : DOC-06
- Conception UML (cas d'utilisation, séquence, classes) : DOC-07
