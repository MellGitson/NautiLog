# Journal des Décisions Techniques (ADR)

Ce fichier trace tous les choix techniques importants pris durant le projet.

---

## [ADR-001] — Architecture Monorepo

**Date :** 13/06/2026  
**Décision :** Structure monorepo unique avec séparation `backend/` et `frontend/`  
**Raison :** Simplifier le CI/CD et le déploiement Docker en 10 semaines tout en gardant une séparation logique stricte.

---

## [ADR-002] — Stack technique

**Date :** 13/06/2026  
**Décision :** Symfony (API REST) + React/Vite + PostgreSQL + Docker  
**Raison :** Conformité aux exigences CDA (CCP1, CCP2, CCP3), architecture headless API-First.

---
