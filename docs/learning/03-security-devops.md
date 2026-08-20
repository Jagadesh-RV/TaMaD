# TaMaD Complete Learning Knowledge Base — Part 3: Security, DevOps & Error Handling

> Continuing from Part 2. This part covers how TaMaD is secured, containerized, tested, and how it handles errors in production.

---

## 27 — Security Deep Dive

Security in TaMaD is handled primarily in `backend/src/utils/security.ts` and applied globally via Express middleware.

### 1. HTTP Security Headers (Helmet)
TaMaD uses `helmet` to set secure HTTP headers, including a strict Content Security Policy (CSP):
```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.firebaseio.com', 'wss:'],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
  },
}
```
**Why this matters**: The `connectSrc` explicitly allows connections to Firebase APIs and WebSockets (`wss:`), which are critical for the app's real-time features. `objectSrc: ["'none'"]` prevents Flash/Java applet injection.

### 2. Input Sanitization (XSS Prevention)
Before any request reaches a controller, `sanitizeInput` scrubs the JSON body:
```typescript
const sanitize = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: ['img'], // Allow only images
      allowedAttributes: { img: ['src', 'alt', 'width', 'height'] }
    }).trim();
  }
  // Recursively sanitize objects and arrays...
}
```
**Why this matters**: Since TaMaD has rich-text notes and comments, XSS is a major risk. This middleware aggressively strips HTML tags from ALL incoming string fields across the entire API, ensuring malicious `<script>` tags never reach the database.

### 3. Tiered Rate Limiting
Three distinct rate limiters prevent abuse:
1. `globalRateLimiter` (100 req / 15 min) — Applied to all `/api` routes.
2. `authRateLimiter` (50 req / 15 min) — Applied to `/api/v1/auth` to prevent brute force.
3. `strictRateLimiter` (10 req / 15 min) — Applied to `/api/v1/contact` to prevent spam.

### 4. Payload Size Limits
In `index.ts`, body parsing is strictly limited to 2MB to prevent Denial of Service (DoS) attacks via massive JSON payloads:
```typescript
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
```

---

## 28 — Docker & Containerization

File: `docker-compose.yml`

TaMaD uses a single-node containerized architecture for deployment, orchestrating 4 services:
1. **backend**: Express.js server on port 5000.
2. **frontend**: Vite React app (served via Nginx in production) on port 80/8080.
3. **mongo**: MongoDB v7.
4. **redis**: Redis v7 Alpine (configured as an LRU cache).

### Key DevOps Patterns Used:
- **Dependency Ordering**: The backend won't start until Mongo and Redis pass their healthchecks:
  ```yaml
  depends_on:
    mongo:
      condition: service_healthy
  ```
- **Redis Eviction Policy**: Redis is explicitly configured as a cache that evicts old data when full:
  ```yaml
  command: ["redis-server", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
  ```
- **Internal Networking**: Services communicate over a custom bridge network (`tamad_network`), so database ports aren't exposed directly to the host machine.

---

## 29 — CI/CD Pipeline

File: `.github/workflows/ci.yml`

The CI pipeline runs on every push to `main` and `develop`. It is broken into four jobs:

### 1. Backend & 2. Frontend Jobs
Both run in parallel to:
- Install dependencies (`pnpm install --frozen-lockfile`)
- Check types (`pnpm typecheck`)
- Lint code (`pnpm lint`)
- Run unit tests (`pnpm test`)

### 3. Build Job
Requires the previous two jobs to pass. Verifies that both the backend and frontend can compile successfully using Vite/tsc.

### 4. E2E (Playwright) Job
This is the most complex job. It spins up real Mongo and Redis services via GitHub Actions `services:` block, builds the app, and runs end-to-end tests.
- **Conditional Execution**: It skips automatically if the required `TEST_USER_EMAIL` secret isn't present in GitHub.
- **Real Services**: Tests against real Firebase (using specific E2E test secrets) instead of an emulator.

---

## 30 — Error Handling Patterns

### Global Error Handler
In `index.ts`, all unhandled errors fall through to the global error middleware:

```typescript
app.use((err, req, res, next) => {
  const requestId = req.headers['x-request-id'];
  
  // Smart mapping of Mongoose errors to HTTP status codes
  const statusCode =
    err.status || err.statusCode ||
    (err.name === 'CastError' ? 400 :          // Invalid MongoDB ID
      err.code === 11000 ? 409 :               // Duplicate key (e.g. email exists)
      err.name === 'ValidationError' ? 400 :   // Mongoose validation failed
      err.name === 'UnauthorizedError' ? 401 : // JWT errors
      500);                                    // Fallback

  // Only log stack traces for 500s
  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, requestId });
  }

  // Hide internal error details from users in production
  res.status(statusCode).json({
    error: statusCode >= 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    requestId,
  });
});
```

### Async Error Handling
The backend uses the `express-async-errors` package (imported at the top of `index.ts`). This monkey-patches Express so you don't have to wrap every controller in a `try/catch` block or manually call `next(err)`. If a Promise rejects in a route handler, it automatically forwards to the global error handler.

---

## 31 — Logging & Observability

### Winston Logger
File: `backend/src/utils/logger.ts`

TaMaD uses `winston` for structured logging.
- **Production**: Logs are formatted as JSON (perfect for ingestion by Datadog, ELK, or CloudWatch).
- **Development**: Logs are colorized and simplified for terminal readability.

### Request Tracing (`x-request-id`)
Every incoming request receives a unique UUID in the `security.ts` middleware:
```typescript
req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
res.setHeader('x-request-id', req.headers['x-request-id']);
```
This ID is injected into error logs and returned in the HTTP response. If a user reports an error, they can provide the `x-request-id` from their network tab, allowing developers to immediately find the exact error in the backend logs.

---

## 32 — Firebase Security Rules

Since the frontend uploads files directly to Firebase Storage and might query Firestore, security rules are strictly defined to prevent unauthorized access.

### Firestore Rules (`firestore.rules`)
Firestore enforces TaMaD's RBAC system natively by performing cross-document lookups:
```javascript
function isWorkspaceMember(workspaceId) {
  return isAuthenticated()
    && exists(/databases/$(database)/documents/workspaces/$(workspaceId))
    && (
      // Is the user the owner?
      get(/databases/$(database)/documents/workspaces/$(workspaceId)).data.ownerId == request.auth.uid
      // Or is the user in the members array?
      || request.auth.uid in get(/databases/$(database)/documents/workspaces/$(workspaceId)).data.members
    );
}
```
**Impact**: Even if a user bypasses the backend, Firestore will reject read/write attempts to documents that belong to workspaces the user isn't a member of.

### Storage Rules (`storage.rules`)
Storage rules enforce file size and type limits:
- **Images/Avatars**: Max 5MB, must match `image/.*`
- **Workspace Files**: Max 50MB
- **Whiteboard Images**: Max 10MB
- **Ownership**: Uploads require a custom metadata `uid` that matches the uploader's Firebase UID, preventing users from overwriting each other's files.

---

## 33 — Performance Considerations

File: `backend/src/utils/performance.ts`

- **Compression**: Gzip compression is enabled via the `compression()` middleware in `index.ts` to minimize payload sizes.
- **Index Assurance**: A utility `ensureIndexes()` exists to dynamically loop through all registered Mongoose models and build indexes on startup. 
- **Query Diagnostics**: Utilities like `getQueryStats()` and `explainQuery()` are available to pull raw execution metrics from the MongoDB engine, allowing developers to debug slow queries directly from the backend.
