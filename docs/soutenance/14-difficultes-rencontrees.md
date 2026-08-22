# Difficultés Rencontrées : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

1. Introduction
2. Difficultés techniques et solutions apportées
3. Obstacles organisationnels
4. Apprentissages tirés

---

## 1. Introduction

Ce document recense, de façon factuelle et tracée par commit Git, les principales difficultés rencontrées durant le développement de NautiLog et les solutions apportées. L'objectif n'est pas de lister des problèmes anecdotiques, mais de mettre en avant les cas où un obstacle a nécessité un diagnostic réel, une décision technique argumentée, ou un changement de trajectoire, ce qui reste cohérent avec la démarche de traçabilité déjà en place (`docs/decisions.md`, historique Git en Conventional Commits).

---

## 2. Difficultés techniques et solutions apportées

### 2.1 Bugs préexistants révélés par la mise en place du pipeline CI/CD (DEVOPS-01)

La construction du pipeline GitHub Actions (`ci.yml`) a agi comme un révélateur : plusieurs dysfonctionnements présents depuis plus longtemps dans le projet, mais invisibles en développement local (état résiduel de conteneurs, cache), sont apparus dès la première exécution en environnement propre.

| Problème détecté | Cause racine | Solution |
|---|---|---|
| Toute requête vers `/api/*` retournait 404 via Nginx | Le `try_files` imbriqué dans la `location /api` ne routait jamais effectivement vers PHP-FPM | Réécriture directe de l'URI Nginx vers `index.php` (commit `7b678da`) |
| `/api/auth/login` jamais intercepté par le firewall `json_login` | En Symfony 8.1, le `RouterListener` (priorité 32) s'exécute avant le `FirewallListener` (priorité 8) : sans route explicite déclarée, la requête échouait avant même d'atteindre le firewall | Déclaration d'une route explicite `POST /api/auth/login` dans `AuthController`, non exécutée en pratique (le firewall intercepte avant) mais nécessaire pour que le routeur reconnaisse le chemin (commit `58da640`) |
| Lecture publique des bateaux/ports bloquée à tort | Règle `access_control` trop restrictive (`IS_AUTHENTICATED_FULLY` générale) alors qu'aucun contrôleur ne restreignait ces routes en lecture | Ajout de règles `access_control` publiques ciblées par méthode HTTP (GET uniquement) |
| Tests d'authentification aléatoirement rouges | Incohérence `username`/`email` dans les payloads de test (le `json_login` de Symfony attend `email`) ; `OwaspTest` testait un `GET` là où un `POST` était nécessaire pour vérifier le contrôle d'accès ; `PortControllerTest` tentait de créer un compte `ROLE_ADMIN` via l'inscription publique, bloquée par conception (`RegisterDto` n'accepte que `OWNER`/`RENTER`) | Correction des payloads de test et de la logique testée elle-même, pas uniquement du code applicatif |
| Pipeline CI en échec (base de données, GHCR) | `.env` backend volontairement non commité (donc absent en CI) ; tag d'action Trivy invalide ; doublon de suffixe `_test` sur le nom de base (Doctrine l'ajoute déjà via `dbname_suffix`) ; base de test non créée avant les migrations ; nom de repository GHCR en majuscules (Docker exige des minuscules) | Génération du `.env` à la volée en step CI ; correction du tag Trivy ; retrait du suffixe dupliqué ; ajout d'une étape de création de base avant migration ; conversion du nom de repository en minuscules (`${GITHUB_REPOSITORY,,}`) |

**Leçon retenue :** un pipeline CI/CD n'est pas seulement un outil de vérification de non-régression, sa mise en place initiale constitue elle-même un audit du projet. Plusieurs de ces bugs auraient pu passer inaperçus jusqu'à une démonstration en environnement non maîtrisé.

### 2.2 Dette de formatage préexistante détectée en cours de Pull Request

Lors de l'ouverture d'une Pull Request en cours de projet, le job `lint` de la CI a échoué sur des fichiers non liés au travail en cours, révélant une dette de formatage PHP-CS-Fixer préexistante et jamais détectée jusqu'alors (commit `1fe475e`). Plutôt que de contourner le contrôle (`--no-verify` ou ignorer le job), la dette a été corrigée immédiatement par une exécution de PHP-CS-Fixer en mode écriture, isolée dans un commit dédié distinct des commits fonctionnels, ce qui a préservé la lisibilité de l'historique tout en respectant la CI bloquante.

