import { useEffect, useCallback } from "react";
import Peer from "peerjs";
import { useSocket } from "./use-socket";
import { useCall } from "./use-call";
import { useAuth } from "./use-auth";

// ── Module-level singletons (shared across all hook instances) ──
let peerInstance: Peer | null = null;
let currentMediaCall: any = null;
let ringAudio: HTMLAudioElement | null = null;
let callAudio: HTMLAudioElement | null = null;
let socketListenersAttached = false;
let peerRetried = false;

// ── Video constraints (480p to prevent lag) ─────────────────────
const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640, max: 640 },
  height: { ideal: 480, max: 480 },
  frameRate: { ideal: 24, max: 24 },
};

// ── PeerJS ICE config (use Google STUN for direct P2P on LAN) ──
const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  },
};

// ── Audio helpers (window-based to survive HMR) ────────────────
const RING_TONE_URL =
  "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const CALL_TONE_URL =
  "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3";

const _win = window as any;

const playRing = () => {
  stopAllTones();
  const audio = new Audio(RING_TONE_URL);
  audio.loop = true;
  audio.volume = 0.6;
  audio.play().catch(() => {});
  ringAudio = audio;
  _win.__callRing = audio;
  if (navigator.vibrate) navigator.vibrate([300, 200, 300, 200, 300]);
};

const playCallTone = () => {
  stopAllTones();
  const audio = new Audio(CALL_TONE_URL);
  audio.loop = true;
  audio.volume = 0.4;
  audio.play().catch(() => {});
  callAudio = audio;
  _win.__callTone = audio;
};

const stopAllTones = () => {
  // Stop module-level refs
  [ringAudio, callAudio].forEach((a) => {
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  });
  ringAudio = null;
  callAudio = null;

  // Also stop HMR-surviving refs on window
  [_win.__callRing, _win.__callTone].forEach((a: HTMLAudioElement | null) => {
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  });
  _win.__callRing = null;
  _win.__callTone = null;

  if (navigator.vibrate) navigator.vibrate(0);
};

// ── Get active peer (survives HMR + Strict Mode) ────────────────
const getPeer = (): Peer | null => {
  return _win.__peerInstance && !_win.__peerInstance.destroyed
    ? _win.__peerInstance
    : peerInstance && !peerInstance.destroyed
      ? peerInstance
      : null;
};

// ── Cleanup helper ──────────────────────────────────────────────
const cleanupCall = () => {
  const { localStream } = useCall.getState();
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
  }
  currentMediaCall?.close();
  currentMediaCall = null;
  stopAllTones();
  useCall.getState().resetCall();
};

// ── Attach incoming call handler to a peer ──────────────────────
const attachCallHandler = (peer: Peer) => {
  // Remove old listeners to avoid duplicates
  peer.off("call");

  peer.on("call", (mediaCall) => {
    console.log("[PeerJS] Incoming media call from:", mediaCall.peer);
    const { localStream } = useCall.getState();

    const answerWithStream = (stream: MediaStream) => {
      console.log(
        "[PeerJS] Answering call with stream, tracks:",
        stream.getTracks().map((t) => `${t.kind}:${t.readyState}`),
      );
      mediaCall.answer(stream);
      currentMediaCall = mediaCall;

      mediaCall.on("stream", (remote: MediaStream) => {
        console.log(
          "[PeerJS] Receiver got remote stream, tracks:",
          remote.getTracks().map((t) => `${t.kind}:${t.readyState}`),
        );
        useCall.getState().setRemoteStream(remote);
      });

      mediaCall.on("close", () => {
        console.log("[PeerJS] Media call closed (receiver side)");
      });

      mediaCall.on("error", (err: any) => {
        console.error("[PeerJS] Media call error (receiver):", err);
      });

      // Monitor ICE connection state
      const pc = (mediaCall as any).peerConnection as
        | RTCPeerConnection
        | undefined;
      if (pc) {
        pc.oniceconnectionstatechange = () => {
          console.log("[PeerJS] Receiver ICE state:", pc.iceConnectionState);
        };
        pc.onconnectionstatechange = () => {
          console.log(
            "[PeerJS] Receiver connection state:",
            pc.connectionState,
          );
        };
      }
    };

    if (localStream) {
      answerWithStream(localStream);
    } else {
      let waited = 0;
      const iv = setInterval(() => {
        const s = useCall.getState().localStream;
        if (s) {
          clearInterval(iv);
          answerWithStream(s);
        }
        waited += 200;
        if (waited >= 8000) {
          clearInterval(iv);
          console.error("[PeerJS] Timed out waiting for local stream");
        }
      }, 200);
    }
  });
};

