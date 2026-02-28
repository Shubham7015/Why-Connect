import { Server, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { Env } from "../config/env.config";
import jwt from "jsonwebtoken";
import { validateChatParticipant } from "../services/chat.service";
import UserModel from "../models/user.model";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: Server | null = null;

const onlineUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: Env.FRONTEND_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Unauthorized"));

      const token = rawCookie?.split("=")?.[1]?.trim();
      if (!token) return next(new Error("Unauthorized"));

      const decodedToken = jwt.verify(token, Env.JWT_SECRET) as {
        userId: string;
      };
      if (!decodedToken) return next(new Error("Unauthorized"));

      socket.userId = decodedToken.userId;
      next();
    } catch (error) {
      next(new Error("Internal Server Error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    if (!socket.userId) {
      socket.disconnect(true);
      return;
    }
    const userId = socket.userId;
    const newSocketId = socket.id;

    console.log("socket connected ", { userId, newSocketId });

    // register socket for the user
    onlineUsers.set(userId, newSocketId);

    // broadcast online users to all all socket
    io?.emit("online:users", Array.from(onlineUsers.keys()));

    // create personal room for user
    socket.join(`user:${userId}`);

    socket.on(
      "chat:join",
      async (chatId: string, callBack?: (err?: string) => void) => {
        try {
          await validateChatParticipant(chatId, userId);
          socket.join(`chat:${chatId}`);

          console.log(`User ${userId} joined room chat:${chatId}`);

          callBack?.();
        } catch (error) {
          callBack?.("Error joining chat ");
        }
      },
    );

    socket.on("chat:leave", (chatId: string) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`User ${userId} left room chat:${chatId}`);
      }
    });

    // Call signaling
    socket.on("call:offer", async ({ targetUserId, type }) => {
      const caller = await UserModel.findById(userId).select("name avatar _id");
      if (caller) {
        io?.to(`user:${targetUserId}`).emit("call:offer", { caller, type });
      }
    });

    socket.on("call:answer", (data) => {
      const { targetUserId } = data;
      io?.to(`user:${targetUserId}`).emit("call:answer", data);
    });

    socket.on("call:reject", ({ targetUserId }) => {
      io?.to(`user:${targetUserId}`).emit("call:rejected");
    });

    socket.on("call:end", ({ targetUserId }) => {
      io?.to(`user:${targetUserId}`).emit("call:ended");
    });

    socket.on("disconnect", () => {
      if (onlineUsers.get(userId) === newSocketId) {
        if (userId) onlineUsers.delete(userId);
        io?.emit("online:users", Array.from(onlineUsers.keys()));
        console.log("socket is disconnected", { userId, newSocketId });
      }
    });
  });
};

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
export const emitNewChatToParticipants = (
  participants: string[] = [],
  chat: any,
) => {
  const io = getIO();
  for (const participantId of participants) {
    io.to(`user:${participantId}`).emit("chat:new", chat);
  }
};

export const emitNewMessageToChatRoom = (
  senderId: string, // userID that sent the message
  chatId: string,
  message: any,
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(senderId?.toString());

  console.log(senderId, "senderId");
  console.log(senderSocketId, "senderSocketId exist");
  console.log("All online users:", Object.fromEntries(onlineUsers));

  if (senderSocketId) {
    io.to(`chat:${chatId}`).except(senderSocketId).emit("message:new", message);
  } else {
    io.to(`chat:${chatId}`).emit("message:new", message);
  }
};

export const emitLastMessageToParticipants = (
  participants: string[] = [],
  chatId: string,
  lastMessage: any,
) => {
  const io = getIO();
  const payload = { chatId, lastMessage };

  for (const participantId of participants) {
    io.to(`user:${participantId}`).emit("chat:update", payload);
  }
};

export const emitChatAI = ({
  chatId,
  chunk = null,
  sender,
  done = false,
  message = null,
}: {
  chatId: string;
  chunk?: string | null;
  sender?: any;
  done?: boolean;
  message?: any;
}) => {
  const io = getIO();
  if (chunk?.trim() && !done) {
    io.to(`chat:${chatId}`).emit("chat:ai", {
      chatId,
      chunk,
      done,
      message: null,
      sender,
    });

    return;
  }

  if (done) {
    io.to(`chat:${chatId}`).emit("chat:ai", {
      chatId,
      chunk: null,
      done,
      message,
      sender,
    });
    return;
  }
};
