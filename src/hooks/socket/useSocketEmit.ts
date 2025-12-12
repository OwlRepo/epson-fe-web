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
  // If socket exists and is connected, return it
  if (globalSocketInstance?.connected) {
    return globalSocketInstance;
  }

  // If socket exists but not connected, return it anyway (it will reconnect automatically)
  // Only create a new one if socket doesn't exist at all
  if (globalSocketInstance) {
    console.log(
      "🔄 [useSocketEmit] Socket exists but not connected, reusing instance (will reconnect)"
    );
    return globalSocketInstance;
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
    console.error(
      "🔴 [useSocketEmit] Singleton socket connection error:",
      err.message
    );
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
      // Use global socket instance directly to ensure we have the latest connection state
      const socketInstance = globalSocketInstance || socket;

      if (!socketInstance) {
        console.warn("❌ [useSocketEmit] Socket not available for emission");
        return;
      }

      // Check actual socket connection status
      if (!socketInstance.connected) {
        console.warn("⚠️ [useSocketEmit] Socket not connected yet");
        return;
      }

      console.log("🚀 [useSocketEmit] Emitting to event:", event);
      console.log("📦 [useSocketEmit] Payload:", payload);
      socketInstance.emit(event, payload);
      console.log("✨ [useSocketEmit] Emission sent successfully");
    },
    [socket]
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
      // Use global socket instance directly to ensure we have the latest connection state
      const socketInstance = globalSocketInstance || socket;

      if (!socketInstance) {
        console.warn("❌ [useSocketEmit] Socket not available for emission");
        callback({ ok: false, error: "Socket not available" });
        return;
      }

      // If socket is not connected, wait for connection (with timeout)
      if (!socketInstance.connected) {
        console.warn(
          "⚠️ [useSocketEmit] Socket not connected yet. Waiting for connection...",
          {
            connected: socketInstance.connected,
            disconnected: socketInstance.disconnected,
            id: socketInstance.id,
          }
        );

        // Wait for connection with a timeout
        const timeout = setTimeout(() => {
          socketInstance.off("connect", connectHandler);
          callback({ ok: false, error: "Socket connection timeout" });
        }, 5000); // 5 second timeout

        const connectHandler = () => {
          clearTimeout(timeout);
          console.log("🟢 [useSocketEmit] Socket connected, emitting now");

          socketInstance.emit(
            event,
            payload,
            (response: {
              ok: boolean;
              url?: string;
              error?: string;
              message?: string;
            }) => {
              console.log(
                "📥 [useSocketEmit] Acknowledgement received:",
                response
              );
              callback(response);
            }
          );
        };

        socketInstance.once("connect", connectHandler);
        return;
      }

      console.log("🚀 [useSocketEmit] Emitting to event with ack:", event);
      console.log("📦 [useSocketEmit] Payload:", payload);

      socketInstance.emit(
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
    [socket]
  );

  return {
    emit,
    emitWithAck,
    isConnected,
  };
};
