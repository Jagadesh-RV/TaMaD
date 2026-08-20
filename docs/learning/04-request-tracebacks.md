# TaMaD Complete Learning Knowledge Base — Part 4: Request Tracebacks

> This part takes everything learned in Parts 1-3 and shows exactly how the code executes, line-by-line, across the entire stack for 5 critical application workflows.

---

## 34 — Traceback: User Login (End-to-End)

When a user logs in via Email/Password, here is the exact sequence of code execution:

1. **User Action (Frontend)**
   - User types credentials in `LoginPage.tsx` and clicks "Sign In".
   - `handleSubmit` is called.

2. **Firebase Client Authentication**
   - Calls `signInWithEmailAndPassword(auth, email, password)` from `frontend/src/services/firebase.ts`.
   - The browser connects to Google's servers. Google verifies the password and returns a Firebase User object.

3. **Get ID Token**
   - Calls `user.getIdToken()` to get a short-lived JWT signed by Google.

4. **Zustand Store Action**
   - Calls `useAuthStore.getState().firebaseLogin(idToken)`.

5. **API Request**
   - The store uses Axios to `POST /api/v1/auth/firebase/session` with `{ idToken }`.

6. **Backend Routing & Middleware**
   - Request hits `index.ts` → `authRoutes.ts`.
   - Middleware `authRateLimiter` ensures the IP isn't brute-forcing.

7. **Backend Controller (`authController.createFirebaseSession`)**
   - `getFirebaseAuth().verifyIdToken(idToken)` cryptographically verifies Google's signature.
   - Extracts the `uid` from the token.
   - Queries MongoDB: `User.findOne({ firebaseUid: uid })`.
   - (If new user: Creates User document and a default 'Personal' Workspace).
   - Generates two new JWTs (Access Token + Refresh Token) using `jsonwebtoken`.
   - Hashes the Refresh Token and pushes it to the `user.sessions` array in MongoDB.
   - Sets two `HttpOnly` cookies via `res.cookie()`.
   - Returns `{ user }` JSON.

8. **Frontend State Update**
   - Axios receives the 200 OK and the browser automatically saves the `HttpOnly` cookies.
   - Zustand `authStore` updates: `set({ user: response.data.user, loading: false })`.

9. **UI Reaction**
   - The React tree re-renders. `ProtectedRoute` sees `user` is no longer null.
   - User is redirected to `/dashboard`.
   - `RealtimeProvider` mounts and establishes the Socket.IO connection.

---

## 35 — Traceback: Create Task (End-to-End)

1. **User Action (Frontend)**
   - User clicks "Create Task" in `TasksPage.tsx` or `QuickCreate.tsx`.
   - Form submitted with `{ title: "Fix bug", priority: "urgent" }`.

2. **Zustand Store Action**
   - Calls `useTaskStore.getState().createTask(workspaceId, payload)`.

3. **API Request**
   - Axios `POST /api/v1/tasks` with the payload.
   - Axios automatically attaches the `tamad_access_token` cookie.

4. **Backend Routing & Middleware**
   - `taskRoutes.ts` catches the POST request.
   - `protect` middleware runs: verifies the JWT cookie, finds the User in Mongo, attaches `req.user`.
   - `requireWorkspaceMember` middleware runs: verifies `req.user._id` is in the Workspace's `members` array.
   - `validate(taskCreateSchema)` runs: Zod ensures `title` is a string 1-200 chars long and strips unexpected fields.

5. **Backend Controller (`taskController.createTask`)**
   - Queries `Task.countDocuments()` to determine the new task's `order` (for drag-and-drop sorting).
   - Calls `Task.create({...})` to insert into MongoDB.
   - Invalidate cache: `cache.invalidatePattern(CACHE_KEYS.TASKS(workspaceId, '*'))`.
   - Emits real-time event: `getIO().to('workspace_xyz').emit('task_created', newTask)`.
   - Returns 201 Created with the `newTask` JSON.

6. **Frontend State Update**
   - Store updates: `set(state => ({ tasks: [...state.tasks, data] }))`.
   - UI re-renders, task appears in the list.

---

## 36 — Traceback: Real-time Update Flow

What happens to *other* users when the task is created in the previous step?

1. **The Broadcast (Backend)**
   - The controller executed `getIO().to('workspace_xyz').emit('task_created', task)`.
   - Socket.IO serializes the task into a WebSocket frame.
   - It sends the frame to every TCP socket currently subscribed to the `workspace_xyz` room.

2. **The Reception (Frontend - Other User's Browser)**
   - `RealtimeProvider.tsx` contains an active `socket.on('task_created')` listener.
   - The event fires, passing the new task object as the payload.

3. **Zustand Store Interception**
   - The listener calls `useTaskStore.getState().addTaskFromRealtime(task)`.
   - *Optimization*: The store checks if the task already exists (to prevent duplicates if the user is the one who created it).

4. **UI Reaction**
   - Zustand state updates.
   - The React UI (e.g., Kanban board) instantly re-renders to show the new task without the user refreshing the page.

---

## 37 — Traceback: File Upload Flow

TaMaD avoids routing large files through the Node.js backend. Instead, it uses direct-to-cloud uploads.

1. **User Action**
   - User drops a PDF into the `FileUpload.tsx` component.

2. **Request Signed URL (Frontend → Backend)**
   - Frontend calls `POST /api/v1/files/upload-url` with `{ fileName: "doc.pdf", contentType: "application/pdf" }`.
   
3. **Generate URL (Backend)**
   - `fileController.getUploadUrl` uses the Firebase Admin SDK to generate a temporary, signed upload URL (valid for 15 minutes).
   - Returns `{ url, storagePath }`.

4. **Direct Cloud Upload (Frontend → Firebase Storage)**
   - The frontend's `useFileUpload.ts` hook executes an HTTP PUT request *directly* to the signed URL provided by Google Cloud.
   - Firebase Storage enforces `storage.rules` (e.g., checking file size).
   - The progress bar in the UI updates based on the upload progress event.

5. **Finalize Metadata (Frontend → Backend)**
   - Once the upload completes, the frontend calls `POST /api/v1/files` with the file metadata (size, name, path).
   - `fileController.createFile` saves this metadata to the MongoDB `File` collection.
   - Returns the file record to the frontend.

---

## 38 — Traceback: Team Invitation Flow

1. **Owner Action**
   - Team owner enters an email and selects a role in the Team Settings page.
   - Calls `POST /api/v1/teams/:id/invite`.

2. **Generate Token (Backend)**
   - `teamController.inviteMember` generates a random 32-byte hex token.
   - Creates a `TeamInvitation` document in MongoDB with the token, email, and 7-day expiration.
   - Renders an HTML email template containing `https://tamad.app/join?token=abc...`.
   - Sends the email using NodeMailer (`mailer.ts`).

3. **Recipient Action**
   - Recipient clicks the link in their email.
   - The frontend `JoinPage.tsx` parses the `?token=` from the URL.

4. **Accept Invitation**
   - User logs in or creates an account.
   - Frontend calls `POST /api/v1/teams/join` with `{ token }`.

5. **Backend Verification**
   - `teamController.joinTeam` finds the `TeamInvitation` document.
   - Checks if it's expired or already used.
   - Creates a `TeamMember` document linking the user to the team.
   - Marks the invitation as `accepted`.
   - Socket.IO broadcasts `member_joined` to the team room.
   - Returns success.

6. **UI Reaction**
   - User is redirected to the team dashboard.
   - Existing team members see the new user pop up in the members list instantly via the Socket.IO broadcast.
