# Déploiement et Mise en Production : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

XI.a Containerisation avec Docker
XI.b Environnements de déploiement
XI.c Stratégies de mise en production

---

## Introduction

NautiLog est déployé en production à l'adresse **`https://nautilog.fr`**, sur un VPS OVH, en complément de l'environnement de développement local (Docker Compose). Ce document décrit la démarche de mise en production, distincte de la configuration de développement décrite dans `03-cahier-des-charges.md` (section 5.5).

---

## XI.a Containerisation avec Docker

### Réutilisation de l'architecture conteneurisée existante

Le projet est déjà entièrement conteneurisé pour le développement (5 services Docker Compose, cf. `03-cahier-des-charges.md` section 5.5). La mise en production réutilise cette architecture, avec des différences ciblées adaptées au contexte de production :

| Aspect | Développement | Production |
|---|---|---|
| Frontend | Serveur de développement Vite (`npm run dev`) | Build statique optimisé (`npm run build`), servi par Nginx (`frontend/Dockerfile.prod`, build multi-stage) |
| Reverse-proxy | HTTP uniquement, port 80 | HTTPS avec redirection automatique HTTP→HTTPS, ports 80 et 443 |
| Base de données | Port 5432 exposé sur l'hôte | Port non exposé, accessible uniquement via le réseau Docker interne |
| Fichiers montés | Code source monté en volume (hot-reload) | Code figé dans l'image au build, seuls `uploads/` et les clés JWT sont montés en volumes persistants |
| Configuration | `docker-compose.yml` | `docker-compose.prod.yml`, fichier dédié versionné séparément |

### Fichiers de configuration créés

