# Méthodologie et Organisation du Projet : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

1. Méthode de gestion de projet
2. Macro-planning
3. Backlog produit
4. Déroulé des phases
5. Outils de suivi
6. Gestion Git
7. Intégration continue

---

## 1. Méthode de gestion de projet

### 1.1 Choix méthodologique

Le projet a été mené en développement solo sur une durée de 10 semaines, du 12 juin au 23 août 2026. Un cadre Scrum classique (sprints à durée fixe, cérémonies formelles : daily stand-up, sprint review, rétrospective) suppose une équipe et n'est pas pertinent pour un développeur seul face à son propre backlog. Le projet a donc été piloté selon une méthode **Kanban adaptée au solo**, organisée en **phases thématiques** plutôt qu'en sprints à durée fixe.

### 1.2 Pourquoi Kanban plutôt que Scrum

| Critère | Scrum classique | Kanban solo (retenu) |
|---|---|---|
| Durée d'itération | Fixe (ex. 2 semaines) | Variable, bornée par la complétude d'une phase |
| Cérémonies | Daily, planning, review, rétro | Remplacées par un journal de décisions continu (`docs/decisions.md`) et un fichier de suivi vivant (`DirectivesetLivrables.md`) |
| Estimation | Points de complexité, vélocité d'équipe | Non pertinente à un seul développeur, priorité au flux continu |
| Visualisation | Sprint board | Board Kanban GitHub Projects (Backlog / En cours / Terminé) |
| Adaptabilité | Le scope d'un sprint est figé une fois lancé | Le scope d'une phase peut s'ajuster en continu (ex. Phase 3ter ajoutée en cours de projet, cf. section 4) |

Ce choix n'est pas un renoncement à la rigueur agile : chaque fonctionnalité reste découpée en tickets unitaires, tracés individuellement, testés et commités séparément ; seul le rituel formel de sprint est remplacé par un flux continu mieux adapté à un contexte solo.

### 1.3 Cycle de vie d'un ticket

Chaque fonctionnalité suit un cycle identique, du besoin au déploiement en intégration :

```
1. Création du ticket (GitHub Projects, colonne Backlog)
2. Passage en "En cours"
3. Création d'une branche feature/BE-XX-nom ou feature/FE-XX-nom depuis develop
4. Développement itératif
5. Vérification / tests locaux (PHPUnit, ESLint, PHP-CS-Fixer)
6. Commit(s) au format Conventional Commits + push
7. Pull Request vers develop
8. Merge après validation → ticket passé en "Terminé"
```

---

## 2. Macro-planning

### 2.1 Vue chronologique

Le projet s'étend sur environ 10 semaines, structurées en 4 grandes phases fonctionnelles suivies d'une phase de documentation et de soutenance.

| Période | Phase | Contenu |
|---|---|---|
| Semaines 1-2 (12-26 juin 2026) | Phase 1 : Fondations & Architecture | Initialisation du monorepo, Docker Compose, entités Doctrine, authentification JWT, premiers CRUD, tests PHPUnit |
| Semaines 3-5 (fin juin - mi-juillet 2026) | Phase 2 : Cœur fonctionnel & visuel | Frontend React/Vite, pages bateaux/ports, module de carnet de navigation (fonctionnalité retirée par la suite, cf. section 4.5), design Tailwind, carte Leaflet |
| Semaines 6-7 (juillet 2026) | Phase 3 : Sécurité & DevOps | Chiffrement des données sensibles, headers de sécurité, pipeline CI/CD complet |
| 20-21 juillet 2026 | Phase 3ter : Portail Admin & Gestion Avancée | Extension majeure non planifiée initialement : rôles avancés, portail admin, réservations, emplacements de bateaux (voir section 4.4) |
| 21 juillet - 13 août 2026 | Phase 3 (suite) | Export PDF, conformité RGPD, notifications, ajustements admin |
| À partir du 13 août 2026 | Phase 4 : Documentation & Soutenance | Rédaction des 8 livrables documentaires, support de présentation, vidéo de secours |

### 2.2 Jalons de rendu

| Date | Jalon |
|---|---|
| 23 août 2026 (23h59) | Dépôt numérique : Dossier de Projet + Dossier Professionnel |
| 11 septembre 2026 (13h00) | Dépôt papier : 2 exemplaires de chaque dossier |
| 20 septembre 2026 (23h59) | Dépôt du support de présentation orale |
| À confirmer | Soutenance (démo live + vidéo de secours) |

