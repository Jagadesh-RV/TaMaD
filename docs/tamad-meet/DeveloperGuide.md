# TaMaD Meet Developer Guide

## Local Development
To test the WebRTC mesh locally, you must use multiple browser profiles (or different browsers, e.g., Chrome and Firefox) to bypass standard local loopback restrictions on media devices.

1. Ensure `pnpm run dev` is active.
2. In Browser A, log into Workspace 1 and create an Instant Meeting.
3. In Browser B, log in as a different user in Workspace 1 and join the same meeting.
4. If permissions are granted, `useWebRTC` will orchestrate the ICE candidate exchange via Socket.IO.

## Adding Features
All meeting state is stored in `tamadMeetStore.ts`. If you are adding a feature like "Raise Hand", follow this flow:
1. Add `raise-hand` to `/socket/tamad-meet` events in both `tamadMeetSocketGateway.ts` and `SocketEvents.md`.
2. Add a listener in `useWebRTC.ts` (or an auxiliary hook) to catch the broadcast.
3. Update `tamadMeetStore.ts` via `updateParticipant(id, { handRaised: true })`.
