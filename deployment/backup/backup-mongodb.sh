#!/bin/bash
# MongoDB Backup Script for TaMaD
# Usage: ./backup-mongodb.sh

set -e

# Load environment variables if available
if [ -f "../../.env.production" ]; then
  source ../../.env.production
fi

MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/tamad}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/tamad/mongodb}"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
ARCHIVE_NAME="tamad-db-backup-$DATE.archive"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup..."

# Dump to archive
mongodump --uri="$MONGO_URI" --archive="$BACKUP_DIR/$ARCHIVE_NAME" --gzip

# Encrypt if key is provided
if [ -n "$ENCRYPTION_KEY" ]; then
  echo "Encrypting backup..."
  openssl enc -aes-256-cbc -salt -in "$BACKUP_DIR/$ARCHIVE_NAME" -out "$BACKUP_DIR/$ARCHIVE_NAME.enc" -pass pass:"$ENCRYPTION_KEY"
  rm "$BACKUP_DIR/$ARCHIVE_NAME"
  FINAL_ARCHIVE="$BACKUP_DIR/$ARCHIVE_NAME.enc"
else
  FINAL_ARCHIVE="$BACKUP_DIR/$ARCHIVE_NAME"
fi

echo "Backup completed successfully at $FINAL_ARCHIVE"

# Cleanup old backups (keep last 7 days)
find "$BACKUP_DIR" -type f -name "tamad-db-backup-*.archive*" -mtime +7 -exec rm {} \;
echo "Cleaned up backups older than 7 days."
