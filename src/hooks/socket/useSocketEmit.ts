import { getApiSocketBaseUrl } from "@/utils/env";
import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = getApiSocketBaseUrl();

// Module-level singleton socket instance
let globalSocketInstance: Socket | null = null;
let connectionListeners: Set<(connected: boolean) => void> = new Set();

/**
 * Get or create the singleton socket instance
 */
const getSocketInstance = (): Socket => {
  if (globalSocketInstance?.connected) {
    return globalSocketInstance;
  }

  // If socket exists but not connected, disconnect and recreate
  if (globalSocketInstance) {
    globalSocketInstance.disconnect();
    globalSocketInstance = null;
  }

  console.log("🚀 [useSocketEmit] Creating singleton socket connection...");

  const socketInstance = io(SOCKET_URL, {
    extraHeaders: {
      "ngrok-skip-browser-warning": "true",
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socketInstance.on("connect", () => {
    console.log("🟢 [useSocketEmit] Singleton socket connected");
    connectionListeners.forEach((listener) => listener(true));
  });

  socketInstance.on("connect_error", (err) => {
    console.error("🔴 [useSocketEmit] Singleton socket connection error:", err.message);
    connectionListeners.forEach((listener) => listener(false));
  });

  socketInstance.on("disconnect", () => {
    console.log("🔌 [useSocketEmit] Singleton socket disconnected");
    connectionListeners.forEach((listener) => listener(false));
  });

  globalSocketInstance = socketInstance;
  return socketInstance;
};

/**
 * A lightweight hook for emitting socket events without joining any room.
 * Use this when you only need to send data and don't need to receive updates.
 * Uses a singleton socket instance to prevent multiple connections.
 */
export const useSocketEmit = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get or create the singleton socket instance
    const socketInstance = getSocketInstance();
    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    // Register connection state listener
    const connectionListener = (connected: boolean) => {
      setIsConnected(connected);
    };
    connectionListeners.add(connectionListener);

    // Set initial connection state
    if (socketInstance.connected) {
      setIsConnected(true);
    }

    return () => {
      // Remove listener on unmount
      connectionListeners.delete(connectionListener);
      // Note: We don't disconnect the socket here because it's shared
      // The socket will be cleaned up when the module is unloaded or explicitly disconnected
    };
  }, []);

  /**
   * Emit data to a specific event/room
   * @param event - The event name or room to emit to
   * @param payload - The data to send
   */
  const emit = useCallback(
    (event: string, payload?: any) => {
      if (!socket) {
        console.warn("❌ [useSocketEmit] Socket not available for emission");
        return;
      }

      if (!isConnected) {
        console.warn("⚠️ [useSocketEmit] Socket not connected yet");
        return;
      }

      console.log("🚀 [useSocketEmit] Emitting to event:", event);
      console.log("📦 [useSocketEmit] Payload:", payload);
      socket.emit(event, payload);
      console.log("✨ [useSocketEmit] Emission sent successfully");
    },
    [socket, isConnected]
  );

  /**
   * Emit data to a specific event/room with acknowledgement
   * @param event - The event name or room to emit to
   * @param payload - The data to send
   * @param callback - Callback function to handle the acknowledgement response
   */
  const emitWithAck = useCallback(
    (
      event: string,
      payload: any,
      callback: (response: {
        ok: boolean;
        url?: string;
        error?: string;
        message?: string;
      }) => void
    ) => {
      if (!socket) {
        console.warn("❌ [useSocketEmit] Socket not available for emission");
        callback({ ok: false, error: "Socket not available" });
        return;
      }

      if (!isConnected) {
        console.warn("⚠️ [useSocketEmit] Socket not connected yet");
        callback({ ok: false, error: "Socket not connected" });
        return;
      }

      console.log("🚀 [useSocketEmit] Emitting to event with ack:", event);
      console.log("📦 [useSocketEmit] Payload:", payload);

      socket.emit(
        event,
        payload,
        (response: {
          ok: boolean;
          url?: string;
          error?: string;
          message?: string;
        }) => {
          console.log("📥 [useSocketEmit] Acknowledgement received:", response);
          callback(response);
        }
      );
    },
    [socket, isConnected]
  );

  return {
    emit,
    emitWithAck,
    isConnected,
  };
};
