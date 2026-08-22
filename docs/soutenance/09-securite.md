# Sécurité : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

9.a Injection XSS (Cross-Site Scripting)
9.b Injection SQL
9.c Failles CSRF (Cross-Site Request Forgery)
9.d Attaques par force brute
9.e Hachage des mots de passe
9.f Conformité RGPD

---

## 9.a Injection XSS (Cross-Site Scripting)

### Risque

Une faille XSS permet à un attaquant d'injecter du script exécutable dans une page consultée par d'autres utilisateurs (ex. via un champ texte libre, description de bateau, message de signalement, non échappé à l'affichage).

### Mitigations mises en œuvre

| Mesure | Détail |
|---|---|
| Échappement automatique côté React | React échappe par défaut tout contenu inséré dans le JSX (`{variable}`) ; le projet n'utilise `dangerouslySetInnerHTML` nulle part dans le code |
| Header `Content-Security-Policy` | Défini au niveau Nginx (`nginx/default.conf`) : `default-src 'self'`, restreint les scripts, styles et connexions aux origines de confiance |
| Header `X-XSS-Protection` | `1; mode=block`, activation du filtre XSS des navigateurs legacy |
| Header `X-Content-Type-Options` | `nosniff`, empêche le navigateur de réinterpréter un contenu comme exécutable |

### Limite assumée

Aucun test automatisé n'injecte explicitement de payload XSS dans les champs texte libres (description, message de signalement) pour vérifier l'échappement en conditions réelles : la protection repose sur le comportement par défaut de React, non testée par un test dédié dans `OwaspTest`.

---

## 9.b Injection SQL

### Risque

Une injection SQL permet à un attaquant de manipuler une requête base de données via une entrée utilisateur non filtrée (ex. concaténation directe d'un paramètre dans une requête SQL brute).

### Mitigations mises en œuvre

| Mesure | Détail |
|---|---|
| ORM Doctrine avec requêtes paramétrées | Toutes les requêtes du projet passent par Doctrine (DQL ou QueryBuilder), avec liaison de paramètres (`setParameter()`), aucune concaténation de chaîne SQL brute dans le code |
| Exemple représentatif | `ReservationRepository::trouverChevauchement()` construit sa requête via QueryBuilder/DQL avec des paramètres nommés (`:boat`, `:startDate`, `:endDate`), jamais par interpolation de variable |
| Validation en amont | Les DTO (`Dto/`) et leurs contraintes Symfony Validator filtrent les types et formats avant même que la donnée n'atteigne la couche de persistance |

### Limite assumée

Aucune requête SQL native (`$connection->executeQuery()` avec chaîne brute) n'est utilisée dans le projet : le risque d'injection SQL est donc structurellement écarté par le choix systématique de l'ORM, plutôt que mitigé au cas par cas.

---

## 9.c Failles CSRF (Cross-Site Request Forgery)

### Risque

Une faille CSRF permet à un site tiers malveillant de déclencher, à l'insu de l'utilisateur, une action authentifiée sur NautiLog (ex. suppression de compte) en exploitant une session active.

### Analyse : pourquoi ce risque est structurellement réduit

Le CSRF classique exploite l'envoi automatique de cookies de session par le navigateur. NautiLog n'utilise **aucune session serveur ni cookie d'authentification** : le token JWT est transmis explicitement dans l'en-tête HTTP `Authorization: Bearer <token>`, jamais via un cookie envoyé automatiquement par le navigateur. Un site tiers ne peut donc pas forcer une requête authentifiée sans connaître le token, qui n'est accessible qu'au JavaScript de l'application elle-même (stocké en `localStorage`).

| Élément | État dans NautiLog |
|---|---|
| Protection CSRF Symfony (`csrf_protection`) | Non activée, présente uniquement dans la configuration de référence du framework (`config/reference.php`), jamais utilisée dans `security.yaml` |
| Authentification par cookie de session | Absente (firewall `api` stateless, `jwt: ~`) |
| Vecteur d'attaque CSRF classique | Non applicable dans ce modèle d'authentification |

### Limite assumée

Ce choix déplace le risque vers le **XSS** (cf. 9.a) : si un script malveillant parvenait à s'exécuter dans le contexte de l'application, il pourrait lire le token en `localStorage` (contrairement à un cookie `HttpOnly`, non accessible en JavaScript). Ce compromis, stateless/CSRF-safe contre exposition du token au XSS, est un choix d'architecture assumé, cohérent avec une API découplée, à documenter explicitement en soutenance plutôt qu'à présenter comme un point aveugle.

---

## 9.d Attaques par force brute

### Risque

Un attaquant peut tenter de deviner un mot de passe par essais répétés automatisés sur `/api/auth/login`.

### État actuel

**Non implémenté.** Aucun mécanisme de limitation du nombre de tentatives (rate limiting, verrouillage temporaire de compte, CAPTCHA) n'est en place, ni au niveau Nginx ni au niveau applicatif Symfony.

### Mitigation partielle existante

Le hachage du mot de passe (cf. 9.e) ralentit une attaque hors ligne en cas de fuite de la base, mais n'empêche pas une attaque en ligne par requêtes répétées sur l'endpoint de connexion.

### Limite assumée

Ce point est documenté comme une limite assumée du périmètre MVP (cf. `03-cahier-des-charges.md`, section 6.6), à mentionner explicitement en soutenance. Une évolution possible, non implémentée, serait l'ajout du composant `symfony/rate-limiter` sur le firewall `login`.

---

## 9.e Hachage des mots de passe

### Mitigations mises en œuvre

| Mesure | Détail |
|---|---|
| Aucun mot de passe stocké en clair | Le champ `password` de l'entité `User` ne contient jamais la valeur saisie, uniquement son hash |
| Hasher Symfony (`password_hashers`, `security.yaml`) | Algorithme `auto`, Symfony sélectionne l'algorithme recommandé disponible sur l'environnement serveur (bcrypt ou argon2id selon les extensions PHP installées) |
| Salage automatique | Géré nativement par l'algorithme de hachage sélectionné (argon2id/bcrypt intègrent un sel aléatoire par hash, sans gestion manuelle) |
| Génération du hash | Centralisée dans `UserPasswordHasherInterface::hashPassword()`, appelée à l'inscription et dans les fixtures de test (`UserProcessor`) |

### Vérification à la connexion

La comparaison ne se fait jamais par égalité de chaîne : `UserPasswordHasherInterface` recalcule et compare les hashs via une fonction résistante aux attaques temporelles (timing attack), déléguée entièrement au composant Symfony PasswordHasher plutôt qu'implémentée manuellement.

---

## 9.f Conformité RGPD

### Droit à l'oubli : `DELETE /api/me`

Implémenté de façon **immédiate** (sans validation humaine intermédiaire, le RGPD ne l'exigeant pas) et **en cascade complète**, détaillé dans `07-conception-uml.md` (section 3.3) :

1. Pour chaque bateau possédé : notification des locataires ayant une réservation active (avec suggestion de bateaux alternatifs dans le même port), suppression des réparations, détachement des emplacements, suppression du bateau.
2. Suppression des réservations où l'utilisateur est locataire.
3. Notification des administrateurs du départ du compte.
4. Suppression des notifications adressées à l'utilisateur, puis suppression du compte.

### Minimisation des données

| Principe RGPD | Application dans NautiLog |
|---|---|
| Minimisation | Aucune donnée personnelle dupliquée entre tables, le nom/email de l'utilisateur n'est jamais recopié dans `boats`/`reservations`, toujours référencé par clé étrangère |
| Protection des données sensibles | Numéro de permis bateau (`User::$licenseNumber`) chiffré en base (AES-256-CBC), cf. `03-cahier-des-charges.md` section 6.3 |
| Pas de géolocalisation personnelle | Seules les entités métier (`ports`, `berths`) portent des coordonnées GPS, aucune donnée de localisation collectée sur l'utilisateur lui-même |
| Traçabilité de la suppression | Suppression en cascade complète, permise par la modélisation relationnelle explicite (clés étrangères), garantissant qu'aucune donnée résiduelle ne subsiste après l'exercice du droit à l'oubli |

### Limite assumée

Aucun mécanisme d'export des données personnelles (droit à la portabilité) n'est implémenté à ce stade : seul le droit à l'oubli (suppression) est couvert, ce qui constitue un périmètre RGPD partiel assumé pour le MVP.

---

## Synthèse

| Sous-point | Statut |
|---|---|
| 9.a XSS | Mitigé (React + CSP), non testé automatiquement |
| 9.b Injection SQL | Structurellement écarté (ORM systématique) |
| 9.c CSRF | Non applicable par choix d'architecture (JWT stateless), compromis documenté |
| 9.d Force brute | **Non implémenté**, limite assumée |
| 9.e Hachage mots de passe | Implémenté (Symfony PasswordHasher, algorithme auto) |
| 9.f RGPD | Droit à l'oubli complet ; droit à la portabilité non couvert |
