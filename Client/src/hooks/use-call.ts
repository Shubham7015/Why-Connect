import { create } from "zustand";
import { type UserType } from "@/types/auth.type";

interface CallState {
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  isCallAccepted: boolean;
  caller: UserType | null;
  receiver: UserType | null;
  callType: "voice" | "video" | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMicMuted: boolean;
  isCameraOff: boolean;

  setIncomingCall: (caller: UserType, type: "voice" | "video") => void;
  setOutgoingCall: (receiver: UserType, type: "voice" | "video") => void;
  setCallAccepted: (accepted: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setMicMuted: (muted: boolean) => void;
  setCameraOff: (off: boolean) => void;
  resetCall: () => void;
}

export const useCall = create<CallState>((set) => ({
  isIncomingCall: false,
  isOutgoingCall: false,
  isCallAccepted: false,
  caller: null,
  receiver: null,
  callType: null,
  localStream: null,
  remoteStream: null,
  isMicMuted: false,
  isCameraOff: false,

  setIncomingCall: (caller, type) =>
    set({ isIncomingCall: true, caller, callType: type }),
  setOutgoingCall: (receiver, type) =>
    set({ isOutgoingCall: true, receiver, callType: type }),
  setCallAccepted: (accepted) => set({ isCallAccepted: accepted }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setMicMuted: (muted) => set({ isMicMuted: muted }),
  setCameraOff: (off) => set({ isCameraOff: off }),
  resetCall: () =>
    set({
      isIncomingCall: false,
      isOutgoingCall: false,
      isCallAccepted: false,
      caller: null,
      receiver: null,
      callType: null,
      localStream: null,
      remoteStream: null,
      isMicMuted: false,
      isCameraOff: false,
    }),
}));
