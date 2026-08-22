# Politique de Tests : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

10.a Tests unitaires
10.b Tests fonctionnels
10.c Autres tests (intégration, performance, etc.)

---

## Vue d'ensemble

| Type de test | Nombre | Emplacement |
|---|---|---|
| Tests unitaires | 6 | `backend/tests/Service/EncryptionServiceTest.php` |
| Tests fonctionnels | 105 | `backend/tests/Controller/*.php` (12 fichiers) |
| Tests de sécurité (OWASP) | 5 | `backend/tests/Security/OwaspTest.php` |
| **Total backend** | **111** | Suite PHPUnit complète, verte (`111 tests, 210 assertions`) |
| Tests frontend | 0 | Aucun (limite assumée, cf. section 10.c) |

---

## 10.a Tests unitaires

### Choix de périmètre

La suite de tests du projet est très majoritairement composée de tests **fonctionnels** (cf. 10.b), qui valident le comportement de bout en bout via de vraies requêtes HTTP simulées. Ce choix a été fait dès la Phase 1 pour prioriser la couverture des parcours utilisateurs réels dans le temps imparti (10 semaines, développement solo).

Pour illustrer concrètement la démarche de test unitaire pur, isolé de tout contexte HTTP ou base de données, une suite dédiée a été écrite sur `EncryptionService` (`backend/src/Service/EncryptionService.php`), le service candidat le plus pertinent : une logique pure (chiffrement/déchiffrement AES-256-CBC), sans dépendance à Doctrine ni au conteneur HTTP.

### Contenu de la suite

`backend/tests/Service/EncryptionServiceTest.php` : 6 tests, aucune dépendance au kernel Symfony (`PHPUnit\Framework\TestCase`, pas `KernelTestCase`) :

| Test | Objectif |
|---|---|
| `testEncryptThenDecryptReturnsOriginalValue` | Vérifie que chiffrer puis déchiffrer restitue la valeur d'origine |
| `testEncryptedValueDiffersFromPlainValue` | Vérifie que la valeur chiffrée ne correspond jamais à la valeur en clair |
| `testEncryptingTwiceProducesDifferentCiphertexts` | Vérifie que deux chiffrements de la même valeur produisent des résultats différents (IV aléatoire à chaque appel, cf. `03-cahier-des-charges.md` section 6.3) et que les deux se déchiffrent correctement |
| `testEncryptNullReturnsNull` | Cas limite : `null` en entrée retourne `null` sans erreur |
| `testDecryptNullReturnsNull` | Cas limite symétrique au déchiffrement |
| `testDecryptWithWrongKeyDoesNotReturnOriginalValue` | Vérifie qu'une clé différente ne permet pas de retrouver la valeur d'origine |

### Limite assumée

Le reste de la logique métier (détection de conflit de réservation, suppression RGPD en cascade) est actuellement couvert uniquement par des tests fonctionnels (cf. 10.b), qui valident le comportement observable via l'API sans isoler chaque service individuellement. Étendre les tests unitaires à `NotificationService` ou à la logique de `SuppressionCompteService` est identifié comme axe d'amélioration, non traité dans le périmètre MVP.

---

## 10.b Tests fonctionnels

### Approche retenue

Les tests fonctionnels constituent le cœur de la politique de test du projet : ils simulent une requête HTTP réelle vers l'API (via le client de test Symfony, `KernelTestCase`/`WebTestCase`) et vérifient la réponse (code HTTP, contenu JSON, effets en base). Cette approche a été privilégiée car elle valide le comportement effectivement exposé aux utilisateurs, y compris l'enchaînement des couches (Controller → Service → Repository → base de données), plutôt que chaque couche isolément.

### Pourquoi 105 tests fonctionnels : logique de dimensionnement

Ce nombre n'est pas arbitraire : il découle directement de la combinatoire du projet plutôt que d'un objectif de couverture fixé a priori. Pour une route donnée, plusieurs axes sont systématiquement testés :

| Axe testé | Exemple |
|---|---|
| Cas nominal | Créer un bateau avec des données valides retourne bien 201 |
| Cas d'erreur / validation | Créer un bateau sans nom retourne 400 avec le message d'erreur attendu |
| Contrôle d'accès par rôle | Un `ROLE_RENTER` ne peut pas modifier un bateau qui ne lui appartient pas (403) |
| Cas limite métier | Une réservation avec chevauchement de dates est rejetée (409, cf. `07-conception-uml.md` section 3.2) |

