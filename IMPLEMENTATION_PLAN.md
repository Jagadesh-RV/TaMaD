# TaMaD Intelligent Workspace — Implementation Plan

Branch: `feature/tamad-intelligent-workspace`

## 1. Complete Project Audit (findings)

### 1.1 Architecture
- Monorepo (pnpm workspaces): `frontend/` (React 18 + Vite 7 + Tailwind 4 + Zustand), `backend/` (Express 4 + Mongoose 8 + Socket.IO 4).
- Data: MongoDB (primary), Redis (cache/pub-sub), Firebase Auth (identity), Firebase Storage (file uploads). Firestore is **not used** for runtime data (rules only).
- Real-time: Socket.IO main namespace (`/`) with JWT auth + `/socket/tamad-meet` namespace (WebRTC signaling for LiveKit).

### 1.2 Security findings
| Sev | Finding | Location |
|-----|---------|----------|
| **High** | Hardcoded LiveKit API key + secret committed & pushed | `backend/src/services/meetingService.ts:5-7` |
| **High** | MongoDB URI + Redis URL logged verbatim at startup | `backend/src/config/db.ts:16`, `backend/src/config/redis.ts:17` |
| **High** | `/socket/tamad-meet` namespace has no auth; any client can join any room / emit signaling | `backend/src/gateways/tamadMeetSocketGateway.ts` |
| **High** | Storage rules: any authenticated user can read/write/delete any workspace file | `storage.rules` |
| **High** | Firestore rules: `tasks/projects/notes/...` allow read+write to any authenticated user | `firestore.rules` |
| **Med** | `.firebase/` hosting cache tracked in git | repo root |
| **Med** | `docker-compose.dev.yml` references missing `development` Docker target (build fails) | `docker-compose.dev.yml`, `backend/Dockerfile`, `frontend/Dockerfile` |
| **Med** | `docker-compose.prod.yml` default `change-me` Mongo password, exposes DB/Redis to host, drops Firebase env | `deployment/docker-compose.prod.yml` |
| **Med** | CI uses `npm` + `cache-dependency-path` pointing at non-existent lockfiles; no e2e job | `.github/workflows/ci.yml` |
| **Low** | Playwright `webServer` disabled — e2e requires manually started servers | `playwright.config.ts` |
| **Low** | `react-router-dom@6.30.4` — two moderate advisories: open redirect→XSS (patched only in v7.x) and arbitrary constructor injection via `deserializeErrors` (patched `>=7.18.0`). 6.x line is EOL at 6.30.4 | `frontend/package.json` |

### 1.3 Test/quality baseline
- Backend: Vitest + Supertest; Frontend: Vitest + Testing Library.
- Playwright e2e suite exists (36+ specs) but is not wired into CI or `webServer`.

## 2. Roadmap (commit-sized units)

### Phase A — Production hardening (security + infra)
1. Remove hardcoded LiveKit credentials → env-driven, fail-fast in production.
2. Untrack `.firebase/` cache; extend `.gitignore`.
3. Redact connection URIs in startup logs.
4. Add JWT auth to `/socket/tamad-meet`; authorize room join against authenticated user.
5. Harden `storage.rules` (metadata-bound writes) + `firestore.rules` (workspace scoping).
6. Add `development` Docker targets; repair `docker-compose.dev.yml`.
7. Harden `docker-compose.prod.yml` (no default secrets, no exposed DB ports, pass Firebase env).
8. Rewrite CI to pnpm; add Playwright e2e job.
9. Enable Playwright `webServer` config.
10. Upgrade `react-router-dom` to `^7.18.0` (6.x EOL; declarative-mode APIs are drop-in compatible).
11. Lazy-load heavy chunks (LiveKit, Recharts, auth screens).

### Phase B — Data & real-time reliability
12. MongoDB indexes for hot workspace/team/scoped queries.
13. Real-time: connection states, reconnection, event ack + dedupe.

### Phase C — Intelligent workspace
14. AI Command Center: workspace-context prompt, AI actions (create task, summarize, generate plan).
15. Automation Engine: trigger/action model, internal provider + n8n provider, webhook support.
16. Automation UI: visual builder + execution history.
17. Unit tests for automation engine + AI actions.

### Phase D — Final validation
18. Typecheck, unit tests, production build, Playwright smoke, security scan, performance check, product review.

## 3. Validation strategy
- Every commit is a logical unit; each is validated with `pnpm typecheck` (+ targeted tests/build where affected) **before** committing.
- Final pass: full `pnpm test`, `pnpm build:all`, Playwright run (via Docker Mongo/Redis), `pnpm audit`, `git log` review.
