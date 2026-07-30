# Deployment Guide

When deploying TaMaD Meet, standard WebRTC restrictions apply:

1. **HTTPS is Mandatory**: `getUserMedia()` will simply not function over `http://` outside of `localhost`.
2. **STUN/TURN Servers**: The application currently defaults to Google's public STUN server (`stun:stun.l.google.com:19302`). In production, enterprise firewalls will often block standard P2P UDP ports. You **must** provision a TURN server (e.g., Coturn) and add its credentials to the `RTCPeerConnection` configuration in `useWebRTC.ts` to ensure 100% connectivity.
3. **Socket.IO Scaling**: If running multiple Node instances, you must configure a Redis adapter for Socket.IO so that signals can cross Node boundaries. (Currently managed by `redis` adapter in `socketManager.ts`).
