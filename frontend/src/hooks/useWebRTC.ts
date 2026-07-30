import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebRTC = (roomId: string | undefined, participantId: string | undefined) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const socketRef = useRef<Socket | null>(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Sync state to ref
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

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
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { target: socketId, offer, callerId: participantId });
    });

    socket.on('offer', async ({ offer, callerId, callerSocketId }) => {
      const pc = createPeerConnection(callerId, callerSocketId);
      peerConnections.current[callerId] = pc;
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
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
  }, [roomId, participantId]);

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

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        screenTrack.onended = () => {
          stopScreenSharing(screenTrack);
        };

        // Replace video track in peer connections
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        // Replace track in local stream for UI
        if (localStream) {
          const oldVideoTrack = localStream.getVideoTracks()[0];
          localStream.removeTrack(oldVideoTrack);
          localStream.addTrack(screenTrack);
          setLocalStream(new MediaStream(localStream.getTracks()));
        }
        
        setIsScreenSharing(true);
      } else {
        if (localStream) {
          const screenTrack = localStream.getVideoTracks()[0];
          await stopScreenSharing(screenTrack);
        }
      }
    } catch (err) {
      console.error("Failed to share screen", err);
    }
  };

  const stopScreenSharing = async (screenTrack: MediaStreamTrack) => {
    screenTrack.stop();
    try {
      // Revert back to camera
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      
      // Keep track enabled state synced with isVideoEnabled
      cameraTrack.enabled = isVideoEnabled;

      // Replace video track in peer connections
      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(cameraTrack);
        }
      });

      if (localStreamRef.current) {
         localStreamRef.current.removeTrack(screenTrack);
         localStreamRef.current.addTrack(cameraTrack);
         setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
      }

      setIsScreenSharing(false);
    } catch (err) {
      console.error("Failed to revert to camera", err);
    }
  };

  return { 
    localStream, 
    remoteStreams, 
    startLocalStream, 
    stopLocalStream,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing
  };
};
