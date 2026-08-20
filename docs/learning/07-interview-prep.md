# TaMaD Complete Learning Knowledge Base — Interview Prep

> This document translates the architecture and patterns used in TaMaD into standard software engineering concepts that are frequently asked about in technical interviews.

---

## 41 — Glossary of Terms

- **RBAC (Role-Based Access Control)**: Restricting access based on a person's role (used in TaMaD's Team and Workspace systems).
- **IDOR (Insecure Direct Object Reference)**: A vulnerability where an attacker accesses someone else's data by guessing an ID. TaMaD prevents this using `requireWorkspaceMember` middleware.
- **Cache-Aside Pattern**: The application code checks the cache first, and if missing, queries the DB and populates the cache (used in TaMaD's `cacheMiddleware`).
- **Write-Through Invalidation**: When data is updated in the DB, the cache is immediately deleted/invalidated so the next read fetches fresh data.
- **HttpOnly Cookie**: A cookie that cannot be read by JavaScript (`document.cookie`), completely preventing cross-site scripting (XSS) attacks from stealing the session token.
- **CSRF (Cross-Site Request Forgery)**: An attack forcing a user to execute unwanted actions. TaMaD uses `sameSite: 'lax'` on cookies to mitigate this.
- **Compound Index**: A database index on multiple fields (e.g., `{ userId: 1, read: 1, createdAt: -1 }`). Used to speed up specific complex queries.
- **Pub/Sub (Publish-Subscribe)**: A messaging pattern. In TaMaD, Socket.IO rooms act as the pub/sub mechanism. Redis is also often used as a pub/sub adapter when scaling Socket.IO to multiple servers.
- **Proxy**: A server that sits between the client and backend. In development, Vite acts as a proxy mapping `/api` to `http://localhost:5002`.

---

## 42 — Common Patterns & Anti-Patterns

### Patterns Used Successfully
1. **Schema-as-Middleware**: Using Zod schemas directly inside Express middleware (`validate.ts`) guarantees that controllers only ever receive perfectly formatted, sanitized data.
2. **Fat Models / Skinny Controllers**: Actually, TaMaD uses **Fat Controllers**. While some consider it an anti-pattern, for rapid development, putting business logic in the controller is pragmatic.
3. **Optimistic UI Updates**: The frontend Zustand store updates its state immediately when you create a task, before the backend even confirms it (or right as it confirms it), making the app feel lightning fast.
4. **Token Rotation**: The Axios interceptor silently exchanges an expiring 15-minute token for a new one using the 7-day refresh token.

### Anti-Patterns Found in TaMaD
If an interviewer asks you what you would improve about this project:
1. **Aggressive Cache Flushing**: The cron job in `jobs.ts` flushes the *entire* Redis cache every 5 minutes. This defeats the purpose of caching. It should only invalidate specific stale keys.
2. **Controller-Level Role Checks**: Authorization logic (checking if a user is an 'admin' vs 'member') is hardcoded inside controllers instead of being extracted into reusable middleware. This risks a developer forgetting the check on a new route.
3. **Missing Service Layer**: The controllers do too much (database queries, socket emissions, cache invalidation). A `TaskService.createTask()` would make the code easier to unit test.
4. $regex for Search: Using `$regex` across 7 collections in `searchController.ts` is terrible for performance at scale. It should use MongoDB `$text` indexes or Elasticsearch.

---

## 43 — Interview Questions & Answers

### Q1: "How did you handle authentication in this app?"
**Answer**: "I used a hybrid approach. I used Firebase Client SDK to handle the actual credential verification and social logins, which gives me an ID token. I send that token to my Node backend, verify it cryptographically with the Firebase Admin SDK, and then I issue my own JWTs. I use a short-lived access token and a long-lived refresh token, stored in HttpOnly cookies to prevent XSS attacks. The frontend Axios interceptor handles automatic token refreshing behind the scenes."

### Q2: "How did you implement real-time features?"
**Answer**: "I used Socket.IO. When a user logs in, the frontend establishes a WebSocket connection and joins a specific Socket.IO 'room' based on their Workspace ID. When any user mutates data via the REST API, the Express controller saves to MongoDB and then emits an event (like `task_created`) specifically to that Workspace's room. The frontend listens for this event and updates the Zustand global state store, which causes React to instantly re-render the UI."

### Q3: "How do you handle file uploads?"
**Answer**: "I avoided sending files through the Node.js backend to save bandwidth and prevent blocking the event loop. Instead, the frontend asks the backend for a signed upload URL for Firebase Storage. The frontend uploads the file directly to Google's servers. Once finished, the frontend pings the backend with the file metadata (size, name), and the backend saves that record in MongoDB."

### Q4: "How is your database structured?"
**Answer**: "It's a NoSQL database using MongoDB and Mongoose. The core isolation boundary is the Workspace. Almost every entity (Tasks, Projects, Notes) has a `workspaceId` index. I used a mix of references (like linking a Task to a Project) and embedded documents (like embedding active Sessions inside the User document). To ensure fast queries, I implemented compound indexes, like indexing `userId`, `read`, and `createdAt` together for the Notifications collection."

### Q5: "How did you optimize performance?"
**Answer**: "Three main ways: 
1. **Frontend**: I used React `lazy()` code splitting for all routes so the initial bundle size is tiny. I also use Zustand instead of Redux to avoid unnecessary re-renders. 
2. **Backend**: I implemented a Redis caching layer using the cache-aside pattern with write-through invalidation via a custom Express middleware. 
3. **Database**: I ensured all frequently queried fields have appropriate MongoDB indexes."
