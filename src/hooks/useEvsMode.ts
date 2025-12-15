import { useState, useEffect, useCallback } from "react";
import { getApiSocketBaseUrl } from "@/utils/env";
import { io, type Socket } from "socket.io-client";
import { useSocketEmit } from "./socket/useSocketEmit";

const SOCKET_URL = getApiSocketBaseUrl();

// Module-level singleton socket instance for evs_mode listener
let evsModeSocketInstance: Socket | null = null;
let evsModeListeners: Set<(data: any) => void> = new Set();

/**
 * Get or create the singleton socket instance for evs_mode
 */
const getEvsModeSocketInstance = (): Socket => {
  if (evsModeSocketInstance?.connected) {
    return evsModeSocketInstance;
  }

  // If socket exists but not connected, disconnect and recreate
  if (evsModeSocketInstance) {
    evsModeSocketInstance.off("evs_mode");
    evsModeSocketInstance.disconnect();
    evsModeSocketInstance = null;
  }

  console.log(
    "🚀 [useEvsMode] Creating singleton socket connection for evs_mode listener..."
  );

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

  socketInstance.on("evs_mode", (modeData) => {
    console.log("📥 [useEvsMode] Received evs_mode data:", modeData);
    console.log("📊 [useEvsMode] Data type:", typeof modeData);
    evsModeListeners.forEach((listener) => listener(modeData));
  });

  evsModeSocketInstance = socketInstance;
  return socketInstance;
};

/**
 * Custom hook to manage EVS Mode state
 * Listens to "evs_mode" socket event and provides toggle functionality
 * Uses a singleton socket instance to prevent multiple connections
 */
export const useEvsMode = () => {
  const [evsMode, setEvsMode] = useState<boolean>(false);
  const [hasReceivedData, setHasReceivedData] = useState<boolean>(false);
  const [isSwitchDisabled, setIsSwitchDisabled] = useState<boolean>(false);
  const { emit } = useSocketEmit();

  // Listen to evs_mode socket event (not joining room, just listening)
  useEffect(() => {
    // Get or create the singleton socket instance
    const socketInstance = getEvsModeSocketInstance();

    // Create listener function for this hook instance
    const handleEvsModeData = (modeData: any) => {
      // Handle different data formats:
      // 1. Direct string: "on" or "off"
      // 2. Object with mode property: { mode: "on" }
      // 3. Object with evs_mode property: { evs_mode: "on" }
      let modeValue: string | null = null;
      if (typeof modeData === "string") {
        modeValue = modeData;
      } else if (modeData && typeof modeData === "object") {
        // Check for common property names
        if ("mode" in modeData && typeof modeData.mode === "string") {
          modeValue = modeData.mode;
        } else if (
          "evs_mode" in modeData &&
          typeof modeData.evs_mode === "string"
        ) {
          modeValue = modeData.evs_mode;
        } else {
          // Try to find any string property that might be "on" or "off"
          const values = Object.values(modeData);
          modeValue = values.find((v) => v === "on" || v === "off") as
            | string
            | null;
        }
      }

      const isOn = modeValue === "on";
      console.log("✅ [useEvsMode] Parsed mode value:", modeValue);
      console.log("🔄 [useEvsMode] Setting evsMode to:", isOn);

      // Set both states together - React batches these updates
      // hasReceivedData will only be true after evsMode is set
      setEvsMode(isOn);
      setHasReceivedData(true);

      // Disable switch when EVS mode is ON, enable when OFF (after evac_complete)
      if (isOn) {
        setIsSwitchDisabled(true);
        console.log("🔒 [useEvsMode] Switch disabled - EVS mode is ON");
      } else {
        setIsSwitchDisabled(false);
        console.log("🔓 [useEvsMode] Switch enabled - EVS mode is OFF");
      }
      console.log(
        "✅ [useEvsMode] Data received and state set, UI can now be shown"
      );
    };

    // Register listener
    evsModeListeners.add(handleEvsModeData);

    return () => {
      // Remove listener on unmount
      evsModeListeners.delete(handleEvsModeData);
      // Note: We don't disconnect the socket here because it's shared
      // The socket will be cleaned up when the module is unloaded or explicitly disconnected
    };
  }, []);

  // Handle EVS mode toggle
  const handleEvsModeToggle = useCallback(
    (checked: boolean) => {
      const modeValue = checked ? "on" : "off";
      console.log("🚀 [useEvsMode] Emitting evs_mode toggle:", {
        checked,
        modeValue,
        previousState: evsMode,
      });
      emit("evs_mode", modeValue);
      console.log("✨ [useEvsMode] Emission sent successfully");
    },
    [emit, evsMode]
  );

  return {
    evsMode,
    onEvsModeToggle: handleEvsModeToggle,
    hasReceivedData,
    isSwitchDisabled,
  };
};