Avec **9 entités métier** et **3 rôles** disposant chacun de droits différents sur une bonne partie de ces entités (cf. matrice des droits d'accès, `03-cahier-des-charges.md` section 3.2), le simple produit "route × rôle × cas d'erreur" suffit à expliquer la volumétrie : `BateauControllerTest.php` compte à lui seul 18 tests parce que le CRUD des bateaux croise plusieurs rôles et plusieurs cas d'erreur sur les mêmes 4-5 routes, et ce nombre est donc le reflet direct de la richesse fonctionnelle et du système RBAC du projet, pas d'une volonté de gonfler artificiellement une métrique de couverture.

### Répartition par contrôleur

| Fichier de test | Nombre de tests | Périmètre couvert |
|---|---|---|
| `BateauControllerTest.php` | 18 | CRUD bateaux, autorisation (Voter), changement de statut |
| `PortControllerTest.php` | 15 | CRUD ports, capacité, contraintes |
| `AdminUtilisateurControllerTest.php` | 9 | Gestion des utilisateurs par un administrateur |
| `ReservationControllerTest.php` | 10 | Création, détection de conflit, confirmation, annulation |
| `ProfilControllerTest.php` | 8 | Consultation et édition de profil |
| `AuthControllerTest.php` | 7 | Inscription, connexion, cas d'erreur |
| `BerthControllerTest.php` | 7 | Gestion des emplacements d'amarrage |
| `BerthRequestControllerTest.php` | 7 | Demandes d'emplacement (création, approbation, refus) |
| `SuppressionCompteControllerTest.php` | 6 | Suppression RGPD en cascade, notifications associées |
| `BateauPhotoControllerTest.php` | 6 | Upload de photo de bateau |
| `BateauExportPdfControllerTest.php` | 4 | Export PDF du carnet de bateau |
| `AdminStatsControllerTest.php` | 3 | Indicateurs du dashboard admin |

### Ce que ces tests garantissent concrètement

- Le contrôle d'accès par rôle est vérifié systématiquement (ex. un `ROLE_RENTER` ne peut pas modifier un bateau qui ne lui appartient pas).
- La détection de conflit de dates sur les réservations (cf. `07-conception-uml.md`, section 3.2) est testée avec des scénarios de chevauchement réels, pas seulement le chemin nominal.
- La suppression RGPD en cascade est testée jusqu'à la vérification des notifications envoyées aux locataires impactés.

---

## 10.c Autres tests (intégration, performance, etc.)

### Tests de sécurité applicative

`backend/tests/Security/OwaspTest.php` (5 tests) : suite dédiée couvrant des scénarios OWASP de base : tentative d'accès non authentifié à une route protégée, tentative d'action avec un rôle insuffisant, vérification du code de retour HTTP attendu (401/403) plutôt que d'une erreur silencieuse.

### Intégration continue : tests en environnement propre

Chaque exécution de la suite en CI (job `tests-phpunit` du pipeline GitHub Actions, cf. `04-methodologie.md` section 7) recrée une base PostgreSQL éphémère et rejoue les migrations avant de lancer PHPUnit, ce qui constitue en soi un test d'intégration implicite de la chaîne migration + ORM + base de données, au-delà du seul code applicatif. C'est cette exécution en environnement propre qui a révélé plusieurs bugs préexistants documentés dans `14-difficultes-rencontrees.md` (section 2.1).

### Ce qui n'est pas couvert

| Type de test | Statut | Justification |
|---|---|---|
| Tests frontend (React) | Absents | Aucun framework de test frontend (Vitest, React Testing Library) installé ; limite assumée du MVP, le frontend a été validé manuellement en développement |
| Tests de performance / charge | Absents | Hors périmètre d'un projet de démonstration sans volumétrie de production réelle (cf. `03-cahier-des-charges.md`, section 8) |
| Tests end-to-end (Cypress, Playwright) | Absents | Le couple tests fonctionnels backend + validation manuelle du frontend a été jugé suffisant pour le périmètre MVP dans le délai imparti |

Ces absences sont documentées comme des choix de scope assumés plutôt que des oublis, cohérentes avec la démarche de transparence déjà appliquée pour l'absence de rate limiting (`03-cahier-des-charges.md`, section 6.6) et le choix de non-déploiement initial (section 7.3).

---

## Synthèse

La politique de test de NautiLog privilégie la couverture fonctionnelle de bout en bout (105 tests) comme rempart principal contre les régressions, complétée par une première suite de tests unitaires purs sur la logique la plus sensible du projet (le chiffrement des données personnelles, 6 tests) et par des tests de sécurité ciblés (5 tests). L'ensemble constitue une suite de 111 tests, exécutée automatiquement et de façon bloquante à chaque push via le pipeline CI/CD.
