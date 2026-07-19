#!/usr/bin/env bash
# Redémarre les services Docker demandés puis nginx en dernier,
# pour éviter le 502 lié au cache DNS Docker de nginx.
# Usage : ./scripts/restart-clean.sh [service...]
# Exemple : ./scripts/restart-clean.sh client api

set -euo pipefail

cd "$(dirname "$0")/.."

if [ "$#" -gt 0 ]; then
  docker compose restart "$@"
fi

docker compose restart nginx
