# TaMaD Backup Strategy

## Overview
To ensure data integrity and business continuity, TaMaD implements an automated backup strategy for the primary MongoDB database.

## Backup Frequency
- **Schedule**: Daily at 02:00 AM UTC.
- **Trigger**: Automated via cron job or CI/CD pipeline scheduled task.

## Retention Policy
- **Local Retention**: The last 7 days of backups are kept on the server disk.
- **Remote Retention**: It is highly recommended to sync the backup directory (`/var/backups/tamad/mongodb`) to an offsite cloud storage (e.g., AWS S3, Google Cloud Storage) with a 30-day retention lifecycle policy.

## Encryption
- Backups containing sensitive PII and workspace data MUST be encrypted at rest.
- The `backup-mongodb.sh` script supports AES-256-CBC encryption using the `BACKUP_ENCRYPTION_KEY` environment variable.

## Execution
To run a manual backup:
```bash
export BACKUP_ENCRYPTION_KEY="your-secure-key"
./deployment/backup/backup-mongodb.sh
```

## Validation
Backups must be validated monthly.
1. Download a random backup from the previous week.
2. Restore it to a local staging environment using `restore-mongodb.sh`.
3. Run the application E2E test suite against the staging database to verify referential integrity.
