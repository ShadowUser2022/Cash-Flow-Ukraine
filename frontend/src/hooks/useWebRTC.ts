import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import useGameStore from '../store/gameStore';

interface WebRTCHookProps {
  socket: Socket | null;
  roomId: string;
}

export const useWebRTC = ({ socket, roomId }: WebRTCHookProps) => {
  const peerConnections = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  const {
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    setLocalStream,
    addRemoteStream,
    removeRemoteStream,
    setWebRTCConnectionStatus,
    setParticipants,
    addNotification
  } = useGameStore();

  // WebRTC configuration
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  // Initialize local media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setWebRTCConnectionStatus('connected');
      addNotification({
        type: 'success',
        title: 'Відео підключено',
        message: 'Камера та мікрофон успішно підключені',
        duration: 3000
      });

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setWebRTCConnectionStatus('failed');
      addNotification({
        type: 'error',
        title: 'Помилка доступу',
        message: 'Не вдалося отримати доступ до камери або мікрофону',
        duration: 5000
      });
      throw error;
    }
  }, [setLocalStream, setWebRTCConnectionStatus, addNotification]);

  // Create peer connection
  const createPeerConnection = useCallback((peerId: string, isInitiator: boolean = false) => {
    const peerConnection = new RTCPeerConnection(rtcConfiguration);
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      addRemoteStream(peerId, remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:ice-candidate', {
          candidate: event.candidate,
          targetPeerId: peerId,
          roomId
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state with ${peerId}:`, peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'disconnected' || 
          peerConnection.connectionState === 'failed') {
        removeRemoteStream(peerId);
        delete peerConnections.current[peerId];
      }
    };

    peerConnections.current[peerId] = peerConnection;

    // If initiator, create and send offer
    if (isInitiator) {
      createOffer(peerId);
    }

    return peerConnection;
  }, [localStream, socket, roomId, addRemoteStream, removeRemoteStream]);

  // Create and send offer
  const createOffer = useCallback(async (peerId: string) => {
    const peerConnection = peerConnections.current[peerId];
    if (!peerConnection || !socket) return;

    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnection.setLocalDescription(offer);
      
      socket.emit('webrtc:offer', {
        offer,
        targetPeerId: peerId,
        roomId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [socket, roomId]);

  // Create and send answer
  const createAnswer = useCallback(async (peerId: string, offer: RTCSessionDescriptionInit) => {
    const peerConnection = peerConnections.current[peerId] || createPeerConnection(peerId);
    if (!socket) return;

    try {
      await peerConnection.setRemoteDescription(offer);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socket.emit('webrtc:answer', {
        answer,
        targetPeerId: peerId,
        roomId
      });
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  }, [socket, roomId, createPeerConnection]);

  // Handle received answer
  const handleAnswer = useCallback(async (peerId: string, answer: RTCSessionDescriptionInit) => {
    const peerConnection = peerConnections.current[peerId];
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const peerConnection = peerConnections.current[peerId];
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        useGameStore.getState().setVideoEnabled(!isVideoEnabled);
      }
    }
  }, [localStream, isVideoEnabled]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        useGameStore.getState().setAudioEnabled(!isAudioEnabled);
      }
    }
  }, [localStream, isAudioEnabled]);

  // Join room
  const joinRoom = useCallback(() => {
    if (socket && roomId) {
      socket.emit('webrtc:join-room', { roomId });
    }
  }, [socket, roomId]);

  // Leave room and cleanup
  const leaveRoom = useCallback(() => {
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Clear remote streams
    Object.keys(remoteStreams).forEach(peerId => {
      removeRemoteStream(peerId);
    });

    if (socket) {
      socket.emit('webrtc:leave-room', { roomId });
    }

    setWebRTCConnectionStatus('disconnected');
  }, [localStream, remoteStreams, socket, roomId, setLocalStream, removeRemoteStream, setWebRTCConnectionStatus]);

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('webrtc:user-joined', ({ peerId, participants }) => {
      console.log('User joined:', peerId);
      setParticipants(participants);
      
      // Create peer connection and initiate call
      createPeerConnection(peerId, true);
    });

    socket.on('webrtc:user-left', ({ peerId, participants }) => {
      console.log('User left:', peerId);
      setParticipants(participants);
      
      // Close peer connection
      const peerConnection = peerConnections.current[peerId];
      if (peerConnection) {
        peerConnection.close();
        delete peerConnections.current[peerId];
      }
      
      removeRemoteStream(peerId);
    });

    socket.on('webrtc:offer', ({ offer, fromPeerId }) => {
      console.log('Received offer from:', fromPeerId);
      createAnswer(fromPeerId, offer);
    });

    socket.on('webrtc:answer', ({ answer, fromPeerId }) => {
      console.log('Received answer from:', fromPeerId);
      handleAnswer(fromPeerId, answer);
    });

    socket.on('webrtc:ice-candidate', ({ candidate, fromPeerId }) => {
      handleIceCandidate(fromPeerId, candidate);
    });

    return () => {
      socket.off('webrtc:user-joined');
      socket.off('webrtc:user-left');
      socket.off('webrtc:offer');
      socket.off('webrtc:answer');
      socket.off('webrtc:ice-candidate');
    };
  }, [socket, createPeerConnection, createAnswer, handleAnswer, handleIceCandidate, setParticipants, removeRemoteStream]);

  // Update local video ref when stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return {
    localVideoRef,
    initializeMedia,
    joinRoom,
    leaveRoom,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    localStream,
    remoteStreams
  };
};

export default useWebRTC;
