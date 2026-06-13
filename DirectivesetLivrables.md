# 📂 DIRECTIVES ET LIVRABLES - PROJET CDA
**Nom du Projet :** NautiLog & Fleet  
**Concept :** Carnet de navigation électronique intelligent, gestion de flotte et carte interactive de disponibilité.  
**Date de création :** 12 Juin 2026  
**Mentor :** Qwen3.7  

---

## 📅 CALENDRIER IMPÉRATIF DES RENDUS
- **Dimanche 23 Août 2026 (23h59) :** Dépôt numérique (Dossier de Projet + Dossier Professionnel).
- **Vendredi 11 Septembre 2026 (13h00) :** Dépôt papier (2 exemplaires de chaque dossier).
- **Dimanche 20 Septembre 2026 (23h59) :** Dépôt du support de présentation orale (PowerPoint/Canva).
- **Date de soutenance :** À confirmer (Prévoir une démo live + vidéo de secours).

---

## 🎯 PÉRIMÈTRE DU MVP (Minimum Viable Product)
Pour tenir les délais de 10 semaines, le projet se concentre sur ces fonctionnalités cœurs :
1. **Authentification & Rôles :** JWT sécurisé, rôles `ROLE_OWNER`, `ROLE_RENTER`, `ROLE_ADMIN`.
 a. Chiffrement des données sensibles (ex: numéro de permis bateau).
