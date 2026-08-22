# Veille Sécurité : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

> **À compléter par l'auteur.** Ce document appelle des captures d'écran réelles (scan Trivy, `npm audit`, `composer audit`) et des sources précises (avis CVE, date de consultation) à ajouter avant le dépôt final.

---

## Sommaire

XIII.a Analyse des menaces actuelles
XIII.b Captures d'écran et exemples concrets
XIII.c Mesures préventives

---

## Introduction

Ce document complète `09-securite.md` (organisé selon les sous-points 9.a→9.f de la checklist, mitigations déjà implémentées) par une lecture orientée **veille** : quelles menaces ont été identifiées comme pertinentes pour la stack du projet, quelles preuves concrètes en attestent, et quelles mesures préventives en découlent.

---

## XIII.a Analyse des menaces actuelles

### Menaces génériques web (Top 10 OWASP)

Le tableau ci-dessous relie chaque menace du Top 10 OWASP à sa mitigation réellement implémentée dans NautiLog, chaque ligne renvoyant au détail déjà documenté dans `09-securite.md`.

| Menace | Mitigation dans NautiLog | Référence détaillée |
|---|---|---|
| Injection SQL | ORM Doctrine avec requêtes paramétrées (DQL) systématiques, aucune concaténation de requête SQL brute | `09-securite.md`, section 9.b |
| XSS (Cross-Site Scripting) | Échappement automatique React, header `Content-Security-Policy` Nginx | `09-securite.md`, section 9.a |
| CSRF | Non applicable directement (authentification stateless par JWT en header, pas de cookie de session) | `09-securite.md`, section 9.c |
| Force brute sur l'authentification | **Non implémenté**, limite assumée du MVP | `09-securite.md`, section 9.d |
| Mauvaise gestion des mots de passe | Hachage via `Symfony\Component\PasswordHasher` | `09-securite.md`, section 9.e |
| Exposition de données sensibles | Chiffrement AES-256-CBC du numéro de permis bateau | `03-cahier-des-charges.md`, section 6.3 |
| Composants avec vulnérabilités connues | Scan Trivy (filesystem, sévérités HIGH/CRITICAL) intégré au pipeline CI, non bloquant | `03-cahier-des-charges.md`, section 5.6 |

### Menaces spécifiques à la stack du projet

Points de veille à documenter avec la source réelle (avis de sécurité, changelog, date) :

- **Symfony Security Advisories** : suivi des avis de sécurité officiels Symfony (`symfony/security-advisories` sur Packagist/GitHub) pour les versions utilisées (`8.1.*`).
- **Lexik JWT Bundle** : vérification de l'absence de faille connue sur la version utilisée (l'algorithme RS256 par paire de clés RSA a été retenu plutôt que HS256 à secret partagé, plus robuste en cas de compromission côté client).
- **Dépendances npm frontend** : surface d'attaque des dépendances React/Vite, à vérifier via `npm audit`.
- **PostgreSQL 15** : suivi des CVE publiées pour l'image `postgres:15-alpine` utilisée en conteneur.
- **Docker** : images de base utilisées (`postgres:15-alpine`, `nginx:alpine`, `node:20`, PHP-FPM). L'usage systématique de variantes `alpine` réduit la surface d'attaque (moins de paquets système embarqués) par rapport à des images complètes.

**À compléter :** CVE spécifique rencontrée et corrigée durant le projet, le cas échéant ; dates de consultation des avis de sécurité.

---

## XIII.b Captures d'écran et exemples concrets

*(Section à compléter par l'auteur : captures réelles à insérer avant le dépôt final, cohérent avec l'item XVII Annexes.)*

**Captures attendues :**

1. **Résultat d'un scan Trivy réel** : capture du job `trivy-scan` dans l'historique GitHub Actions du projet (onglet Actions du dépôt), montrant les vulnérabilités détectées (le cas échéant) et leur sévérité.
2. **`composer audit`** : sortie de la commande exécutée en local (`docker compose exec api composer audit`) sur les dépendances PHP.
3. **`npm audit`** : sortie de la commande exécutée en local (`docker compose exec client npm audit`) sur les dépendances frontend.
4. **Exemple concret de mitigation testée** : capture d'une tentative de requête sans authentification sur une route protégée (ex. `curl` sans header `Authorization` vers `/api/admin`), montrant la réponse `401`/`403`, ce qui illustre concrètement le contrôle d'accès plutôt que de l'affirmer sans preuve.
5. **Headers de sécurité en conditions réelles** : capture des en-têtes de réponse HTTP (onglet Réseau des outils de développement du navigateur, ou `curl -I`) sur une page de l'application, montrant `Content-Security-Policy`, `X-Frame-Options`, etc. effectivement présents.

**Emplacement de stockage recommandé :** `docs/screenshots/`, avec un nom de fichier explicite par capture (ex. `trivy-scan-2026-08.png`, `headers-securite.png`).

---

## XIII.c Mesures préventives

### Mesures déjà en place

| Mesure préventive | Nature | Détail |
|---|---|---|
| Scan de vulnérabilités automatisé | Préventif continu | Job Trivy exécuté à chaque push (`04-methodologie.md`, section 7) |
| Lint bloquant en CI | Préventif continu | Empêche la fusion de code non conforme aux standards du projet |
| Chiffrement des données sensibles | Préventif structurel | Protection appliquée au niveau de la couche persistance, transparente pour le reste du code (`03-cahier-des-charges.md`, section 6.3) |
| Contraintes d'intégrité en base (`NOT NULL`/`UNIQUE`) | Préventif structurel | Double barrière avec la validation applicative (`06-modelisation-bdd.md`, section 6.1) |
| Headers de sécurité Nginx | Préventif continu | Appliqués globalement à toute réponse HTTP, pas seulement aux routes sensibles |

### Mesures identifiées mais non implémentées (axes de veille pour la suite)

| Mesure | Pourquoi elle n'est pas encore en place | Référence |
|---|---|---|
| Rate limiting sur l'authentification | Limite assumée du MVP, composant `symfony/rate-limiter` identifié comme solution | `09-securite.md`, section 9.d |
| Export des données personnelles (portabilité RGPD) | Périmètre RGPD partiel assumé (droit à l'oubli seul couvert) | `09-securite.md`, section 9.f |
| Audit `npm audit`/`composer audit` automatisé en CI | Actuellement exécuté manuellement, non intégré comme job CI dédié | À évaluer pour une itération future |

---

## Synthèse

La veille sécurité menée sur ce projet ne se limite pas à une liste de mitigations implémentées : elle inclut l'identification consciente de ce qui n'a pas été traité (force brute, portabilité RGPD), documentée comme limite assumée plutôt que dissimulée, ce qui reste cohérent avec la démarche de transparence appliquée sur l'ensemble du dossier de soutenance.
