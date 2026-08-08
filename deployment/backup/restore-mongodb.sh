#!/bin/bash
# MongoDB Restore Script for TaMaD
# Usage: ./restore-mongodb.sh <path-to-archive>

set -e

# Load environment variables if available
if [ -f "../../.env.production" ]; then
  source ../../.env.production
fi

if [ -z "$1" ]; then
  echo "Usage: ./restore-mongodb.sh <path-to-archive>"
  exit 1
fi

ARCHIVE_PATH="$1"
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/tamad}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"
TMP_DECRYPT_FILE="/tmp/tamad-restore-$(date +%s).archive"

echo "Starting MongoDB restore from $ARCHIVE_PATH..."

# Decrypt if the file is encrypted (.enc)
if [[ "$ARCHIVE_PATH" == *.enc ]]; then
  if [ -z "$ENCRYPTION_KEY" ]; then
    echo "Error: BACKUP_ENCRYPTION_KEY is required to restore an encrypted backup."
    exit 1
  fi
  echo "Decrypting backup..."
  openssl enc -aes-256-cbc -d -in "$ARCHIVE_PATH" -out "$TMP_DECRYPT_FILE" -pass pass:"$ENCRYPTION_KEY"
  RESTORE_FILE="$TMP_DECRYPT_FILE"
else
  RESTORE_FILE="$ARCHIVE_PATH"
fi

echo "Restoring to database..."
mongorestore --uri="$MONGO_URI" --archive="$RESTORE_FILE" --gzip --drop

# Cleanup temp decrypted file
if [[ "$ARCHIVE_PATH" == *.enc ]]; then
  rm -f "$TMP_DECRYPT_FILE"
fi

echo "Restore completed successfully."
