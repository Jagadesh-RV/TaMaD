# TaMaD Production Deployment Guide

## Infrastructure Requirements
- **Compute**: Minimum 2vCPU, 4GB RAM (e.g., AWS EC2 t3.medium, DigitalOcean Standard Droplet).
- **Database**: MongoDB v7.x (Self-hosted via Docker or Managed like MongoDB Atlas).
- **Cache**: Redis 7.x (Self-hosted or Managed like AWS ElastiCache).
- **Storage/Auth**: Firebase Project.
- **Realtime**: LiveKit Cloud or self-hosted LiveKit instance.

## Secret Management
**NEVER** commit secrets to version control. 

Secrets should be injected at runtime using one of the following methods:
1. **GitHub Actions Secrets**: Injected into `.env.production` during the CD pipeline.
2. **Cloud Secret Manager**: AWS Secrets Manager, Google Cloud Secret Manager, or HashiCorp Vault.
3. **Environment File**: A secure `.env.production` file strictly controlled on the host server.

### Required Environment Variables
Review `.env.example` for the complete list of variables. The most critical secrets are:
- `JWT_SECRET` and `JWT_REFRESH_SECRET`
- `FIREBASE_PRIVATE_KEY` (Handle newlines properly)
- `MONGODB_URI` (if external)
- `LIVEKIT_API_SECRET`
- `GEMINI_API_KEY`

## Deployment Steps (Docker Compose)
1. **Provision Host**: Ensure Docker and Docker Compose are installed.
2. **Clone Repository**: 
   ```bash
   git clone https://github.com/your-org/tamad.git
   cd tamad
   ```
3. **Inject Secrets**: Create `.env` from your secure vault.
4. **Build and Deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
5. **Verify Health**:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   curl http://localhost:5000/api/health
   ```

## Rollback Procedure
If a deployment fails or introduces critical bugs:
1. Identify the previous stable commit tag.
2. Check out the stable tag: `git checkout v1.0.0`
3. Rebuild and restart containers:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
4. If database migrations were involved, restore the database using the backup script before starting the application.
