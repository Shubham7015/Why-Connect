import { useEffect, useRef, useState, useCallback } from "react";
import { useCall } from "../../hooks/use-call";
import { usePeer } from "../../hooks/use-peer";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

const CallOverlay = () => {
  const {
    isIncomingCall,
    isOutgoingCall,
    isCallAccepted,
    caller,
    receiver,
    callType,
    localStream,
    remoteStream,
    isMicMuted,
    isCameraOff,
  } = useCall();
  const { answerCall, rejectCall, endCall, toggleMic, toggleVideo } = usePeer();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Call timer
  const [callDuration, setCallDuration] = useState(0);
  useEffect(() => {
    if (!isCallAccepted) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, [isCallAccepted]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Attach local stream using a callback ref so it works even when the
  // video element mounts AFTER the stream is already available (receiver side)
  const localVideoCallbackRef = useCallback(
    (node: HTMLVideoElement | null) => {
      localVideoRef.current = node;
      if (node && localStream) {
        node.srcObject = localStream;
      }
    },
    [localStream],
  );

  // Also re-attach whenever localStream changes on an already mounted element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCallAccepted, isOutgoingCall, isIncomingCall]);

  // Attach remote stream using callback ref (same pattern as local video)
  const remoteVideoCallbackRef = useCallback(
    (node: HTMLVideoElement | null) => {
      remoteVideoRef.current = node;
      if (node && remoteStream) {
        node.srcObject = remoteStream;
      }
    },
    [remoteStream],
  );

  // Also re-attach whenever remoteStream changes on an already mounted element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isCallAccepted]);

  // Debug: log stream state changes
  useEffect(() => {
    console.log("[CallOverlay] Stream state:", {
      hasLocal: !!localStream,
      hasRemote: !!remoteStream,
      isCallAccepted,
      isOutgoing: isOutgoingCall,
      isIncoming: isIncomingCall,
      localTracks: localStream
        ?.getTracks()
        .map((t) => `${t.kind}:${t.readyState}`),
      remoteTracks: remoteStream
        ?.getTracks()
        .map((t) => `${t.kind}:${t.readyState}`),
    });
  }, [
    localStream,
    remoteStream,
    isCallAccepted,
    isOutgoingCall,
    isIncomingCall,
  ]);

  if (!isIncomingCall && !isOutgoingCall && !isCallAccepted) return null;

  const displayUser = isIncomingCall ? caller : receiver;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 lg:p-4 text-white">
      <div className="relative w-full h-full lg:h-auto lg:max-w-2xl bg-zinc-900 lg:rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 lg:p-8">
        {/* ─── Incoming / Outgoing (not yet connected) ─── */}
        {!isCallAccepted && (
          <div className="flex flex-col items-center gap-6 text-center">
            {/* Pulsing avatar ring for ringing effect */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-30" />
              <Avatar className="w-24 h-24 lg:w-28 lg:h-28 border-4 border-primary relative z-10">
                <AvatarImage src={displayUser?.avatar || ""} />
                <AvatarFallback className="text-3xl">
                  {displayUser?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <h2 className="text-2xl font-bold">{displayUser?.name}</h2>
              <p className="text-zinc-400 mt-2 animate-pulse">
                {isIncomingCall ? `Incoming ${callType} call...` : `Calling...`}
              </p>
            </div>

            {/* Self preview while on outgoing video call */}
            {isOutgoingCall && callType === "video" && localStream && (
              <div className="w-36 lg:w-40 aspect-video rounded-lg overflow-hidden border-2 border-zinc-700 bg-zinc-800">
                <video
                  ref={localVideoCallbackRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
            )}

            <div className="flex gap-6 mt-4">
              {isIncomingCall ? (
                <>
                  <Button
                    onClick={answerCall}
                    className="bg-green-600 hover:bg-green-700 w-16 h-16 rounded-full flex items-center justify-center p-0 shadow-lg shadow-green-600/30"
                  >
                    <Phone className="w-7 h-7 fill-current" />
                  </Button>
                  <Button
                    onClick={rejectCall}
                    className="bg-red-600 hover:bg-red-700 w-16 h-16 rounded-full flex items-center justify-center p-0 shadow-lg shadow-red-600/30"
                  >
                    <PhoneOff className="w-7 h-7 fill-current" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={endCall}
                  className="bg-red-600 hover:bg-red-700 w-16 h-16 rounded-full flex items-center justify-center p-0 shadow-lg shadow-red-600/30"
                >
                  <PhoneOff className="w-7 h-7 fill-current" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ─── Active Call View ─── */}
        {isCallAccepted && (
          <div className="relative w-full h-full lg:aspect-video bg-black rounded-xl overflow-hidden shadow-inner">
            {/* Remote Stream (main view) */}
            <video
              ref={remoteVideoCallbackRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Call Duration Timer */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
              <span className="text-sm font-mono text-white/90">
                {formatDuration(callDuration)}
              </span>
            </div>

            {/* Local Stream (Picture-in-Picture) */}
            {callType === "video" && !isCameraOff && (
              <div className="absolute top-12 right-3 lg:top-4 lg:right-4 w-24 lg:w-1/4 aspect-video bg-zinc-800 rounded-lg overflow-hidden border-2 border-zinc-700 shadow-lg">
                <video
                  ref={localVideoCallbackRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
            )}

            {/* Voice call – show avatar instead of black video */}
            {callType === "voice" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Avatar className="w-24 h-24 lg:w-28 lg:h-28 border-4 border-primary">
                  <AvatarImage src={displayUser?.avatar || ""} />
                  <AvatarFallback className="text-3xl">
                    {displayUser?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-4 text-lg font-medium text-zinc-300">
                  {displayUser?.name}
                </p>
                <p className="text-sm text-green-400 mt-1">Connected</p>
              </div>
            )}

            {/* In-Call Controls */}
            <div className="absolute bottom-8 lg:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full">
              <Button
                variant="ghost"
                onClick={toggleMic}
                className={`rounded-full w-12 h-12 p-0 ${
                  isMicMuted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {isMicMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
              {callType === "video" && (
                <Button
                  variant="ghost"
                  onClick={toggleVideo}
                  className={`rounded-full w-12 h-12 p-0 ${
                    isCameraOff
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {isCameraOff ? (
                    <VideoOff className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </Button>
              )}
              <Button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-700 w-14 h-14 rounded-full p-0 shadow-lg shadow-red-600/30"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallOverlay;
