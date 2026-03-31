import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { getApiSocketBaseUrl } from "@/utils/env";
import { io, type Socket } from "socket.io-client";
import { useSocketEmit } from "./socket/useSocketEmit";

const SOCKET_URL = getApiSocketBaseUrl();

export type SyncReadinessStatus = "unknown" | "pending" | "ready";

export type EvsReadinessState = {
  status: SyncReadinessStatus;
  hasPendingData: boolean | null;
  pendingCount: number | null;
  statusMessage: string;
  updatedAt: string | null;
};

export type UseEvsModeOptions = {
  readinessRoom?: string;
  readinessEvent?: string;
  enabled?: boolean;
};

export type UseEvsModeResult = {
  evsMode: boolean;
  onEvsModeToggle: (checked: boolean) => void;
  hasReceivedData: boolean;
  isSwitchDisabled: boolean;
  readiness: EvsReadinessState;
  hasReceivedReadiness: boolean;
  canCompleteEvacuation: boolean;
  showPersistentReadinessNotice: boolean;
  dismissReadinessNotice: () => void;
  acknowledgeReadinessOnComplete: () => void;
};

const DEFAULT_READINESS: EvsReadinessState = {
  status: "unknown",
  hasPendingData: null,
  pendingCount: null,
  statusMessage: "",
  updatedAt: null,
};

// Module-level singleton socket instance for evs_mode + readiness listeners
let evsModeSocketInstance: Socket | null = null;
let evsModeListeners: Set<(data: unknown) => void> = new Set();
let readinessListeners: Set<(data: unknown) => void> = new Set();

function parseReadinessPayload(data: unknown): EvsReadinessState {
  if (data == null || typeof data !== "object") {
    return {
      ...DEFAULT_READINESS,
      statusMessage: "Invalid sync status",
    };
  }
  const o = data as Record<string, unknown>;
  const hasPending =
    o.has_pending_data !== undefined
      ? Boolean(o.has_pending_data)
      : o.hasPendingData !== undefined
        ? Boolean(o.hasPendingData)
        : null;

  const pendingCountRaw = o.pending_count ?? o.pendingCount;
  let pendingCount: number | null = null;
  if (typeof pendingCountRaw === "number" && !Number.isNaN(pendingCountRaw)) {
    pendingCount = pendingCountRaw;
  } else if (pendingCountRaw != null && pendingCountRaw !== "") {
    const n = Number(pendingCountRaw);
    pendingCount = Number.isNaN(n) ? null : n;
  }

  const statusMessage =
    typeof o.status_message === "string"
      ? o.status_message
      : typeof o.statusMessage === "string"
        ? o.statusMessage
        : "";

  const updatedAt =
    typeof o.updated_at === "string"
      ? o.updated_at
      : typeof o.updatedAt === "string"
        ? o.updatedAt
        : null;

  let status: SyncReadinessStatus = "unknown";
  if (hasPending === true) {
    status = "pending";
  } else if (hasPending === false) {
    status = "ready";
  } else if (pendingCount !== null && pendingCount > 0) {
    status = "pending";
  } else if (pendingCount !== null && pendingCount === 0 && hasPending === null) {
    status = "ready";
  }

  return {
    status,
    hasPendingData: hasPending,
    pendingCount,
    statusMessage,
    updatedAt,
  };
}

/**
 * Get or create the singleton socket instance for evs_mode and readiness.
 */
const getEvsModeSocketInstance = (
  readinessRoom = "evs_readiness",
  readinessEventName = "evs_readiness_status"
): Socket => {
  if (evsModeSocketInstance?.connected) {
    return evsModeSocketInstance;
  }

  if (evsModeSocketInstance) {
    evsModeSocketInstance.off("evs_mode");
    evsModeSocketInstance.off(readinessEventName);
    evsModeSocketInstance.disconnect();
    evsModeSocketInstance = null;
  }

  console.log(
    "🚀 [useEvsMode] Creating singleton socket connection for evs_mode + readiness..."
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
    evsModeListeners.forEach((listener) => listener(modeData));
  });

  socketInstance.on(readinessEventName, (payload) => {
    console.log("📥 [useEvsMode] Received readiness data:", payload);
    readinessListeners.forEach((fn) => fn(payload));
  });

  socketInstance.on("connect", () => {
    console.log("🚪 [useEvsMode] Joining readiness room:", readinessRoom);
    socketInstance.emit("join", readinessRoom);
  });

  evsModeSocketInstance = socketInstance;
  return socketInstance;
};

