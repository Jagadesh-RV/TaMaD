# TaMaD Complete Learning Knowledge Base — Rebuild Guide

> If you ever need to build a complex SaaS application from scratch (without relying on AI code generation for everything), this is the sequence you should follow.

---

## 40 — How to Rebuild TaMaD from Scratch (The Engineering Sequence)

Building a full-stack monorepo is overwhelming if you start in the wrong place. If you start with the UI, you'll constantly rewrite it when your API data shapes change. If you start with real-time sockets, you won't have authentication to secure them.

Here is the exact, logical sequence to rebuild this architecture:

### Phase 1: Foundation & Data Layer
1. **Initialize Monorepo**: Setup pnpm workspaces. Create `frontend/` (Vite) and `backend/` (Express) folders.
2. **Setup Types**: Create a shared types package or align TypeScript configurations.
3. **Database Connection**: Setup MongoDB and Mongoose in the backend. Write the connect script.
4. **Core Models**: Design the `User` and `Workspace` Mongoose models first. Everything depends on them.

### Phase 2: Authentication (The Hardest Part)
1. **Firebase Setup**: Configure Firebase project, get client credentials for frontend, admin credentials for backend.
2. **Frontend Auth UI**: Build Login/Register forms. Connect to Firebase SDK.
3. **Backend Auth Controller**: Build the `POST /api/v1/auth/firebase/session` endpoint. Verify the token, issue the JWTs.
4. **Auth Middleware**: Write the `protect` middleware that reads the HttpOnly cookie.
5. **Axios Interceptor**: Write the frontend API client that catches 401s and automatically refreshes tokens.
   *Do not proceed to Phase 3 until you can log in, stay logged in, and refresh a token automatically.*

### Phase 3: Core CRUD & Workspaces
1. **Workspace API**: Build endpoints to create, list, and switch workspaces.
2. **Authorization Middleware**: Write `requireWorkspaceMember` to secure future routes.
3. **Task Models & Controllers**: Build the CRUD endpoints for Tasks.
4. **Frontend Stores**: Setup Zustand to fetch and store Workspaces and Tasks.
5. **Frontend UI**: Build the basic lists and tables to display the data.

### Phase 4: Real-time Infrastructure
1. **Socket.IO Setup**: Add Socket.IO to the Express server.
2. **Socket Authentication**: Write the logic to parse the JWT cookie in the socket handshake.
3. **Room Management**: When a user switches workspaces on the frontend, emit `join_workspace`.
4. **Broadcast Hooks**: Update your Task controllers to `emit('task_created')` after saving to MongoDB.
5. **Frontend Listeners**: Add listeners in the frontend to intercept socket events and update Zustand stores.

### Phase 5: Optimization & Cache
1. **Redis Setup**: Connect `ioredis` to the backend.
2. **Cache Wrapper**: Build the `cache.ts` utility (get, set, invalidatePattern).
3. **Cache Middleware**: Wrap your GET endpoints in the `cacheMiddleware`.
4. **Cache Invalidation**: Add `cache.del()` calls to your POST/PUT/DELETE controllers.

### Phase 6: Files & Auxiliaries
1. **Firebase Storage**: Setup bucket rules.
2. **Signed URLs**: Build backend endpoints to generate upload/download URLs.
3. **Upload Hook**: Write the frontend hook to push directly to Firebase.
4. **Notifications/Analytics**: Build the auxiliary features that observe the core data.

### Phase 7: Deployment
1. **Dockerize**: Write Dockerfiles for frontend and backend.
2. **Compose**: Write `docker-compose.yml` tying Mongo, Redis, Frontend, and Backend together.
3. **CI/CD**: Setup GitHub actions to run tests and build images automatically.
