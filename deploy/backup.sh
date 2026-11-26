#!/usr/bin/env bash
# Backup diário do Observatório: banco (pg_dump) + fotos.
# Instalação e agendamento: docs/DEPLOY.md, passo 10.
#
# Uso: deploy/backup.sh            (guarda em /srv/backups/observatorio)
#      BACKUP_DIR=/outro/lugar deploy/backup.sh
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/srv/backups/observatorio}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%F_%H%M)"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
cd "$APP_DIR"

# Banco
docker compose exec -T db pg_dump -U observatorio -Fc observatorio > "$BACKUP_DIR/banco-$STAMP.dump"

# Fotos e logos (volume "uploads")
VOLUME="$(docker compose config --format json | python3 -c 'import sys,json; print(json.load(sys.stdin)["name"])')_uploads"
docker run --rm -v "$VOLUME":/u:ro -v "$BACKUP_DIR":/b alpine tar czf "/b/fotos-$STAMP.tgz" -C /u .

chmod 600 "$BACKUP_DIR"/*
# Apaga cópias com mais de KEEP_DAYS dias (os backups têm dados pessoais: não acumular)
find "$BACKUP_DIR" -type f -mtime +"$KEEP_DAYS" -delete

echo "Backup concluído em $BACKUP_DIR ($STAMP)"