2. **Gestion de Flotte (Back-Office) :** CRUD des bateaux, gestion des statuts (DISPONIBLE, LOUÉ, EN_RÉPARATION).
3. **Vue Cartographique (Front-Office) :** Carte interactive (Leaflet/Mapbox) affichant les ports et la disponibilité des bateaux en temps réel.
4. **Smart LogBook :** Saisie des trajets et algorithme de recommandation basique (ex: détection de patterns "navigation weekend" -> suggestion de checklist ou de port).
5. **Conformité & Sécurité :** Export PDF, respect RGPD (droit à l'oubli), validation stricte des données (DTO), scan de vulnérabilités (Trivy).

---

## 📦 LISTE DES LIVRABLES ATTENDUS

### 1. Livrables Techniques (Code & Infra)
- [ ] **Dépôt Git propre** (Monorepo ou deux repos liés) avec historique de commits explicites (Conventional Commits).
- [ ] **Backend (Symfony) :** API REST structurée (Contrôleurs, Services, DTO, Validators), tests unitaires (PHPUnit).
- [ ] **Frontend (React) :** Application Vite, composants réutilisables, gestion d'état (Context/Zustand), carte interactive fonctionnelle.
- [ ] **Base de données :** Schéma PostgreSQL optimisé, migrations versionnées, jeu de données de test (Faker).
- [ ] **DevOps :** 
  - `docker-compose.yml` fonctionnel pour l'environnement local.
 is.
  - Pipeline CI/CD (GitHub Actions / GitLab CI) incluant : Linting, Tests, **Scan de sécurité (Trivy)**, Build.
- [ ] **Déploiement :** Application accessible en ligne via un VPS (HTTPS, Nginx, Docker).

### 2. Livrables Documentaires
- [ ] **README.md (Racine du projet) :** 
  - Description du projet.
  - Architecture technique (Schéma UML de déploiement ou de composants).
  - Instructions d'installation en 3 commandes (`git clone`, `docker-compose up`, etc.).
  - Comptes de test pour le jury (email/mot de passe).
- [ ] **Dossier de Projet (PDF, ~15-20 pages) :**
  - Contexte et problématique (Le besoin de digitalisation nautique).
  - Choix techniques justifiés (Pourquoi Symfony/React ? Pourquoi tel algo de recommandation ?).
  - Démarche Sécurité (OWASP, ANSSI, RGPD, gestion des rôles).
  - Démarche Qualité & Éco-conception (Optimisation des requêtes, WebP, lazy loading).
  - Extraits de code pertinents (ex: un DTO de validation, une requête optimisée, la logique de l'algo de recommandation).
  - Difficultés rencontrées et solutions apportées.
- [ ] **Dossier Professionnel (PDF) :** Synthèse de ton parcours, lien entre tes missions en entreprise et les compétences du titre CDA (CCP1, CCP2, CCP3).

### 3. Livrables de Soutenance
- [ ] **Support de présentation (PowerPoint/Canva) :** Max 10-12 slides. Visuel, peu de texte, schémas d'architecture.
- [ ] **Scénario de Démo :** Script écrit de la démo live (5-7 min max) pour éviter les blancs.
- [ ] **Plan B :** Vidéo MP4 de 3 minutes montrant le parcours utilisateur complet (au cas où le VPS tombe le jour J).

---

## 🗺️ ROADMAP SUR 10 SEMAINES (Jusqu'au 23 Août)

### 🟢 Phase 1 : Fondations & Architecture (Semaines 1-2)
- **S1 :** Setup Git, Docker Compose, entités Doctrine (`User`, `Boat`, `Port`), Auth JWT.
- **S2 :** API REST de base (CRUD Bateaux/Ports avec DTO et Validateurs), Tests unitaires backend, seeding avec Faker.

### 🟡 Phase 2 : Cœur Fonctionnel & Visuel (Semaines 3-5)
- **S3 :** Frontend React : Setup, Routing, Auth Context, Page de liste des bateaux.
- **S4 :** Frontend React : Intégration de la **Carte Interactive** (Leaflet) avec markers dynamiques depuis l'API.
- **S5 :** Développement du module **Smart LogBook** (CRUD des entrées de navigation) et début de l'algo de recommandation (règles métier simples).

### 🔴 Phase 3 : Sécurité, Intelligence & DevOps (Semaines 6-7)
- **S6 :** Durcissement de la sécurité : Chiffrement des données sensibles, mise en place des headers de sécurité, tests d'intrusion basiques (OWASP ZAP ou manuel).
- **S7 :** Mise en place du pipeline CI/CD (Trivy, tests auto), Déploiement sur VPS, configuration du nom de domaine et HTTPS.

### 🔵 Phase 4 : Rédaction & Finalisation (Semaines 8-10)
- **S8 :** Rédaction intensive du **Dossier de Projet** (utilisez votre journal de bord des semaines 1-7).
- **S9 :** Rédaction du **D Overall Professionnel**, relecture, correction des derniers bugs, optimisation des performances (Lighthouse).
- **S10 :** Création du **PowerPoint**, répétition de la soutenance, enregistrement de la **vidéo de secours (Plan B)**.

---

## ✅ CHECKLIST DE VALIDATION DES COMPÉTENCES CDA

### 🔸 CCP 1 : Développer une application sécurisée
- [ ] Environnement conteneurisé (Docker) et versionné (Git).
- [ ] Interfaces ergonomiques et respectant les bases du RGAA (contrastes, labels).
- [ ] Style défensif : Utilisation systématique de DTO et de l'outil `Validator` de Symfony.
- [ ] Gestion de projet visible (Board Kanban, commits propres).

### 🔸 CCP 2 : Concevoir et développer en couches
- [ ] Maquettes Figma réalisées en amont.
- [ ] Architecture respectée : Frontend (React) ↔ API REST (Symfony) ↔ BDD (PostgreSQL).
- [ ] Base de données relationnelle avec contraintes d'intégrité (Foreign Keys).
- [ ] Gestion des transactions et des droits d'accès (Voter ou attributs de sécurité).

### 🔸 CCP 3 : Préparer le déploiement
- [ ] Plans de tests rédigés et exécutés (Unitaires + Intégration).
- [ ] Documentation de déploiement à jour.
- [ ] Pipeline CI/CD fonctionnel avec étape de **scan de sécurité (Trivy)**.

---

## 🧠 RÈGLES D'OR DU MENTOR (À RELIRE CHAQUE LUNDI)

1. **La documentation se fait au fur et à mesure.** Ne laisse pas la rédaction des dossiers pour la semaine 9. Note tes choix techniques et prends des captures d'écran chaque semaine.
2. **La sécurité n'est pas une option, c'est le cœur du sujet.** Chaque formulaire doit être validé côté serveur. Chaque donnée sensible doit être protégée. C'est ce qui différencie un projet "scolaire" d'un projet "pro".
 the MVP.** Mieux vaut une carte qui affiche 10 bateaux parfaitement sécurisés et déployés, qu'une carte avec 100 fonctionnalités qui plante en démo.
4. **Prépare ton Plan B.** Le jour de la soutenance, Internet peut couper, le VPS peut planter. Ta vidéo de démo est ton assurance-vie.

---
*Document généré le 12/06/2026. Dernière mise à jour à valider avant le démarrage de la Semaine 1.*