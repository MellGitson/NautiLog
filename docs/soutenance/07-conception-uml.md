# Conception de l'Application : Diagrammes UML

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

1. Introduction
2. Diagramme de cas d'utilisation
3. Diagrammes de séquence
4. Diagramme de classes

---

## 1. Introduction

Ce document complète la modélisation MERISE de la base de données (DOC-06) par une conception UML de l'application : les cas d'utilisation par rôle, la dynamique des flux métier les plus représentatifs (diagrammes de séquence), et la structure objet du domaine (diagramme de classes). Les diagrammes de séquence ci-dessous ne sont pas une reconstruction théorique : ils reflètent l'implémentation réelle du backend (contrôleurs, services, repositories cités par fichier), afin de rester cohérents avec le code livré.

---

## 2. Diagramme de cas d'utilisation

Les trois rôles applicatifs (`ROLE_ADMIN`, `ROLE_OWNER`, `ROLE_RENTER`) partagent un socle d'actions communes (`ROLE_USER`) et disposent chacun de cas d'utilisation spécifiques, cohérents avec la matrice des droits d'accès du cahier des charges (DOC-03, section 3.2).

```mermaid
flowchart LR
    Locataire([Locataire<br/>ROLE_RENTER])
    Proprietaire([Propriétaire<br/>ROLE_OWNER])
    Admin([Administrateur<br/>ROLE_ADMIN])

    subgraph Commun["Socle commun (ROLE_USER)"]
        UC1((S'authentifier))
        UC2((Consulter bateaux / ports))
        UC3((Gérer son profil))
        UC4((Supprimer son compte - RGPD))
        UC5((Consulter ses notifications))
        UC6((Signaler un problème))
    end

    subgraph Loc["Cas d'utilisation Locataire"]
        UC7((Réserver un bateau disponible))
        UC8((Consulter ses réservations))
        UC9((Annuler une réservation))
    end

    subgraph Prop["Cas d'utilisation Propriétaire"]
        UC10((Gérer sa flotte de bateaux))
        UC11((Consulter historique réparations))
        UC12((Demander un emplacement))
        UC13((Gérer réservations reçues))
    end

    subgraph Adm["Cas d'utilisation Administrateur"]
        UC14((Gérer tous les bateaux et ports))
        UC15((Gérer les emplacements - Berth))
        UC16((Approuver / refuser demande d'emplacement))
        UC17((Passer un bateau en réparation))
        UC18((Gérer les utilisateurs et rôles))
        UC19((Consulter dashboard KPIs))
        UC20((Répondre à un signalement))

    end

    Locataire --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6
    Proprietaire --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6
    Admin --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6

    Locataire --> UC7 & UC8 & UC9
    Proprietaire --> UC10 & UC11 & UC12 & UC13
    Admin --> UC14 & UC15 & UC16 & UC17 & UC18 & UC19 & UC20
```

### 2.1 Lecture

- Les trois rôles héritent d'un socle d'actions commun à tout utilisateur authentifié.
- Le **Propriétaire** ne gère que sa propre flotte (contrôle appliqué par le Voter `BoatVoter`, cf. DOC-03 section 6.2), à l'exception du passage en statut "En réparation", réservé à l'administrateur.
- L'**Administrateur** est le seul à disposer d'une vue transverse (tous bateaux, tous ports, tous utilisateurs) et des actions d'arbitrage (emplacements, signalements).

---

## 3. Diagrammes de séquence

Trois flux représentatifs ont été retenus : l'authentification (socle sécurité), la réservation avec détection de conflit (règle métier centrale), et la suppression de compte RGPD en cascade (conformité réglementaire). Chaque diagramme correspond au code réellement exécuté (fichiers cités).

### 3.1 Authentification JWT

Fichiers : `security.yaml`, `lexik_jwt_authentication.yaml`, `AuthController.php`.

Le firewall Symfony intercepte la requête de connexion avant même d'atteindre le contrôleur applicatif : `AuthController::login()` n'est jamais exécuté sur ce chemin (il documente ce comportement via une exception explicite), toute la logique passe par les gestionnaires du bundle Lexik JWT.

