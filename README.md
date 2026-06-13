# NautiLog

Carnet de navigation électronique intelligent, gestion de flotte et carte interactive de disponibilité.

## Stack technique

- **Backend :** Symfony (API REST) + PostgreSQL
- **Frontend :** React (Vite)
- **Infra :** Docker, Nginx, GitHub Actions CI/CD

## Installation rapide

```bash
git clone https://github.com/MellGitson/NautiLog.git
cd NautiLog
docker-compose up -d
```

## Architecture

```
NautiLog/
├── backend/      # API Symfony
├── frontend/     # Application React
├── docs/         # Diagrammes et décisions techniques
└── docker-compose.yml
```

## Comptes de test (jury)

| Rôle         | Email                  | Mot de passe |
|--------------|------------------------|--------------|
| Admin        | admin@nautilog.fr      | À définir    |
| Propriétaire | owner@nautilog.fr      | À définir    |
| Locataire    | renter@nautilog.fr     | À définir    |
