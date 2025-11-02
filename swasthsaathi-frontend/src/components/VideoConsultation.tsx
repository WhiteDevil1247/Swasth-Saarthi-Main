import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface VideoConsultationProps {
  roomId: string;
  onEnd: () => void;
}

export const VideoConsultation = ({ roomId, onEnd }: VideoConsultationProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Initialize Socket.io connection
    const newSocket = io('http://localhost:8081', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('user-connected', (userId: string) => {
      console.log('User connected:', userId);
      setIsConnected(true);
      createOffer();
    });

    newSocket.on('webrtc-offer', async ({ offer, from }: any) => {
      console.log('Received offer from:', from);
      await handleOffer(offer);
    });

    newSocket.on('webrtc-answer', async ({ answer }: any) => {
      console.log('Received answer');
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    newSocket.on('ice-candidate', async ({ candidate }: any) => {
      console.log('Received ICE candidate');
      if (candidate) {
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    setSocket(newSocket);

    // Get user media
    initializeMedia();

    return () => {
      newSocket.disconnect();
      cleanup();
    };
  }, [roomId]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote track');
        const [remoteStream] = event.streams;
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.current = pc;
    } catch (err: any) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
    }
  };

  const createOffer = async () => {
    if (!peerConnection.current || !socket) return;

    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit('webrtc-offer', {
        roomId,
        offer,
      });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current || !socket) return;

    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit('webrtc-answer', {
        roomId,
        answer,
      });
    } catch (err) {
      console.error('Error handling offer:', err);
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

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
  };

  const endCall = () => {
    cleanup();
    onEnd();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Video Consultation</h2>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Connected</span>
                </span>
              ) : (
                <span className="text-sm text-yellow-300">Waiting for doctor...</span>
              )}
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 relative bg-gray-900">
          {/* Remote Video (large) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Video className="w-12 h-12" />
                </div>
                <p>Waiting for other participant...</p>
              </div>
            </div>
          )}

          {/* Local Video (small, picture-in-picture) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Microphone */}
            <motion.button
              onClick={toggleAudio}
              className={`p-4 rounded-full ${
                isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              } transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </motion.button>

            {/* Video */}
            <motion.button
              onClick={toggleVideo}
              className={`p-4 rounded-full ${
                isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              } transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </motion.button>

            {/* End Call */}
            <motion.button
              onClick={endCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