---

## 3. Backlog produit

### 3.1 Structure de nommage des tickets

Le backlog est organisé par préfixe fonctionnel, permettant d'identifier immédiatement la nature d'un ticket dans l'historique Git et le board Kanban :

| Préfixe | Domaine |
|---|---|
| `SETUP-XX` | Initialisation du projet (repository, Docker) |
| `BE-XX` | Backend (API Symfony) |
| `FE-XX` | Frontend (React) |
| `DEVOPS-XX` | Infrastructure, CI/CD, déploiement |
| `TECH-X` | Dette technique / refactoring transverse |
| `DOC-XX` | Documentation et livrables de soutenance |

### 3.2 Exemples de user stories priorisées

Le backlog n'a pas été formalisé en fiches user stories séparées, mais chaque ticket porte intrinsèquement une user story implicite. Reformulation a posteriori de tickets significatifs :

| Ticket | User story | Priorité |
|---|---|---|
| BE-02 | En tant qu'utilisateur, je veux m'authentifier de façon sécurisée pour accéder à mon espace personnel | Haute |
| FE-08 | En tant qu'utilisateur, je veux visualiser les ports sur une carte interactive pour localiser rapidement une disponibilité | Haute |
| BE-16 / FE-16 | En tant qu'administrateur, je veux localiser précisément un bateau dans un port pour gérer les emplacements | Moyenne |
| BE-11 | En tant qu'utilisateur, je veux pouvoir supprimer définitivement mon compte pour exercer mon droit à l'oubli RGPD | Haute |
| FE-19 | En tant qu'administrateur, je veux gérer les demandes d'emplacement pour arbitrer les conflits d'attribution | Moyenne |

### 3.3 Priorisation

La priorisation a suivi une logique de dépendance technique plutôt qu'une méthode formelle (MoSCoW, etc.) : les fondations (authentification, entités, CRUD de base) ont nécessairement précédé les fonctionnalités avancées (réservations, emplacements, notifications), elles-mêmes précédant les aspects de conformité et de finition (RGPD, accessibilité, documentation).

---

## 4. Déroulé des phases

### 4.1 Phase 1 : Fondations & Architecture

Mise en place du monorepo (séparation `backend/`/`frontend/`), de l'environnement Docker Compose complet, des entités Doctrine de base (`User`, `Boat`, `Port`), de l'authentification JWT avec RBAC, des premiers CRUD sécurisés et d'une première suite de tests PHPUnit.

### 4.2 Phase 2 : Cœur fonctionnel & visuel

Construction du frontend React/Vite : contexte d'authentification, pages de gestion des bateaux et des ports. Un module de carnet de navigation numérique (« Smart LogBook », entité `LogEntry`) a été développé durant cette phase, avec un algorithme de recommandation basé sur l'historique de navigation.

### 4.3 Phase 3 : Sécurité & DevOps