```mermaid
sequenceDiagram
    actor Client
    participant FW as Firewall "login"<br/>(json_login)
    participant Auth as JsonLoginAuthenticator
    participant UP as UserProvider<br/>(entity: User)
    participant Hash as PasswordHasher
    participant JWT as JWTTokenManager<br/>(Lexik)

    Client->>FW: POST /api/auth/login {email, password}
    FW->>Auth: intercepte la requête
    Auth->>UP: charger l'utilisateur par email
    UP-->>Auth: User (ou introuvable)
    Auth->>Hash: vérifier le mot de passe
    Hash-->>Auth: OK / échec

    alt Authentification réussie
        Auth->>JWT: create(user)
        JWT-->>Auth: token signé
        Auth-->>Client: 200 { "token": "..." }
    else Échec
        Auth-->>Client: 401 Unauthorized
    end

    Note over Client,FW: Requêtes suivantes vers /api/*<br/>Firewall "api" (jwt) valide le token à chaque appel
```

### 3.2 Réservation avec détection de conflit de dates

Fichiers : `ReservationController.php`, `ReservationRepository.php`, `NotificationService.php`.

```mermaid
sequenceDiagram
    actor Locataire
    participant RC as ReservationController
    participant Val as Validator (ReservationDto)
    participant RepoB as Repository(Boat)
    participant RepoR as ReservationRepository
    participant NS as NotificationService
    participant DB as Base de données

    Locataire->>RC: POST /api/reservations {bateauId, dateDebut, dateFin}
    RC->>RC: denyAccessUnlessGranted('ROLE_USER')
    RC->>Val: valider ReservationDto
    Val-->>RC: OK / erreurs 400

    RC->>RepoB: find(bateauId)
    RepoB-->>RC: Boat
    RC->>RC: vérifier statut != EN_RÉPARATION
    RC->>RC: vérifier dateFin >= dateDebut

    RC->>RepoR: trouverChevauchement(bateau, dateDebut, dateFin)
    Note right of RepoR: DQL : boat = :boat AND status != CANCELLED<br/>AND startDate <= :dateFin AND endDate >= :dateDebut

    alt Chevauchement détecté
        RepoR-->>RC: réservation existante
        RC-->>Locataire: 409 Conflict
    else Aucun conflit
        RepoR-->>RC: null
        RC->>DB: persist(Reservation)
        RC->>NS: notifier(propriétaire)
        RC->>NS: notifierAdmins()
        RC->>DB: flush()
        RC-->>Locataire: 201 Created
    end
```

**Note sur la confirmation :** lors du passage d'une réservation au statut `CONFIRMED` (`PATCH /api/reservations/{id}/statut`), la même méthode `trouverChevauchement()` est ré-invoquée avec un paramètre `excludeId` afin d'exclure la réservation courante de la recherche de conflit.

### 3.3 Suppression de compte : droit à l'oubli RGPD

Fichiers : `ProfilController.php` (`supprimer()`), `SuppressionCompteService.php`, `NotificationService.php`.

```mermaid
sequenceDiagram
    actor Utilisateur
    participant PC as ProfilController
    participant SCS as SuppressionCompteService
    participant NS as NotificationService
    participant DB as Base de données

    Utilisateur->>PC: DELETE /api/me
    PC->>SCS: supprimerCompte(user)

    SCS->>DB: findBy(Boat, owner = user)
    loop Pour chaque bateau possédé
        SCS->>SCS: trouverBateauxAlternatifs (même port, disponibles)
        loop Pour chaque réservation active du bateau
            SCS->>NS: notifier(locataire, RGPD_SUPPRESSION, alternatives)
            SCS->>NS: detacherReservation()
            SCS->>DB: remove(Signalement liés)
            SCS->>DB: remove(Reservation)
        end
        SCS->>DB: remove(Repair liées)
        SCS->>DB: detacher Berth (setBoat(null))
        SCS->>DB: remove(Boat)
    end

    loop Pour chaque réservation où user = locataire
        SCS->>NS: detacherReservation()
        SCS->>DB: remove(Signalement liés)
        SCS->>DB: remove(Reservation)
    end

    SCS->>NS: notifierAdmins(départ du compte)
    SCS->>DB: flush() intermédiaire
    Note right of DB: nécessaire pour ordonner les UPDATE<br/>de détachement avant les DELETE

    SCS->>DB: remove(Notification reçues par user)
    SCS->>DB: remove(User)
    SCS->>DB: flush() final
    PC-->>Utilisateur: 200 OK
```