- `docker-compose.prod.yml` : orchestration des services de production, incluant un service `certbot` dédié à la gestion du certificat HTTPS.
- `frontend/Dockerfile.prod` : build multi-stage : étape 1 compile l'application React (`npm run build`), étape 2 sert les fichiers statiques générés via une image Nginx légère.
- `nginx/prod.conf` : configuration finale avec redirection HTTPS et headers de sécurité (identiques à la configuration de développement, cf. `09-securite.md`).
- `nginx/prod-http-only.conf` : configuration transitoire, utilisée uniquement le temps d'obtenir le premier certificat Let's Encrypt (le certificat ne peut pas exister avant d'avoir un serveur HTTP répondant au challenge ACME).

---

## XI.b Environnements de déploiement

### Infrastructure

| Élément | Détail |
|---|---|
| Hébergeur | OVH (VPS) |
| Système d'exploitation | Ubuntu 26.04 LTS |
| Ressources | 2 vCores / 4 Go RAM |
| Nom de domaine | `nautilog.fr` (OVH), DNS pointé vers l'IP du VPS |
| Certificat HTTPS | Let's Encrypt (Certbot), renouvellement automatique via cron |
| Pare-feu | UFW, seuls les ports SSH (22), HTTP (80) et HTTPS (443) sont ouverts |

### Sécurisation initiale du serveur

Avant tout déploiement applicatif, le VPS a été sécurisé a minima :
- mise à jour complète du système (`apt update && apt upgrade`) ;
- installation de Docker Engine et du plugin Docker Compose via le dépôt officiel Docker (clé GPG vérifiée) ;
- pare-feu UFW activé, n'autorisant que les ports strictement nécessaires ;
- utilisateur non-root (`ubuntu`) ajouté au groupe `docker` pour éviter l'usage systématique de `sudo`.

### Obtention du certificat HTTPS

Le certificat a été obtenu en deux temps, une contrainte inhérente au protocole ACME de Let's Encrypt :

1. Démarrage de la stack avec la configuration Nginx **HTTP uniquement**, exposant le chemin `/.well-known/acme-challenge/` nécessaire à la validation du domaine.
2. Exécution de `certbot certonly --webroot` pour obtenir le certificat une fois le domaine validé par ce challenge.
3. Bascule vers la configuration Nginx définitive (HTTPS avec redirection automatique).

---

## XI.c Stratégies de mise en production

### Déploiement manuel piloté par Git

Le déploiement actuel suit un flux manuel mais reproductible :

```
git pull origin <branche>
docker compose -f docker-compose.prod.yml --env-file .env build [service]
docker compose -f docker-compose.prod.yml --env-file .env up -d [service]
```

Chaque mise à jour de code passe par un `git pull` sur le VPS suivi d'un rebuild ciblé du ou des services concernés, sans redéploiement complet systématique, ce qui limite l'indisponibilité de l'application.

### Secrets de production

Les secrets (mot de passe base de données, `APP_SECRET`, clé de chiffrement, passphrase JWT) sont générés spécifiquement pour la production (jamais réutilisés depuis l'environnement de développement) et stockés dans un fichier `.env` non commité sur le VPS, à partir du gabarit `.env.prod.example` versionné dans le dépôt.

### Persistance des données

Trois éléments sont explicitement persistés via des volumes Docker nommés, pour survivre aux redémarrages et rebuilds de conteneurs :

| Volume | Contenu | Pourquoi c'est nécessaire |
|---|---|---|
| `db_data` | Données PostgreSQL | Évident : perte de toutes les données métier sinon |
| `jwt_keys` | Paire de clés RSA (JWT) | Sans persistance, chaque rebuild du conteneur API invaliderait tous les tokens émis et casserait l'authentification |
| `backend/public/uploads` (bind mount) | Photos de bateaux uploadées | Fichiers utilisateur, non reconstructibles depuis le code |

### Initialisation de la base de données en production

Contrairement à l'environnement de développement (fixtures Faker/Alice pour peupler des données de test, cf. `03-cahier-des-charges.md` section 5.2), la base de production démarre vide : seules les migrations Doctrine sont exécutées (`doctrine:migrations:migrate`), sans jeu de données de démonstration. Le premier compte administrateur a été créé via la route d'inscription publique, puis élevé au rôle `ROLE_ADMIN` par une requête SQL directe, aucune commande dédiée de création d'admin n'existant dans le projet à ce jour (axe d'amélioration identifié).

### Renouvellement automatique du certificat

Un certificat Let's Encrypt est valide 90 jours. Une tâche cron sur le VPS relance `certbot renew` deux fois par mois (les 1er et 15) ; Certbot ne renouvelle effectivement que lorsque le certificat approche de son expiration, rendant les exécutions superflues sans risque.

### Difficultés rencontrées lors du déploiement

Le passage du développement à la production a révélé plusieurs écarts de configuration invisibles jusque-là, cohérent avec le constat déjà documenté pour la mise en place de la CI (`14-difficultes-rencontrees.md`, section 2.1) : un environnement neuf agit systématiquement comme révélateur de dépendances implicites.

| Problème rencontré | Cause | Correction |
|---|---|---|
| `502 Bad Gateway` sur toutes les requêtes | Directive `resolver` DNS manquante dans la configuration Nginx transitoire (HTTP-only), empêchant la résolution du nom de service `client` | Ajout de `resolver 127.0.0.11 valid=10s;` dans `nginx/prod-http-only.conf` |
| `Malformed database connection URL` | Mot de passe PostgreSQL généré via `openssl rand -base64` contenant des caractères spéciaux (`/`, `+`) non compatibles avec la syntaxe d'URL de connexion | Génération d'un mot de passe hexadécimal (`openssl rand -hex`), sans caractère spécial |
| `EnvNotFoundException` en cascade (`CORS_ALLOW_ORIGIN`, `DEFAULT_URI`, `JWT_TOKEN_TTL`, `MAILER_DSN`) | Ces variables n'étaient définies que dans les fichiers `.env`/`.env.dev` de développement, jamais reportées dans `docker-compose.prod.yml` | Ajout explicite de chacune, avec des valeurs adaptées au domaine de production (`https://nautilog.fr`) |
| `Cannot rename ... Permission denied` sur `var/cache/prod/` | L'utilisateur `www-data` (PHP-FPM) n'avait pas les droits d'écriture sur le dossier de cache Symfony, propriété de `root` par défaut dans l'image | Ajout d'un `chown -R www-data:www-data var` directement dans `backend/Dockerfile`, appliqué au build plutôt qu'en correctif manuel répété à chaque redémarrage |
| `JWTEncodeFailureException` après redémarrage du conteneur API | Les clés JWT générées via `docker compose run` (conteneur éphémère) n'étaient persistées nulle part, perdues au premier redémarrage du service | Ajout d'un volume Docker nommé (`jwt_keys`) monté sur `config/jwt/`, régénération unique des clés dans ce volume persistant |

Cette liste illustre une différence structurelle entre développement et production : la configuration de dev repose sur des fichiers `.env` riches, écrits une fois pour toutes ; la configuration de prod (variables d'environnement Docker Compose) doit être reconstituée explicitement variable par variable, ce qui expose les oublis un par un plutôt que d'un coup.
