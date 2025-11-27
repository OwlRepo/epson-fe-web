import { getApiSocketBaseUrl } from "@/utils/env";
import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = getApiSocketBaseUrl();

/**
 * A lightweight hook for emitting socket events without joining any room.
 * Use this when you only need to send data and don't need to receive updates.
 */
export const useSocketEmit = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log("🚀 [useSocketEmit] Initializing socket connection...");

    let socketInstance: Socket;

    try {
      socketInstance = io(SOCKET_URL, {
        extraHeaders: {
          "ngrok-skip-browser-warning": "true",
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
    } catch (err) {
      console.error("🔴 [useSocketEmit] Socket initialization failed:", err);
      return;
    }

    socketInstance.on("connect", () => {
      console.log("🟢 [useSocketEmit] Socket connected");
      setIsConnected(true);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 [useSocketEmit] Socket connection error:", err.message);
      setIsConnected(false);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 [useSocketEmit] Socket disconnected");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      console.log("🧹 [useSocketEmit] Cleaning up socket connection...");
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("connect_error");
      socketInstance.disconnect();
      console.log("✨ [useSocketEmit] Socket cleanup completed");
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
