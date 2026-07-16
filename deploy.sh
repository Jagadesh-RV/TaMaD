#!/usr/bin/env bash
set -euo pipefail

docker compose -f deployment/docker-compose.prod.yml up --build -d
