# TaMaD - Task Management Application (Enterprise Edition)

TaMaD is a high-performance, real-time, AI-powered task management platform designed for modern teams. Built with React, Node.js, and MongoDB, it provides a seamless, collaborative experience with instant sync, audit logging, and intelligent features.

## 🚀 Key Features

- **Real-Time Collaboration**: Powered by Socket.io, every change (task updates, moves, comments) is instantly broadcasted to all connected clients. No manual refreshing needed.
- **Intelligent AI Parsing**: Simply type *"remind me to fix the login bug urgently by Friday"* and the backend Google Gemini integration will automatically parse it into a perfectly structured task.
- **Enterprise Audit Logs**: Every single action within a workspace is recorded to ensure full compliance and accountability.
- **Kanban Task Board**: A beautifully designed, drag-and-drop Kanban board for effortless workflow management.
- **Rich Task Comments**: Discuss tasks with your team using real-time comments.
- **Secure Authentication**: JWT-based stateless authentication protecting all APIs and Socket connections.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Zustand, DnD Kit
* **Backend**: Node.js, Express, TypeScript, Socket.io
* **Database**: MongoDB (Mongoose)
* **AI Integration**: Google Generative AI (Gemini)
* **DevOps**: Docker, Nginx, Docker Compose

---

## 📦 Local Development

Ensure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/tamad.git
   cd tamad
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in the root directory.
   - Fill in your `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.

4. **Start Development Servers**
   \`\`\`bash
   pnpm run dev
   \`\`\`
   This uses `concurrently` to launch both the frontend (Vite) and backend (Express) in watch mode.

---

## 🚢 Production Deployment (Docker)

TaMaD is fully containerized and ready to be deployed to any Docker-compatible environment (AWS, DigitalOcean, self-hosted Linux).

1. **Configure Environment**
   Ensure your `.env` file is present in the root directory and contains production credentials.

2. **Build and Spin up Containers**
   \`\`\`bash
   docker-compose up -d --build
   \`\`\`

3. **Verify Deployment**
   - The React frontend will be served via Nginx on port `80`.
   - The Express API and Socket.io server will be running on port `5000` (internally proxied by Nginx).

### Manual Build
If you are deploying to a PaaS that doesn't use Docker (like Vercel for Frontend and Render for Backend):
- **Frontend**: Run `pnpm run build` in the root (builds to `frontend/dist`).
- **Backend**: Run `cd backend && pnpm run build` (builds to `backend/dist`).

---

## 📄 License
MIT License.