/**
 * Custom hook to manage EVS Mode state and evacuation sync readiness.
 */
export const useEvsMode = (
  options?: UseEvsModeOptions
): UseEvsModeResult => {
  const readinessRoom = options?.readinessRoom ?? "evs_readiness";
  const readinessEvent = options?.readinessEvent ?? "evs_readiness_status";
  const enabled = options?.enabled ?? true;

  const [evsMode, setEvsMode] = useState<boolean>(false);
  const [hasReceivedData, setHasReceivedData] = useState<boolean>(false);
  const [isSwitchDisabled, setIsSwitchDisabled] = useState<boolean>(false);

  const [readiness, setReadiness] = useState<EvsReadinessState>(DEFAULT_READINESS);
  const [hasReceivedReadiness, setHasReceivedReadiness] =
    useState<boolean>(false);
  const [showPersistentReadinessNotice, setShowPersistentReadinessNotice] =
    useState(false);

  const prevStatusRef = useRef<SyncReadinessStatus>("unknown");

  const { emit } = useSocketEmit();

  // Listen to evs_mode socket event
  useEffect(() => {
    if (!enabled) return;

    const socketInstance = getEvsModeSocketInstance(
      readinessRoom,
      readinessEvent
    );

    const handleEvsModeData = (modeData: unknown) => {
      let modeValue: string | null = null;
      if (typeof modeData === "string") {
        modeValue = modeData;
      } else if (modeData && typeof modeData === "object") {
        const md = modeData as Record<string, unknown>;
        if ("mode" in md && typeof md.mode === "string") {
          modeValue = md.mode;
        } else if ("evs_mode" in md && typeof md.evs_mode === "string") {
          modeValue = md.evs_mode;
        } else {
          const values = Object.values(md);
          modeValue = values.find((v) => v === "on" || v === "off") as
            | string
            | null;
        }
      }

      const isOn = modeValue === "on";
      console.log("✅ [useEvsMode] Parsed mode value:", modeValue);

      setEvsMode(isOn);
      setHasReceivedData(true);

      if (isOn) {
        setIsSwitchDisabled(true);
      } else {
        setIsSwitchDisabled(false);
      }
    };

    evsModeListeners.add(handleEvsModeData);

    return () => {
      evsModeListeners.delete(handleEvsModeData);
    };
  }, [enabled, readinessRoom, readinessEvent]);

  // Readiness status
  useEffect(() => {
    if (!enabled) return;

    getEvsModeSocketInstance(readinessRoom, readinessEvent);

    const handleReadiness = (data: unknown) => {
      const next = parseReadinessPayload(data);
      setReadiness(next);
      setHasReceivedReadiness(true);
    };

    readinessListeners.add(handleReadiness);

    return () => {
      readinessListeners.delete(handleReadiness);
    };
  }, [enabled, readinessRoom, readinessEvent]);

  // Persistent notice: show when transitioning to ready; hide when pending
  useEffect(() => {
    const prev = prevStatusRef.current;
    if (readiness.status === "ready" && prev !== "ready") {
      setShowPersistentReadinessNotice(true);
    }
    if (readiness.status === "pending") {
      setShowPersistentReadinessNotice(false);
    }
    prevStatusRef.current = readiness.status;
  }, [readiness.status]);

  const dismissReadinessNotice = useCallback(() => {
    setShowPersistentReadinessNotice(false);
  }, []);

  const acknowledgeReadinessOnComplete = useCallback(() => {
    setShowPersistentReadinessNotice(false);
  }, []);

  const canCompleteEvacuation =
    hasReceivedReadiness && readiness.status === "ready";

  const handleEvsModeToggle = useCallback(
    (checked: boolean) => {
      const modeValue = checked ? "on" : "off";
      console.log("🚀 [useEvsMode] Emitting evs_mode toggle:", {
        checked,
        modeValue,
        previousState: evsMode,
      });
      emit("evs_mode", modeValue);
    },
    [emit, evsMode]
  );

  return {
    evsMode,
    onEvsModeToggle: handleEvsModeToggle,
    hasReceivedData,
    isSwitchDisabled,
    readiness,
    hasReceivedReadiness,
    canCompleteEvacuation,
    showPersistentReadinessNotice,
    dismissReadinessNotice,
    acknowledgeReadinessOnComplete,
  };
};