---

## 4. Diagramme de classes

Le diagramme de classes reprend les 9 entités Doctrine du domaine (déjà détaillées dans DOC-06, dictionnaire des données), avec leurs attributs principaux, méthodes métier significatives et relations. Il complète le MCD/MLD de DOC-06 par une vue orientée objet (visibilité, méthodes) plutôt que strictement relationnelle.

```mermaid
classDiagram
    class User {
        -int id
        -string email
        -string[] roles
        -string password
        -string licenseNumber
        -string firstName
        -string lastName
        +getRoles() string[]
        +isAdmin() bool
        +isOwner() bool
    }

    class Boat {
        -int id
        -string name
        -string type
        -string status
        -string description
        -string photoUrl
        +isAvailable() bool
        +setStatus(status)
    }

    class Port {
        -int id
        -string name
        -string city
        -decimal latitude
        -decimal longitude
        -int capacity
    }

    class Berth {
        -int id
        -string label
        -decimal latitude
        -decimal longitude
        +isOccupied() bool
    }

    class BerthRequest {
        -int id
        -string status
        -DateTime createdAt
        +approve()
        +refuse()
    }

    class Repair {
        -int id
        -string description
        -DateTime date
    }

    class Reservation {
        -int id
        -DateTime startDate
        -DateTime endDate
        -string status
        +overlaps(start, end) bool
        +cancel()
    }

    class Notification {
        -int id
        -string type
        -string message
        -bool read
        +markAsRead()
    }

    class Signalement {
        -int id
        -string message
        -string reponseAdmin
        -string status
        +repondre(admin, reponse)
    }

    class BoatVoter {
        <<Voter>>
        +voteOnAttribute(attribute, boat, token) bool
    }

    User "1" --> "0..*" Boat : possède (owner)
    User "1" --> "0..*" Reservation : loue (renter)
    User "1" --> "0..*" BerthRequest : formule
    User "1" --> "0..*" Notification : reçoit
    User "1" --> "0..*" Signalement : rédige

    Port "1" --> "0..*" Boat : accueille
    Port "1" --> "0..*" Berth : contient

    Boat "1" --> "0..*" Repair : subit
    Boat "1" --> "0..*" Reservation : fait l'objet
    Boat "0..1" --> "0..1" Berth : occupe
    Boat "1" --> "0..*" BerthRequest : concerne

    Berth "1" --> "0..*" BerthRequest : cible

    Reservation "1" --> "0..1" Signalement : génère
    Reservation "1" --> "0..*" Notification : déclenche

    BoatVoter ..> Boat : autorise l'accès à
    BoatVoter ..> User : vérifie propriétaire
```

### 4.1 Note sur les méthodes représentées

Les méthodes indiquées (`overlaps()`, `isAvailable()`, `approve()`...) illustrent la responsabilité métier de chaque classe à titre de conception ; certaines de ces règles sont implémentées côté entité, d'autres côté service ou repository (ex. la détection de chevauchement de dates est portée par `ReservationRepository::trouverChevauchement()`, cf. section 3.2), cohérent avec l'architecture en couches du projet (DTO / Controller / Service / Repository, DOC-03 section 5.3), qui évite de surcharger les entités de logique applicative.

---

## Sources

Ce document a été rédigé à partir d'une lecture directe du code source du backend (`backend/src/Controller/`, `backend/src/Service/`, `backend/src/Repository/`, `backend/config/packages/security.yaml`), afin de garantir la cohérence entre la documentation UML et l'implémentation réelle livrée.
