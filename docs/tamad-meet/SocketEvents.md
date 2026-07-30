# TaMaD Meet Socket Events

Namespace: `/socket/tamad-meet`

## Client -> Server
- `join-room`: `{ roomId, participantId }` -> Joins the Socket.io room.
- `offer`: `{ target, offer, callerId }` -> Emits an SDP offer to the target socket.
- `answer`: `{ target, answer, calleeId }` -> Emits an SDP answer back to the caller.
- `ice-candidate`: `{ target, candidate, senderId }` -> Relays ICE networking data.
- `chat-message`: `{ roomId, message }` -> Broadcasts a chat message.

## Server -> Client
- `participant-joined`: `{ participantId, socketId }` -> Informs the room that someone connected.
- `offer`: `{ offer, callerId, callerSocketId }`
- `answer`: `{ answer, calleeId, calleeSocketId }`
- `ice-candidate`: `{ candidate, senderId, senderSocketId }`
- `chat-message`: `{ message }`
