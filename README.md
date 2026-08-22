# NautiLog

Carnet de navigation électronique intelligent, gestion de flotte et carte interactive de disponibilité.

**Application en ligne :** https://nautilog.fr

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

Comptes réels créés en production sur https://nautilog.fr :

| Rôle         | Email               | Mot de passe |
|--------------|---------------------|--------------|
| Admin        | mel@mail.com        | canacmell75  |
| Propriétaire | joel@otmail.com     | jojodupont   |
| Propriétaire | alice@yahoo.fr      | alicedupont  |
| Locataire    | jean@gmail.com      | jeangabin    |
| Locataire    | teddy@orange.fr     | teddyrinner  |