Chiffrement AES-256-CBC du numéro de permis, headers de sécurité Nginx, et surtout mise en place du pipeline CI/CD GitHub Actions complet (lint, tests, scan Trivy, build Docker). Cette phase a également mis au jour et corrigé plusieurs bugs préexistants bloquants (routing Nginx, contrôle d'accès trop permissif, incohérences de configuration de test).

### 4.4 Phase 3ter : Extension majeure non planifiée (portail Admin)

**Décision de gestion notable :** à l'issue d'un audit technique de l'existant (20 juillet 2026), le constat a été fait que l'application disposait d'une authentification par rôles mais d'aucune séparation réelle d'interface entre espace admin et espace utilisateur, ni de gestion fine des emplacements de bateaux ou des réservations. Plutôt que de reporter ces manques en fin de projet, la décision a été prise d'ouvrir une phase dédiée non planifiée initialement, portant sur **14 tickets** (BE-12 à BE-16, FE-10 à FE-17) couvrant les rôles avancés, l'upload de fichiers, les réservations, les emplacements de bateaux et un portail admin complet avec dashboard.

Cette phase, menée du 20 au 21 juillet 2026, illustre la capacité du projet à absorber un changement de scope conséquent sans dérive de planning grâce à la réutilisation systématique des composants déjà en place (cartes, badges, patterns de formulaire déjà établis en Phase 2).

### 4.5 Écart de trajectoire : retrait du Smart LogBook

Le module de carnet de navigation numérique (Smart LogBook), développé en Phase 2, a été retiré du périmètre final du projet (refactoring `TECH-1`, suppression complète du concept Trajets/LogEntry). Ce choix illustre une gestion de backlog vivante : une fonctionnalité peut être développée, testée, puis retirée si elle s'avère redondante ou hors du cœur de valeur du produit, sans que cela remette en cause la rigueur du processus qui l'a produite.

### 4.6 Phase 3 (suite) : Conformité et finition

Export PDF du carnet de bateau, conformité RGPD (droit à l'oubli en cascade), système de notifications internes, ajustements du dashboard admin (KPI signalements, statuts).

### 4.7 Phase 4 : Documentation & Soutenance

Rédaction des 8 livrables documentaires (cahier des charges, méthodologie, charte graphique, modélisation de la base de données, README, support de présentation, vidéo de secours, dossier professionnel), préparation du scénario de démonstration.

---

## 5. Outils de suivi

| Outil | Usage |
|---|---|
| GitHub Projects | Board Kanban (Backlog / En cours / Terminé), un ticket par fonctionnalité |
| `DirectivesetLivrables.md` | Fichier de suivi vivant à la racine du dépôt : calendrier, conventions, état d'avancement détaillé, checkpoint de reprise de session |
| `docs/decisions.md` | Journal des décisions techniques (ADR, Architecture Decision Records), tracé chronologiquement |
| Historique Git | Source de vérité pour la traçabilité réelle du travail effectué (branches, commits, PR) |
| GitHub Actions | Vérification automatique de la qualité à chaque push (voir section 7) |

---

## 6. Gestion Git

### 6.1 Stratégie de branches

```
main       → Production (merge uniquement via Pull Request validée)
preprod    → Pré-production (staging)
develop    → Intégration (base de toutes les fonctionnalités)
feature/BE-XX-nom  → Branches backend
feature/FE-XX-nom  → Branches frontend
```

**Flux obligatoire :** `feature/*` → Pull Request → `develop` → Pull Request → `preprod` → Pull Request → `main`.

### 6.2 Convention de commits

Le projet applique une convention proche de Conventional Commits, adaptée pour intégrer la référence au ticket :

```
type(TICKET — Titre descriptif): description courte

- Détail ligne 1
- Détail ligne 2
```

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Réécriture sans changement de comportement |
| `style` | Formatage, lint, sans impact fonctionnel |
| `docs` | Documentation |
| `test` | Ajout ou modification de tests |

### 6.3 Convention de nommage des fichiers

Les fichiers et classes Controllers/DTOs sont nommés en français, les entités Doctrine et repositories en anglais ; convention détaillée dans le glossaire du Cahier des Charges Fonctionnel (DOC-03).

---

## 7. Intégration continue

### 7.1 Pipeline GitHub Actions

Un unique workflow (`ci.yml`) s'exécute automatiquement sur chaque push et pull request vers `develop`, `preprod` et `main`, structuré en 4 jobs séquentiels/parallèles :

| Ordre | Job | Rôle | Bloquant |
|:---:|---|---|:---:|
| 1 | `lint` | Validation Composer, syntaxe PHP, PHP-CS-Fixer, ESLint | Oui |
| 1 | `tests-phpunit` | Suite de tests PHPUnit sur base PostgreSQL éphémère | Oui |
| 2 | `trivy-scan` | Scan de vulnérabilités (dépendances, filesystem) | Non |
| 3 | `build-docker` | Build et publication des images Docker (GHCR), dépend de `lint` et `tests-phpunit` | Oui |

### 7.2 Discipline de contrôle qualité

Un incident représentatif de cette discipline : lors de l'ouverture d'une Pull Request en cours de projet, le job `lint` a échoué sur des fichiers non liés au travail en cours, révélant une dette de formatage préexistante non détectée jusqu'alors. Plutôt que de contourner le contrôle, la dette a été corrigée immédiatement (exécution de PHP-CS-Fixer en écriture) et isolée dans un commit dédié, distinct des commits fonctionnels, préservant la lisibilité de l'historique tout en respectant la CI bloquante. Cet épisode a été documenté comme leçon retenue pour les sessions suivantes.