// ── Hook ────────────────────────────────────────────────────────
export const usePeer = () => {
  const { socket } = useSocket();
  const { user } = useAuth();

  // ── 1. Initialise PeerJS once (survives HMR via window) ─────
  useEffect(() => {
    if (!user?._id) return;

    // Reuse existing peer from window (survives HMR)
    if (_win.__peerInstance && !_win.__peerInstance.destroyed) {
      peerInstance = _win.__peerInstance;
      // Re-attach call handler even for reused peer (fixes HMR)
      attachCallHandler(_win.__peerInstance);
      return;
    }

    // Also skip if module-level peer is still alive
    if (peerInstance && !peerInstance.destroyed) {
      attachCallHandler(peerInstance);
      return;
    }

    const peerId = `${user._id}_${Date.now()}`;
    const peer = new Peer(peerId, PEER_CONFIG);
    peerRetried = false;

    peer.on("open", (id) => {
      console.log("[PeerJS] My peer ID is:", id);
    });

    peer.on("error", (err) => {
      console.warn("[PeerJS] Error:", err.type, err.message);
      if (err.type === "unavailable-id" && !peerRetried) {
        peerRetried = true;
        peer.destroy();
        peerInstance = null;
        _win.__peerInstance = null;
        const retryId = `${user._id}_${Date.now()}_r`;
        const retryPeer = new Peer(retryId, PEER_CONFIG);
        retryPeer.on("open", (id) =>
          console.log("[PeerJS] Retry peer ID:", id),
        );
        attachCallHandler(retryPeer);
        peerInstance = retryPeer;
        _win.__peerInstance = retryPeer;
      }
    });

    peer.on("disconnected", () => {
      console.warn(
        "[PeerJS] Disconnected from signaling server, reconnecting...",
      );
      peer.reconnect();
    });

    // Attach incoming call handler
    attachCallHandler(peer);

    peerInstance = peer;
    _win.__peerInstance = peer;

    // Never destroy peer in cleanup (React Strict Mode + HMR kill it)
    // Peer is cleaned up when user logs out or page fully unloads
    return () => {};
  }, [user?._id]);

  // ── 2. Socket signaling listeners (singleton guard) ────────
  useEffect(() => {
    if (!socket || socketListenersAttached) return;

    const onCallOffer = ({
      caller,
      type,
    }: {
      caller: any;
      type: "voice" | "video";
    }) => {
      console.log("Incoming call from:", caller?.name, "type:", type);
      useCall.getState().setIncomingCall(caller, type);
      playRing();
    };

    const onCallAnswer = ({
      peerId,
      type,
    }: {
      peerId: string;
      type?: "voice" | "video";
    }) => {
      // Always stop tones first, regardless of state checks
      stopAllTones();

      const state = useCall.getState();
      console.log("Call answered, connecting to peer:", peerId);

      const peer = getPeer();
      if (!state.isOutgoingCall || !state.localStream || !peer) {
        console.warn("call:answer received but not ready:", {
          isOutgoing: state.isOutgoingCall,
          hasStream: !!state.localStream,
          hasPeer: !!peer,
        });
        return;
      }

      if (type && state.receiver) {
        useCall.getState().setOutgoingCall(state.receiver, type);
      }

      // Mark call as accepted immediately so UI switches
      useCall.getState().setCallAccepted(true);

      console.log("[PeerJS] Caller initiating media call to peer:", peerId);
      console.log(
        "[PeerJS] Caller local stream tracks:",
        state.localStream.getTracks().map((t) => `${t.kind}:${t.readyState}`),
      );

      const mediaCall = peer.call(peerId, state.localStream);
      if (!mediaCall) {
        console.error("[PeerJS] peer.call() returned null/undefined!");
        return;
      }
      currentMediaCall = mediaCall;

      mediaCall.on("stream", (remote: MediaStream) => {
        console.log(
          "[PeerJS] Caller received remote stream, tracks:",
          remote.getTracks().map((t) => `${t.kind}:${t.readyState}`),
        );
        useCall.getState().setRemoteStream(remote);
      });

      mediaCall.on("close", () => {
        console.log("[PeerJS] Media call closed (caller side)");
      });

      mediaCall.on("error", (err: any) => {
        console.error("[PeerJS] Media call error (caller):", err);
      });

      // Monitor ICE connection state
      const pc = (mediaCall as any).peerConnection as
        | RTCPeerConnection
        | undefined;
      if (pc) {
        pc.oniceconnectionstatechange = () => {
          console.log("[PeerJS] Caller ICE state:", pc.iceConnectionState);
        };
        pc.onconnectionstatechange = () => {
          console.log("[PeerJS] Caller connection state:", pc.connectionState);
        };
      }
    };

    const onCallRejected = () => {
      stopAllTones();
      cleanupCall();
    };

    const onCallEnded = () => {
      cleanupCall();
    };

    socket.on("call:offer", onCallOffer);
    socket.on("call:answer", onCallAnswer);
    socket.on("call:rejected", onCallRejected);
    socket.on("call:ended", onCallEnded);

    socketListenersAttached = true;

    return () => {
      socket.off("call:offer", onCallOffer);
      socket.off("call:answer", onCallAnswer);
      socket.off("call:rejected", onCallRejected);
      socket.off("call:ended", onCallEnded);
      socketListenersAttached = false;
    };
  }, [socket]);

  // ── Actions ────────────────────────────────────────────────
  const startCall = useCallback(
    async (targetUser: any, type: "voice" | "video") => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === "video" ? VIDEO_CONSTRAINTS : false,
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        useCall.getState().setLocalStream(stream);
        useCall.getState().setOutgoingCall(targetUser, type);
        socket?.emit("call:offer", { targetUserId: targetUser._id, type });
        playCallTone();
      } catch (err) {
        console.error("Failed to get local stream", err);
        alert("Please allow camera and microphone access to make calls.");
      }
    },
    [socket],
  );

  const answerCall = useCallback(async () => {
    const { callType, caller } = useCall.getState();

    // Stop ringtone IMMEDIATELY before anything else
    stopAllTones();

    try {
      let stream: MediaStream;
      let resolvedType: "voice" | "video" = callType ?? "voice";
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: callType === "video" ? VIDEO_CONSTRAINTS : false,
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch (videoErr: any) {
        if (
          callType === "video" &&
          (videoErr.name === "NotReadableError" ||
            videoErr.name === "NotAllowedError")
        ) {
          console.warn("Video failed, falling back to audio only");
          stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          resolvedType = "voice";
          if (caller) useCall.getState().setIncomingCall(caller, "voice");
        } else {
          throw videoErr;
        }
      }

      useCall.getState().setLocalStream(stream);
      useCall.getState().setCallAccepted(true);

      // Wait for PeerJS to be ready (checks window for HMR survival)
      const waitForPeerId = (): Promise<string | null> => {
        return new Promise((resolve) => {
          const p = getPeer();
          if (p?.id) return resolve(p.id);
          let waited = 0;
          const iv = setInterval(() => {
            const p2 = getPeer();
            if (p2?.id) {
              clearInterval(iv);
              resolve(p2.id);
            }
            waited += 200;
            if (waited >= 5000) {
              clearInterval(iv);
              resolve(null);
            }
          }, 200);
        });
      };

      const myId = await waitForPeerId();
      if (myId) {
        socket?.emit("call:answer", {
          targetUserId: caller?._id,
          peerId: myId,
          type: resolvedType,
        });
      } else {
        console.error("PeerJS not ready after waiting");
        cleanupCall();
      }
    } catch (err: any) {
      console.error("Failed to get local stream", err);
      stopAllTones();
      if (err.name === "NotReadableError") {
        alert(
          "Camera or Microphone is already in use by another application/tab.",
        );
      } else {
        alert(
          "Could not access camera or microphone. Please check permissions.",
        );
      }
      cleanupCall();
    }
  }, [socket]);

  const rejectCall = useCallback(() => {
    const { caller } = useCall.getState();
    socket?.emit("call:reject", { targetUserId: caller?._id });
    stopAllTones();
    useCall.getState().resetCall();
  }, [socket]);

  const endCall = useCallback(() => {
    const state = useCall.getState();
    const targetId = state.isOutgoingCall
      ? state.receiver?._id
      : state.caller?._id;
    socket?.emit("call:end", { targetUserId: targetId });
    cleanupCall();
  }, [socket]);

  const toggleMic = useCallback(() => {
    const { localStream } = useCall.getState();
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        useCall.getState().setMicMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const { localStream } = useCall.getState();
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        useCall.getState().setCameraOff(!videoTrack.enabled);
      }
    }
  }, []);

  return {
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleVideo,
  };
};
