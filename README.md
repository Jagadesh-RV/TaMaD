# TaMaD - Task Management Application

TaMaD is a full-stack team workspace management application for organizing tasks, projects, notes, whiteboards, habits, goals, and more. Built with React and Express, it provides real-time collaboration via Socket.IO, Firebase Authentication, and a responsive interface with multiple views (Kanban, List, Calendar).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [API Endpoints](#api-endpoints)
- [Real-time Events](#real-time-events)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## Project Overview

TaMaD is a productivity and workspace management app with the following features:

- **Tasks**: Kanban board, List view, and Calendar view with drag-and-drop reordering, bulk operations, and task comments.
- **Projects**: Organize tasks into projects with status tracking and progress visualization.
- **Notes**: Rich text note-taking with tagging.
- **Whiteboards**: Collaborative drawing canvases for brainstorming.
- **Analytics & Reports**: Data visualizations and insights using Recharts.
- **Habits**: Daily habit tracking with toggle-based completion logging.
- **Goals**: Goal setting and progress tracking with milestones.
- **Calendar**: Calendar view for tasks and deadlines.
- **Focus Mode**: Distraction-free environment for deep work.
- **Notifications**: Real-time and persistent notification system.
- **Real-time Collaboration**: Socket.IO-powered presence indicators and typing indicators.
- **AI Integration**: Natural language task parsing and workspace chat via Google Gemini.
- **Contact Form**: Public contact endpoint with email delivery.

---

## Tech Stack

### Frontend

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool and dev server |
| Zustand | State management |
| React Router | Client-side routing |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations and transitions |
| Recharts | Charts and data visualization |
| Socket.IO Client | Real-time communication |
| Firebase SDK | Authentication |
| DnD Kit | Drag-and-drop for Kanban boards |
| React Hook Form + Zod | Form handling and validation |
| Axios | HTTP client |
| date-fns | Date utilities |
| Lucide React | Icons |
| Vitest + Testing Library | Unit and integration tests |

### Backend

| Library | Purpose |
|---------|---------|
| Express | HTTP framework |
| TypeScript | Type safety |
| Mongoose | MongoDB ODM |
| Socket.IO | Real-time WebSocket server |
| Firebase Admin SDK | Server-side Firebase Auth verification |
| jsonwebtoken (JWT) | Session tokens |
| Redis (ioredis) | Caching and session storage |
| Winston | Structured logging |
| Zod | Request validation schemas |
| express-rate-limit | API rate limiting |
| Helmet | Security headers |
| Morgan | HTTP request logging |
| bcryptjs | Password hashing |
| nodemailer | Email sending |
| @google/genai | Google Gemini AI integration |

### Authentication

- Firebase Authentication (Email/Password, Google Sign-In, Phone)
- JWT access and refresh tokens issued by the backend
- Firebase Admin SDK for server-side token verification

### Database

- MongoDB with Mongoose ODM

### Real-time

- Socket.IO for bidirectional WebSocket communication

### Deployment

- Firebase Hosting for frontend static assets
- Firebase Firestore rules and Storage rules

---

## Architecture

### State Management

The frontend uses **Zustand** for state management. Each feature domain has its own store:

- `authStore.ts` - Authentication state, user profile, workspace
- `taskStore.ts` - Task CRUD, filtering, view state
- `projectStore.ts` - Project management
- `noteStore.ts` - Notes
- `whiteboardStore.ts` - Whiteboard canvases
- `goalStore.ts` - Goals and milestones
- `habitStore.ts` - Habit tracking
- `notifStore.ts` - Notifications

Stores are lightweight, use Zustand middleware (persist, devtools where applicable), and interact with the backend via Axios-based API calls defined in `utils/api.ts`.

### API Pattern

- Express routers are organized by domain (`taskRoutes.ts`, `projectRoutes.ts`, etc.)
- Controllers contain business logic and are separated from route definitions
- Request validation is handled by Zod schemas in `middleware/schemas.ts` via a `validate` middleware
- Authentication is enforced by a `protect` middleware that verifies JWT tokens
- Rate limiting is applied globally (`/api` prefix) and per-route for sensitive operations

### Real-time Architecture

- Socket.IO server is initialized in `backend/src/sockets/socketManager.ts`
- Clients authenticate via JWT token passed in `socket.handshake.auth.token`
- Users join workspace-scoped rooms (`workspace_{id}`) for targeted broadcasts
- Presence tracking is maintained server-side in memory
- Frontend connects via `useSocket` hook and receives events through `RealtimeProvider`

---

## Prerequisites

- **Node.js** 20 or later
- **pnpm** (package manager)
- **MongoDB** (local instance or MongoDB Atlas cluster)
- **Redis** (optional, for caching and session storage)
- **Firebase Project** with Authentication enabled

---

## Local Development Setup

### Clone and Install

```bash
# Clone the repository
git clone <repo-url>
cd TaMaD

# Install all workspace dependencies
pnpm install
```

### Backend Setup

```bash
# Create backend environment file
cp .env.example backend/.env

# Edit backend/.env with your values
# (see Environment Variables section below)

# The backend dependencies are already installed via pnpm workspace
```

### Frontend Setup

```bash
# Create frontend environment file
cp frontend/.env.example frontend/.env.local

# Edit frontend/.env.local with your Firebase config values
# (see Environment Variables section below)
```

### Start Development Servers

```bash
# Start both frontend and backend concurrently
pnpm dev

# Or start them individually:

# Terminal 1 - Backend (port 5000)
pnpm dev:backend

# Terminal 2 - Frontend (port 5173)
cd frontend && pnpm dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend.

---

## Environment Variables

### Root `.env.example`

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/tamad` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for signing JWT access tokens | (required) |
| `JWT_REFRESH_SECRET` | Secret for signing JWT refresh tokens | (required) |
| `FIREBASE_PROJECT_ID` | Firebase project ID | (required) |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | (required) |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key (escaped) | (required) |
| `CORS_ORIGIN` | Comma-separated allowed CORS origins | `http://localhost:5173,http://localhost:3000` |
| `FRONTEND_URL` | Frontend URL for Socket.IO CORS | `http://localhost:5173` |

### Backend `.env.example`

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `4000` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `DB_PATH` | Database file path (SQLite fallback) | `./data/tamad.db` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost` |
| `CORS_ORIGIN` | Comma-separated CORS origins | `http://localhost` |
| `RATE_LIMIT_MAX` | Max requests per rate limit window | `500` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | (required) |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | (required) |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | (required) |

### Frontend `.env.example`

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase web app API key | (required) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `tamad-ce3c7.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `tamad-ce3c7` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `tamad-ce3c7.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | (required) |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID | (required) |
| `VITE_API_URL` | Backend API URL (proxied in dev) | (optional, defaults to same origin) |

---

## Firebase Setup

### 1. Create a Firebase Project

- Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
- Note the project ID (used as `FIREBASE_PROJECT_ID`).

### 2. Enable Authentication

- Navigate to **Authentication > Sign-in method**.
- Enable the following providers:
  - **Email/Password**
  - **Google** (configure OAuth consent screen)
  - **Phone** (enable for SMS verification)

### 3. Create Firestore Database

- Navigate to **Firestore Database** and create a database.
- Start in **test mode** for development; apply `firestore.rules` for production.

### 4. Set Up Storage

- Navigate to **Storage** and initialize it.
- Apply `storage.rules` for access control.

### 5. Get Web App Config (for Frontend `.env.local`)

- Navigate to **Project Settings > General > Your apps > Web app**.
- Register a web app if you haven't already.
- Copy the `firebaseConfig` values into `frontend/.env.local`:
  - `apiKey` -> `VITE_FIREBASE_API_KEY`
  - `authDomain` -> `VITE_FIREBASE_AUTH_DOMAIN`
  - `projectId` -> `VITE_FIREBASE_PROJECT_ID`
  - `storageBucket` -> `VITE_FIREBASE_STORAGE_BUCKET`
  - `messagingSenderId` -> `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `appId` -> `VITE_FIREBASE_APP_ID`

### 6. Get Service Account Key (for Backend)

- Navigate to **Project Settings > Service accounts**.
- Click **Generate new private key** and download the JSON file.
- Extract the following values into your backend `.env`:
  - `project_id` -> `FIREBASE_PROJECT_ID`
  - `client_email` -> `FIREBASE_CLIENT_EMAIL`
  - `private_key` -> `FIREBASE_PRIVATE_KEY`

---

## API Endpoints

All API routes are prefixed with `/api`. Most endpoints require authentication via a Bearer token in the `Authorization` header.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/firebase/session` | No | Create session from Firebase ID token |
| POST | `/api/auth/refresh` | No | Refresh access token |
| POST | `/api/auth/logout` | Yes | Logout current session |
| POST | `/api/auth/logout-all` | Yes | Logout all sessions |
| GET | `/api/auth/me` | Yes | Get current user profile |
| GET | `/api/auth/workspace` | Yes | Get current workspace |
| POST | `/api/auth/sync-verification` | Yes | Sync email verification status |
| PUT | `/api/auth/profile` | Yes | Update user profile |
| GET | `/api/auth/sessions` | Yes | List active sessions |
| POST | `/api/auth/change-password` | Yes | Change password (strict rate limit) |
| POST | `/api/auth/delete-account` | Yes | Delete account (strict rate limit) |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks` | Yes | List tasks (with filtering) |
| POST | `/api/tasks` | Yes | Create a new task |
| PUT | `/api/tasks/:id` | Yes | Update a task |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |
| PUT | `/api/tasks/:id/reorder` | Yes | Reorder a task (drag-and-drop) |
| PUT | `/api/tasks/bulk` | Yes | Bulk update multiple tasks |
| DELETE | `/api/tasks/bulk` | Yes | Bulk delete multiple tasks |
| GET | `/api/tasks/:taskId/comments` | Yes | Get comments for a task |
| POST | `/api/tasks/:taskId/comments` | Yes | Add a comment to a task |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | Yes | List projects |
| POST | `/api/projects` | Yes | Create a project |
| PUT | `/api/projects/:id` | Yes | Update a project |
| DELETE | `/api/projects/:id` | Yes | Delete a project |

### Notes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notes` | Yes | List notes |
| POST | `/api/notes` | Yes | Create a note |
| PUT | `/api/notes/:id` | Yes | Update a note |
| DELETE | `/api/notes/:id` | Yes | Delete a note |

### Whiteboards

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/whiteboards` | Yes | List whiteboards |
| POST | `/api/whiteboards` | Yes | Create a whiteboard |
| GET | `/api/whiteboards/:id` | Yes | Get a whiteboard by ID |
| PUT | `/api/whiteboards/:id` | Yes | Update a whiteboard |
| DELETE | `/api/whiteboards/:id` | Yes | Delete a whiteboard |

### Goals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/goals` | Yes | List goals |
| POST | `/api/goals` | Yes | Create a goal |
| PUT | `/api/goals/:id` | Yes | Update a goal |
| DELETE | `/api/goals/:id` | Yes | Delete a goal |

### Habits

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/habits` | Yes | List habits |
| POST | `/api/habits` | Yes | Create a habit |
| PUT | `/api/habits/:id/toggle` | Yes | Toggle habit completion for a date |
| DELETE | `/api/habits/:id` | Yes | Delete a habit |

### Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/documents` | Yes | List documents |
| POST | `/api/documents` | Yes | Create a document |
| GET | `/api/documents/:id` | Yes | Get a document by ID |
| PUT | `/api/documents/:id` | Yes | Update a document |
| DELETE | `/api/documents/:id` | Yes | Delete a document |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| DELETE | `/api/comments/:id` | Yes | Delete a comment |

### AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/parse-task` | Yes | Parse natural language into a task |
| POST | `/api/ai/chat` | Yes | Chat with workspace context |

### Contact

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | No | Submit a contact form (rate limited to 5 per 15 min) |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/ready` | No | Readiness check (verifies DB connection) |

---

## Real-time Events

Socket.IO is used for real-time communication. Clients authenticate by passing a JWT token in `socket.handshake.auth.token`.

### Client Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `join_workspace` | `workspaceId: string` | Join a workspace room for presence and updates |
| `leave_workspace` | `workspaceId: string` | Leave a workspace room |
| `typing_start` | `{ workspaceId: string, taskId: string }` | Notify workspace that user started typing on a task |
| `typing_end` | `{ workspaceId: string, taskId: string }` | Notify workspace that user stopped typing |

### Server Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `task_created` | Task object | Broadcast when a task is created |
| `task_updated` | Task object | Broadcast when a task is updated |
| `task_deleted` | `{ taskId: string }` | Broadcast when a task is deleted |
| `tasks_bulk_updated` | Task[] | Broadcast when tasks are bulk updated |
| `tasks_bulk_deleted` | `{ taskIds: string[] }` | Broadcast when tasks are bulk deleted |
| `task_assigned` | Assignment data | Broadcast when a task is assigned to a user |
| `presence_update` | `{ workspaceId: string, users: string[] }` | Updated list of online users in a workspace |
| `user_typing` | `{ userId: string, taskId: string }` | A user started typing on a task |
| `user_stopped_typing` | `{ userId: string, taskId: string }` | A user stopped typing |

---

## Testing

The project uses **Vitest** with **Testing Library** for frontend tests and **supertest** for backend tests.

```bash
# Run all frontend tests
cd frontend && pnpm test

# Run all backend tests
cd backend && pnpm test

# Watch mode (frontend)
cd frontend && pnpm test:watch

# Watch mode (backend)
cd backend && pnpm test:watch
```

Test files are located in:
- Frontend: `frontend/src/test/` and `frontend/src/store/__tests__/`
- Backend: `backend/src/__tests__/`

---

## Deployment

### Firebase Hosting

```bash
# Build the frontend
pnpm build

# Deploy hosting
firebase deploy --only hosting
```

The `firebase.json` config serves `frontend/dist` as the public directory with SPA rewrites and cache headers for static assets.

### Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Storage Rules

```bash
firebase deploy --only storage
```

### Full Deployment

```bash
# Deploy everything (hosting, firestore rules, storage rules)
pnpm deploy
```

### Docker

A `docker-compose.yml` is included for containerized deployment:

```bash
docker-compose up -d --build
```

---

## Project Structure

```
TaMaD/
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layout/          # Layout components (sidebar, header)
│   │   │   ├── notes/           # Note-related components
│   │   │   ├── planner/         # Planner components
│   │   │   ├── projects/        # Project components
│   │   │   ├── tasks/           # Task board and card components
│   │   │   ├── todoist/         # Todoist-style components
│   │   │   ├── ui/              # Shared UI primitives
│   │   │   └── whiteboards/     # Whiteboard components
│   │   ├── pages/               # Route page components
│   │   │   ├── auth/            # Login, register pages
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── FocusPage.tsx
│   │   │   ├── NotesPage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── PlannerPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   └── WhiteboardPage.tsx
│   │   ├── store/               # Zustand state stores
│   │   │   ├── authStore.ts
│   │   │   ├── taskStore.ts
│   │   │   ├── projectStore.ts
│   │   │   ├── noteStore.ts
│   │   │   ├── whiteboardStore.ts
│   │   │   ├── goalStore.ts
│   │   │   ├── habitStore.ts
│   │   │   └── notifStore.ts
│   │   ├── services/            # Firebase client initialization
│   │   │   └── firebase.ts
│   │   ├── providers/           # Context providers
│   │   │   └── RealtimeProvider.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useSocket.ts
│   │   │   └── useTheme.ts
│   │   ├── styles/              # Global CSS
│   │   │   ├── animations.css
│   │   │   ├── global.css
│   │   │   └── theme.css
│   │   ├── utils/               # Utilities and API client
│   │   │   ├── api.ts
│   │   │   └── themes.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/         # Route handler logic
│   │   │   ├── authController.ts
│   │   │   ├── taskController.ts
│   │   │   ├── projectController.ts
│   │   │   ├── noteController.ts
│   │   │   ├── whiteboardController.ts
│   │   │   ├── goalController.ts
│   │   │   ├── habitController.ts
│   │   │   ├── commentController.ts
│   │   │   ├── documentController.ts
│   │   │   ├── aiController.ts
│   │   │   └── health.controller.ts
│   │   ├── models/              # Mongoose data models
│   │   │   ├── Task.ts
│   │   │   ├── Project.ts
│   │   │   ├── User.ts
│   │   │   ├── Workspace.ts
│   │   │   ├── Note.ts
│   │   │   ├── Whiteboard.ts
│   │   │   ├── Goal.ts
│   │   │   ├── Milestone.ts
│   │   │   ├── Habit.ts
│   │   │   ├── Comment.ts
│   │   │   ├── Document.ts
│   │   │   ├── Tag.ts
│   │   │   ├── Category.ts
│   │   │   ├── Portfolio.ts
│   │   │   └── AuditLog.ts
│   │   ├── routes/              # Express route definitions
│   │   │   ├── authRoutes.ts
│   │   │   ├── taskRoutes.ts
│   │   │   ├── projectRoutes.ts
│   │   │   ├── noteRoutes.ts
│   │   │   ├── whiteboardRoutes.ts
│   │   │   ├── goalRoutes.ts
│   │   │   ├── habitRoutes.ts
│   │   │   ├── commentRoutes.ts
│   │   │   ├── documentRoutes.ts
│   │   │   ├── aiRoutes.ts
│   │   │   ├── contactRoutes.ts
│   │   │   └── healthRoutes.ts
│   │   ├── middleware/           # Auth, validation, rate limiting
│   │   │   ├── auth.ts
│   │   │   ├── auth.middleware.ts
│   │   │   ├── schemas.ts
│   │   │   └── validate.ts
│   │   ├── config/              # Infrastructure configuration
│   │   │   ├── db.ts
│   │   │   ├── firebase.ts
│   │   │   └── redis.ts
│   │   ├── sockets/             # Socket.IO server
│   │   │   └── socketManager.ts
│   │   ├── utils/               # Utilities
│   │   │   ├── logger.ts        # Winston logger
│   │   │   ├── auditLogger.ts   # Audit trail logging
│   │   │   ├── jwt.ts           # JWT helpers
│   │   │   ├── mailer.ts        # Email sending
│   │   │   ├── ai.ts            # Google Gemini client
│   │   │   ├── seed.ts          # Database seeding
│   │   │   └── healthcheck.ts
│   │   ├── __tests__/           # Backend tests
│   │   └── index.ts             # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── firebase.json                # Firebase project config
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore composite indexes
├── storage.rules                # Firebase Storage security rules
├── docker-compose.yml           # Docker configuration
├── pnpm-workspace.yaml          # pnpm workspace config
├── package.json                 # Root package with dev scripts
└── README.md
```

---

## License

MIT License.