### 2.3 Retrait d'une fonctionnalité développée et testée (Smart LogBook)

Un module de carnet de navigation numérique (« Smart LogBook », entité `LogEntry`, endpoints `/api/trajets`) a été développé en Phase 2 : migration Doctrine, CRUD API complet (`BE-07`), puis interface React (liste, détail, formulaire de saisie, `FE-06`). Après évaluation, ce module a été jugé redondant avec le cœur de valeur du produit (gestion de flotte et disponibilité) et a été intégralement retiré (`TECH-1`, commit `4c3bd5a`) : suppression de l'entité, de la migration compensatoire, des endpoints et de l'interface associée.

**Décision assumée, pas un abandon subi.** Ce retrait illustre une gestion de backlog vivante : une fonctionnalité peut être développée, testée, intégrée, puis retirée si son maintien dilue le périmètre plutôt que de l'enrichir, sans que cela remette en cause la rigueur du processus qui l'a produite (chaque étape reste tracée et testée avant la décision de retrait).

### 2.4 Suppression de port bloquée par des demandes d'emplacement historiques

Lors du développement de la gestion avancée des emplacements (`FE-19`), la suppression d'un port par un administrateur échouait silencieusement lorsque des `BerthRequest` historiques (approuvées ou refusées) référençaient encore des `Berth` de ce port, en violation de contrainte d'intégrité référentielle. Corrigé en traitant explicitement la suppression en cascade des demandes liées avant celle des emplacements (commit `a39b83c`).

---

## 3. Obstacles organisationnels

### 3.1 Développement solo : absence de relecture de pair

Le projet a été mené intégralement en solo, sans relecture de code par un pair. Ce contexte accroît le risque de biais de confirmation (ne pas voir ses propres angles morts) et de dette non détectée. La mitigation retenue a été de rendre la CI systématiquement bloquante sur le lint et les tests (cf. `04-methodologie.md`, section 7), transformant une partie du contrôle qualité normalement assuré par une revue humaine en contrôle automatisé, imparfait mais objectif et non contournable sans décision explicite.

### 3.2 Extension de périmètre non planifiée (portail Admin, Phase 3ter)

À l'issue d'un audit technique de l'existant, il est apparu que l'application disposait d'une authentification par rôles mais d'aucune séparation réelle d'interface entre espace admin et espace utilisateur, ni de gestion fine des emplacements ou des réservations. Plutôt que de reporter ce manque en fin de projet, au risque de le voir sacrifié faute de temps, la décision a été prise d'ouvrir une phase dédiée non planifiée initialement (14 tickets, détaillée en `04-methodologie.md` section 4.4). Cette absorption de scope conséquente sans dérive globale de planning a été rendue possible par la réutilisation systématique des composants déjà en place (cartes, badges, patterns de formulaire établis en Phase 2).

---

## 4. Apprentissages tirés

| Apprentissage | Contexte |
|---|---|
| Un pipeline CI/CD doit être mis en place tôt, pas en fin de projet | Sa construction tardive (Phase 3) a révélé d'un coup plusieurs bugs accumulés silencieusement depuis les phases 1 et 2 |
| Le contrôle qualité automatisé (lint, tests bloquants) est un substitut partiel mais réel à la relecture de pair en solo | Compense en partie l'absence de regard extérieur, sans prétendre l'égaler |
| Une fonctionnalité testée n'est pas une fonctionnalité définitive | Le retrait du Smart LogBook montre qu'un périmètre doit rester révisable jusqu'à la fin, y compris pour du code déjà fonctionnel |
| Les contraintes d'intégrité référentielle doivent être anticipées dès la conception des suppressions en cascade | Le cas de la suppression de port (section 2.4) aurait pu être évité par une analyse plus systématique des dépendances lors de la modélisation initiale des entités `Berth`/`BerthRequest` |
| Documenter une dette technique au moment où elle est détectée évite qu'elle se dilue dans un commit fonctionnel non lié | Pratique appliquée systématiquement après l'incident de lint (section 2.2) |
