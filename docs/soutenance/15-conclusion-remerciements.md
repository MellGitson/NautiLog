# Conclusion, Ouverture et Remerciements : NautiLog

**Projet :** NautiLog, gestion de flotte nautique et carte interactive de disponibilité
**Titre visé :** Concepteur Développeur d'Applications (CDA)
**Auteur :** Mell Canac
**Version du document :** 1.0

---

## Sommaire

1. Bilan du projet
2. Compétences acquises
3. Perspectives d'évolution
4. Remerciements

---

## 1. Bilan du projet

NautiLog répond, sur un périmètre fonctionnel complet, à la problématique initiale : centraliser la gestion d'une flotte de bateaux, de ses ports d'attache et de ses réservations, pour des acteurs jonglant jusque-là avec des outils disparates (tableurs, échanges informels). Le projet démontre la mise en œuvre concrète des trois blocs de compétences du titre CDA :

- **CCP1 : Développer une application sécurisée** : authentification JWT stateless, contrôle d'accès RBAC à deux granularités (routes + Voter), chiffrement AES-256-CBC des données sensibles, conformité RGPD effective (droit à l'oubli en cascade).
- **CCP2 : Concevoir et développer en couches** : architecture API-first découplée, séparation stricte Controller/DTO/Service/Repository côté backend, modélisation MERISE complète (MCD/MLD/MPD) et conception UML (cas d'utilisation, séquence, classes).
- **CCP3 : Préparer le déploiement d'une application** : pipeline CI/CD GitHub Actions (lint, tests automatisés, scan de vulnérabilités Trivy, build et publication d'images Docker), environnement entièrement conteneurisé et reproductible.

Au-delà de la seule réalisation technique, le projet a également nécessité une gestion de projet réelle en solo sur 10 semaines : priorisation d'un backlog, absorption d'une extension de périmètre non planifiée (portail admin, Phase 3ter), et arbitrage assumé de certains choix de scope (non-déploiement en production, absence de rate limiting) plutôt que leur dissimulation.

## 2. Compétences acquises

Le développement de NautiLog a été l'occasion de consolider des compétences sur l'ensemble de la chaîne de développement d'une application web :

| Domaine | Compétences mobilisées |
|---|---|
| Architecture logicielle | Conception d'une API REST en couches, séparation des responsabilités, patterns DTO/Voter |
| Sécurité applicative | Authentification stateless, chiffrement de données sensibles, mitigation des risques OWASP de base |
| Base de données | Modélisation MERISE de bout en bout, gestion de migrations Doctrine, contraintes d'intégrité référentielle |
| DevOps | Conteneurisation Docker multi-services, pipeline d'intégration continue, scan de sécurité automatisé |
| Frontend | Construction d'une SPA React avec gestion d'état, cartographie interactive, accessibilité de base (RGAA) |
| Gestion de projet | Pilotage solo d'un backlog sur 10 semaines, arbitrage de scope, traçabilité des décisions techniques |

## 3. Perspectives d'évolution

Comme détaillé dans le Cahier des Charges Fonctionnel (DOC-03, section 9.2), plusieurs axes d'évolution restent identifiés au-delà du périmètre MVP :

- Déploiement effectif en production (VPS, nom de domaine, certificat HTTPS), pour compléter la démonstration CCP3 en conditions réelles.
- Mise en place d'un rate limiting, pour renforcer la robustesse face aux abus (limite actuellement assumée du MVP).
- Extension de la fonctionnalité météo marine à des prévisions multi-jours.
- Notifications en temps réel (WebSocket/Mercure) en remplacement du rafraîchissement manuel actuel.
- Étude d'une application mobile pour étendre l'accès à la plateforme en mobilité.

Ces perspectives ne sont pas des manques à excuser, mais un périmètre volontairement délimité pour sécuriser la livraison d'un MVP fonctionnel et cohérent dans le délai imparti.

---

## 4. Remerciements

*(Section à personnaliser par l'auteur avant dépôt : noms et affiliations réels des personnes concernées.)*

Je tiens à remercier :

- **[l'équipe du service SSI de la HAS]**, pour l'encadrement, l'accompagnement et leur bienveillance apportés tout au long de mon passage en alternance j'ai pu gagner en expérience et découvrir le domaine de l'informatique dans le milieu de la Santé.

- **L'équipe pédagogique de l'IPSSI**, pour la structuration du parcours ayant permis d'aborder l'ensemble des compétences de la formation Concepteur Développeur d'Applications couvertes par ce projet.
- **[Toute personne ayant apporté un retour ponctuel]** (relecture, test utilisateur informel, avis sur l'interface), le cas échéant.

Enfin, les ressources et outils open-source mobilisés pour ce projet méritent d'être mentionnés : l'écosystème Symfony et son bundle LexikJWTAuthenticationBundle, React et son écosystème (Vite, React-Leaflet, React Router), OpenStreetMap/Leaflet pour la cartographie, et l'API publique Open-Meteo pour les données météorologiques.
