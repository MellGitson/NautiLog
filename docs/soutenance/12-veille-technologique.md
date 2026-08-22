# Veille Technologique : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

XII.a Veille sur les technologies du projet
XII.b Veille globale du secteur

---

## Introduction

La veille technologique menée durant le projet a directement orienté plusieurs choix d'architecture documentés dans le Cahier des Charges Fonctionnel (`03-cahier-des-charges.md`) et la Modélisation de la Base de Données (`06-modelisation-bdd.md`). Ce document formalise a posteriori les axes de veille associés à chaque décision technique, en cohérence avec l'esprit du référentiel CDA : un développeur ne choisit pas un outil par défaut, mais après une comparaison argumentée.

---

## XII.a Veille sur les technologies du projet

### Backend : Symfony 8.1 sur PHP ≥ 8.4

| Point de veille | Constat |
|---|---|
| Version PHP retenue | `>=8.4` (`composer.json`), dernière version majeure stable au démarrage du projet (juin 2026), apportant des améliorations de performance JIT et de typage (property hooks) |
| Version Symfony retenue | `8.1.*` sur l'ensemble des composants (`symfony/framework-bundle`, `security-bundle`, `serializer`, `validator`...), choix d'une version récente du framework plutôt qu'une LTS antérieure, pour bénéficier des dernières évolutions de la Security component |
| Doctrine ORM | `doctrine/orm` en version courante + `doctrine-migrations-bundle ^4.0` : la génération automatique de migrations SQL a été un critère déterminant pour un projet solo avec délai contraint (traçabilité du schéma sans écrire le DDL à la main) |

**Précision :** aucun comparatif formel PHP 8.4 vs 8.3 LTS n'a été mené ; 8.4 était la version stable disponible au moment du setup Docker initial (juin 2026) et a été retenue par choix pragmatique, cohérent avec l'absence de contrainte de compatibilité descendante sur un projet démarré de zéro.

### Frontend : React 18.3 + Vite

| Point de veille | Constat |
|---|---|
| React 18.3 | Version stable au moment du démarrage, avant la bascule vers React 19, choix de stabilité plutôt que d'adopter la toute dernière version majeure en cours de sortie |
| Vite `^5.3` comme outil de build | Retenu plutôt que Create React App (officiellement déprécié) pour le temps de démarrage du serveur de dev (ESM natif) et la simplicité de configuration, cohérent avec un projet solo à délai contraint |
| Tailwind CSS `^3.4` | Approche utility-first retenue pour construire rapidement une charte graphique cohérente (`05-charte-graphique.md`) sans maintenir de fichiers CSS séparés par composant |

**Précision :** pas de comparatif chiffré unique consulté ; le choix s'appuie sur la connaissance générale et la recommandation actuelle de l'écosystème React (Create React App officiellement déprécié, Vite devenu l'outil de référence documenté sur reactjs.org/react.dev), plutôt que sur un article ou benchmark ponctuel.

### Authentification : LexikJWTAuthenticationBundle

| Point de veille | Constat |
|---|---|
| JWT stateless vs sessions PHP | Choix cohérent avec l'architecture API-first découplée (`03-cahier-des-charges.md`, section 5.1) : un frontend SPA séparé du backend ne bénéficie pas des sessions serveur classiques sans complexité supplémentaire (CORS + cookies cross-origin) |
| Bundle retenu | `lexik/jwt-authentication-bundle`, standard de facto dans l'écosystème Symfony pour l'émission/validation de JWT signés RSA, plutôt qu'une implémentation manuelle du protocole |

**Précision :** aucune alternative n'a été sérieusement mise en balance ; LexikJWTAuthenticationBundle est le choix de référence, largement documenté et adopté dans l'écosystème Symfony pour ce cas d'usage, retenu directement sans comparatif formel avec `web-token/jwt-framework` ou une gestion de sessions classique.

### Cartographie : Leaflet / React-Leaflet

| Point de veille | Constat |
|---|---|
| Leaflet vs Google Maps / Mapbox | Leaflet + OpenStreetMap retenus : solution open-source sans clé API payante ni quota, cohérent avec un projet pédagogique sans budget d'infrastructure |
| API météo marine, Open-Meteo | API publique gratuite sans authentification, proxifiée côté backend pour éviter d'exposer une éventuelle clé et pour centraliser la gestion d'erreur (cf. `03-cahier-des-charges.md`, section 4.3) |

**Précision :** Open-Meteo a été retenu directement, sans comparatif formel avec OpenWeatherMap ou un autre fournisseur ; le critère déterminant était l'absence de clé API et de compte à créer, cohérent avec un projet pédagogique sans budget d'infrastructure ni gestion de secrets tiers supplémentaire.

### Choix d'architecture comparés

Cette section documente les choix d'architecture ayant fait l'objet d'une comparaison explicite, au-delà du simple choix d'outil.

| Décision | Alternative(s) considérée(s) | Raison du choix retenu |
|---|---|---|
| Architecture API-first découplée (`docs/decisions.md`, ADR-002) | Symfony monolithique avec Twig (rendu serveur) | Séparation stricte frontend/backend exigée pour illustrer la compétence CCP2 (architecture en couches), et réutilisabilité de l'API pour une éventuelle application mobile future |
| Monorepo (`docs/decisions.md`, ADR-001) | Deux dépôts séparés (`nautilog-api` / `nautilog-front`) | Simplification du CI/CD et du déploiement Docker pour un développeur seul, au prix d'un couplage de versionning entre front et back jugé acceptable à cette échelle |
| Kanban solo plutôt que Scrum (`04-methodologie.md`, section 1.2) | Scrum classique avec sprints fixes | Les cérémonies Scrum supposent une équipe ; un flux Kanban continu, adapté à un backlog individuel, a été jugé plus pertinent |

**Précision :** en dehors des trois décisions ci-dessus, aucune autre alternative technique (base de données, ORM, bibliothèque UI) n'a fait l'objet d'une comparaison formelle documentée durant le projet ; les autres choix (PostgreSQL, Doctrine, Tailwind) découlent des standards par défaut de l'écosystème Symfony/React plutôt que d'un arbitrage explicite entre plusieurs options.

---

## XII.b Veille globale du secteur

La veille menée sur ce projet a porté sur deux axes distincts : le contexte métier (secteur nautique) et l'aspect technique.

**Veille sectorielle, nautisme et gestion de flotte :**
Suivi régulier du magazine **Voile Magazine**, qui a permis de rester au contact des problématiques réelles de gestion de flotte, d'entretien et de disponibilité des bateaux vécues par les propriétaires et loueurs, un contexte ayant confirmé la pertinence des fonctionnalités retenues pour le MVP (suivi de statut, historique de réparations, réservations avec détection de chevauchement).

**Veille technique :**
Plutôt qu'une veille par newsletter ou blog suivie en continu, la veille technique s'est faite au fil de l'eau via la **documentation officielle** des technologies utilisées (Symfony, React, Doctrine, MDN), consultée à chaque fois qu'une contrainte du cahier des charges l'exigeait, une approche pragmatique adaptée à un projet solo avec délai contraint, privilégiant la résolution de problèmes concrets à une veille prospective large.

---

## Synthèse

La veille technologique menée sur ce projet a été guidée par les contraintes réelles du contexte CDA solo : privilégier des outils matures, documentés, largement adoptés dans l'écosystème Symfony/React, plutôt que des technologies expérimentales, cohérent avec l'objectif de livrer un MVP fonctionnel dans le délai imparti (`03-cahier-des-charges.md`, section 2.1, méthodologie OPAS).
