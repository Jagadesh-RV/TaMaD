# Production deployment notes

## Required environment variables

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `MONGODB_URI`
- `REDIS_URL`
- `FRONTEND_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

## Launch

```bash
docker compose -f deployment/docker-compose.prod.yml up --build -d
```

## Backup

- MongoDB: use `mongodump` and `mongorestore`
- Redis: use `redis-cli BGSAVE`

## Monitoring

- Collect container logs with `docker compose logs -f`
- Add uptime monitoring and alerting for backend and frontend health endpoints
