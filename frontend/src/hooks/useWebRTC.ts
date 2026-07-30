import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebRTC = (roomId: string | undefined, participantId: string | undefined) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!roomId || !participantId) return;

    // Connect to specific TaMaD Meet namespace
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(`${socketUrl}/socket/tamad-meet`, {
      withCredentials: true,
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', { roomId, participantId });
    });

    socket.on('participant-joined', async ({ participantId: newParticipantId, socketId }) => {
      // Start WebRTC process as the caller
      const pc = createPeerConnection(newParticipantId, socketId);
      peerConnections.current[newParticipantId] = pc;
      
      if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { target: socketId, offer, callerId: participantId });
    });

    socket.on('offer', async ({ offer, callerId, callerSocketId }) => {
      const pc = createPeerConnection(callerId, callerSocketId);
      peerConnections.current[callerId] = pc;
      
      if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { target: callerSocketId, answer, calleeId: participantId });
    });

    socket.on('answer', async ({ answer, calleeId }) => {
      const pc = peerConnections.current[calleeId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async ({ candidate, senderId }) => {
      const pc = peerConnections.current[senderId];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.disconnect();
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
    };
  }, [roomId, participantId, localStream]);

  const createPeerConnection = (remoteId: string, remoteSocketId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          target: remoteSocketId,
          candidate: event.candidate,
          senderId: participantId
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [remoteId]: event.streams[0]
      }));
    };

    return pc;
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      // Add tracks to existing peer connections if any
      Object.values(peerConnections.current).forEach(pc => {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      });
    } catch (err) {
      console.error('Failed to get local stream', err);
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  return { localStream, remoteStreams, startLocalStream, stopLocalStream };
};
