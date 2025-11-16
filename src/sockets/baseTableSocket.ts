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
}

export function createTableSocket({
  room,
  handlers,
  extraHeaders,
}: CreateTableSocketOptions) {
  const SOCKET_URL = getApiSocketBaseUrl();

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
    handlers?.onConnect?.(socket);
    socket.emit("join", room);
  });

  socket.on("disconnect", () => {
    handlers?.onDisconnect?.();
  });

  socket.on("connect_error", (err) => {
    const error =
      err instanceof Error
        ? err
        : new Error((err as any)?.message || String(err));
    handlers?.onConnectError?.(error);
  });

  socket.on("preload", (payload) => handlers?.onPreload?.(payload));
  socket.on("data", (payload) => handlers?.onData?.(payload));
  socket.on("remove_data", (payload) => handlers?.onRemoveData?.(payload));
  socket.on("count", (payload) => handlers?.onCount?.(payload));
  socket.on("asof", (payload) => handlers?.onAsof?.(payload));

  function emitFilters(params: Record<string, unknown>) {
    socket.emit("filters", params);
  }

  function changeRoom(newRoom: string) {
    socket.emit("room", newRoom);
  }

  function dispose() {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("connect_error");
    socket.off("preload");
    socket.off("data");
    socket.off("remove_data");
    socket.off("count");
    socket.off("asof");
    socket.disconnect();
  }

  return {
    socket,
    emitFilters,
    changeRoom,
    dispose,
  };
}
