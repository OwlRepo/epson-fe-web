import { io, Socket } from "socket.io-client";
import { getApiSocketBaseUrl } from "@/utils/env";

export type TableSocketHandlers = {
  onConnect?: (socket: Socket) => void;
  onDisconnect?: () => void;
  onConnectError?: (error: Error) => void;
  onPreload?: (payload: unknown) => void;
  onData?: (payload: unknown) => void;
  onRemoveData?: (payload: unknown) => void;
  onCount?: (payload: unknown) => void;
  onAsof?: (payload: unknown) => void;
};

export interface CreateTableSocketOptions {
  room: string;
  handlers?: TableSocketHandlers;
  extraHeaders?: Record<string, string>;
  // Event name to emit query/filter updates to (separate from joined room)
  emitEvent?: string; // default: "filters"
}

function safeCall(label: string, fn: () => void) {
  try {
    fn();
  } catch (e) {
    console.error(`[TableSocket] ${label} handler error`, e);
  }
}

export function createTableSocket({
  room,
  handlers,
  extraHeaders,
  emitEvent = "filters",
}: CreateTableSocketOptions) {
  const SOCKET_URL = getApiSocketBaseUrl();

  // Initialization logs
  console.log("🧩 [TableSocket] Creating socket instance...");
  console.log("🔌 [TableSocket] Socket URL:", SOCKET_URL);
  console.log("🚪 [TableSocket] Target room to join:", room);
  console.log("📨 [TableSocket] Emit event for filters:", emitEvent);

  const socket = io(SOCKET_URL, {
    extraHeaders: {
      "ngrok-skip-browser-warning": "true",
      ...(extraHeaders || {}),
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("🟢 [TableSocket] Connected:", socket.id);
    safeCall("onConnect", () => handlers?.onConnect?.(socket));
    console.log(`🚪 [TableSocket] Joining room: "${room}"`);
    try {
      socket.emit("join", room);
    } catch (e) {
      console.error(`[TableSocket] join emit failed for room "${room}"`, e);
    }
    console.log(`✅ [TableSocket] Joined room: "${room}"`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected from server");
    safeCall("onDisconnect", () => handlers?.onDisconnect?.());
  });

  socket.on("connect_error", (err) => {
    const error =
      err instanceof Error
        ? err
        : new Error((err as any)?.message || String(err));
    console.error("🔴 [TableSocket] Connection error:", error.message);
    safeCall("onConnectError", () => handlers?.onConnectError?.(error));
  });

  socket.on("error", (err) => {
    console.warn("[TableSocket] Socket error event:", err);
  });

  socket.on("preload", (payload) => {
    console.log("📦 [TableSocket] Preload received:", {
      isArray: Array.isArray(payload),
      length: Array.isArray(payload) ? (payload as any[]).length : undefined,
      payload: payload,
    });
    safeCall("onPreload", () => handlers?.onPreload?.(payload));
  });
  socket.on("data", (payload) => {
    console.log("🔄 [TableSocket] Data update received:", {
      isArray: Array.isArray(payload),
      length: Array.isArray(payload) ? (payload as any[]).length : undefined,
    });
    safeCall("onData", () => handlers?.onData?.(payload));
  });
  socket.on("remove_data", (payload) => {
    console.log("🗑️ [TableSocket] Remove data received:", payload);
    safeCall("onRemoveData", () => handlers?.onRemoveData?.(payload));
  });
  socket.on("count", (payload) => {
    console.log("📊 [TableSocket] Count received:", payload);
    safeCall("onCount", () => handlers?.onCount?.(payload));
  });
  socket.on("asof", (payload) => {
    // console.log("⏱️ [TableSocket] Asof received:", payload);
    safeCall("onAsof", () => handlers?.onAsof?.(payload));
  });

  function emitFilters(
    params: Record<string, unknown>,
    overrideEvent?: string
  ) {
    const event = overrideEvent || emitEvent;
    console.log("🚀 [TableSocket] Emitting filters:", { event, params });
    try {
      if (!socket.connected) {
        console.warn("[TableSocket] Skipping emit — socket not connected");
        return;
      }
      socket.emit(event, params);
    } catch (e) {
      console.error("[TableSocket] emitFilters failed", e);
    }
  }

  function changeRoom(newRoom: string) {
    console.log(`🔄 [TableSocket] Changing room: "${room}" → "${newRoom}"`);
    socket.emit("room", newRoom);
  }

  function dispose() {
    console.log(
      "🧹 [TableSocket] Disposing socket listeners and disconnecting..."
    );
    socket.off("connect");
    socket.off("disconnect");
    socket.off("connect_error");
    socket.off("error");
    socket.off("preload");
    socket.off("data");
    socket.off("remove_data");
    socket.off("count");
    socket.off("asof");
    socket.disconnect();
    console.log("✅ [TableSocket] Disposed successfully");
  }

  return {
    socket,
    emitFilters,
    changeRoom,
    dispose,
  };
}
