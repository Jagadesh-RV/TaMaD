# TaMaD Disaster Recovery Plan

## Overview
This document outlines the Disaster Recovery (DR) procedures for the TaMaD application. The goal is to minimize Recovery Point Objective (RPO) and Recovery Time Objective (RTO) in the event of an infrastructure failure.

## Recovery Objectives
- **RPO (Recovery Point Objective)**: 24 hours (based on daily backups).
- **RTO (Recovery Time Objective)**: 1 hour (time to spin up new infrastructure and restore data).

## Disaster Scenarios

### 1. MongoDB Database Failure / Corruption
**Symptoms**: Application cannot read/write data, API returns 500s related to DB timeouts.
**Recovery Procedure**:
1. Stop backend services to prevent partial writes.
2. Provision a new MongoDB instance or clean the existing one.
3. Locate the latest backup archive in `/var/backups/tamad/mongodb` (or cloud storage).
4. Run the restore script: `./deployment/backup/restore-mongodb.sh <path-to-archive>`
5. Restart backend services.
6. Verify data integrity via application logs and sanity checks.

### 2. Redis Cache Failure
**Symptoms**: Real-time features (Socket.IO) are disconnected or failing. Performance degrades.
**Recovery Procedure**:
1. TaMaD's backend is designed to degrade gracefully if Redis is unavailable.
2. Restart the Redis container/service.
3. If data loss occurred in Redis, it is acceptable as Redis only stores ephemeral data (sessions, cache, pub/sub). Users may need to log in again.

### 3. Firebase Services (Auth/Storage) Outage
**Symptoms**: Users cannot log in or upload/download files.
**Recovery Procedure**:
1. This is a third-party dependency failure. 
2. Check the [Firebase Status Dashboard](https://status.firebase.google.com/).
3. Notify users of the outage. No internal data restore is needed; wait for service restoration.

### 4. Complete Server Loss
**Symptoms**: The entire host node goes down.
**Recovery Procedure**:
1. Provision a new server instance.
2. Pull the latest repository: `git clone <repo>`
3. Retrieve production secrets from the secure vault (e.g., AWS Secrets Manager, GitHub Secrets) and populate `.env.production`.
4. Restore MongoDB from offsite backup.
5. Deploy containers: `docker-compose -f docker-compose.prod.yml up -d`
6. Update DNS to point to the new server IP.
