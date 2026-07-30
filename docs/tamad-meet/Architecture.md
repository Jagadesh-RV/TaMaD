# TaMaD Meet Architecture

## High Level Overview
TaMaD Meet operates on a P2P Mesh network for WebRTC, with signaling running over a custom Socket.IO namespace `/socket/tamad-meet`.
The backend uses a strictly layered service architecture to decouple signaling from business logic, ensuring a painless future transition to an SFU.

## Core Layers
1. **Frontend UI**: Built with React and TailwindCSS (using TaMaD's specific design variables).
2. **State Management**: Zustand (`useTamadMeetStore`) manages metadata (room state, participant state).
3. **WebRTC Engine**: `useWebRTC` hook abstracts P2P logic and stream management.
4. **Signaling Server**: Node.js + Socket.IO handling real-time routing of offers/answers.
5. **Business Logic**: Backend REST APIs handling permissions, CRUD, and initial tokens.
6. **Database**: MongoDB storing metadata and signaling audit logs.
