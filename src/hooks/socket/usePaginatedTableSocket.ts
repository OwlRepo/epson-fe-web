import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SummaryCountData } from "@/hooks/useSocket";
import { createTableSocket } from "@/sockets/baseTableSocket";

export interface UsePaginatedTableSocketParams {
  room: string;
  routeSearch: Record<string, string | undefined>;
  rowId?: string;
  debounceMs?: number;
  normalizeParams?: (
    params: Record<string, string | undefined>
  ) => Record<string, unknown>;
  // Event name to emit query/filter updates to (separate from joined room)
  emitEvent?: string; // default: "filters"
}

export interface PaginatedMeta {
  totalItems: number;
  totalPages: number;
}

export function usePaginatedTableSocket<T extends Record<string, any>>({
  room,
  routeSearch,
  rowId = "ID",
  debounceMs = 300,
  normalizeParams,
  emitEvent,
}: UsePaginatedTableSocketParams) {
  const [data, setData] = useState<T[]>([]);
  const [counts, setCounts] = useState<SummaryCountData | null>(null);
  const [meta, setMeta] = useState<PaginatedMeta>({
    totalItems: 0,
    totalPages: 1,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [asof, setAsof] = useState<string | null>(null);
  const socketApiRef = useRef<ReturnType<typeof createTableSocket> | null>(
    null
  );
  const emitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevParamsStr = useRef<string | null>(null);
  const connectedLoggedRef = useRef<boolean>(false);

  const effectiveParams = useMemo(() => {
    try {
      const raw = routeSearch || {};
      const normalized = (
        normalizeParams ? normalizeParams(raw) : raw
      ) as Record<string, unknown>;
      return normalized;
    } catch {
      return routeSearch as unknown as Record<string, unknown>;
    }
  }, [routeSearch, normalizeParams]);

  useEffect(() => {
    // Skip socket initialization if no room provided (e.g., inactive tab)
    if (!room) {
      setIsLoading(false);
      setIsConnected(false);
      return;
    }

    setIsLoading(true);

    socketApiRef.current = createTableSocket({
      room,
      emitEvent,
      handlers: {
        onConnect: () => {
          if (!connectedLoggedRef.current) {
            console.log(
              "🟢 [usePaginatedTableSocket] Socket connected (first time)"
            );
            connectedLoggedRef.current = true;
          }
          setIsConnected(true);
          setIsLoading(false);
        },
        onDisconnect: () => {
          console.log("🔌 Socket disconnected from server");
          setIsConnected(false);
        },
        onConnectError: () => {
          console.error("🔴 [usePaginatedTableSocket] Socket connect error");
          setIsConnected(false);
          setIsLoading(false);
        },
        onPreload: (payload) => {
          console.log("📦 [usePaginatedTableSocket] Preload data received", {
            isArray: Array.isArray(payload),
            length: Array.isArray(payload)
              ? (payload as any[]).length
              : undefined,
          });
          if (Array.isArray(payload)) {
            setData(payload as T[]);
          } else if (payload && typeof payload === "object") {
            // allow server to send shape { data, totalItems, totalPages }
            const p = payload as any;
            if (Array.isArray(p?.data)) {
              setData(p.data as T[]);
            }
            if (
              typeof p?.totalItems === "number" ||
              typeof p?.totalPages === "number"
            ) {
              console.log("🧭 [usePaginatedTableSocket] Preload meta:", {
                totalItems: p?.totalItems,
                totalPages: p?.totalPages,
              });
              setMeta({
                totalItems: Number(p?.totalItems) || 0,
                totalPages: Number(p?.totalPages) || 1,
              });
            }
          }
          setIsLoading(false);
        },
        onData: (payload) => {
          console.log("🔄 [usePaginatedTableSocket] Live data received", {
            isArray: Array.isArray(payload),
            length: Array.isArray(payload) ? (payload as any[]).length : 1,
          });
          if (!payload) return;
          // Support single row or batch
          const rows: T[] = Array.isArray(payload)
            ? (payload as T[])
            : [payload as T];
          setData((prev) => {
            const byId = new Map<string, T>();
            prev.forEach((r) => byId.set(String(r[rowId]), r));
            rows.forEach((next) => {
              const key = String(next[rowId]);
              if (byId.has(key)) {
                byId.set(key, { ...byId.get(key), ...next });
              } else {
                byId.set(key, next);
              }
            });
            return Array.from(byId.values());
          });
        },
        onRemoveData: (payload) => {
          console.log(
            "🗑️ [usePaginatedTableSocket] Remove data received:",
            payload
          );
          setData((prev) => {
            const value = payload as any;
            return prev.filter(
              (r) => String(r[rowId]) !== String(value?.[rowId] ?? value)
            );
          });
        },
        onCount: (payload) => {
          console.log(
            "📊 [usePaginatedTableSocket] Count data received:",
            payload
          );
          const c = payload as any;
          // Accept both SummaryCountData and extended pagination meta
          setCounts((prev) => ({
            ...prev,
            in: c?.in,
            out: c?.out,
            total: c?.total,
            inside: c?.inside,
            safe: c?.safe,
            injured: c?.injured,
            home: c?.home,
            missing: c?.missing,
            all: c?.all,
            active: c?.active,
            inactive: c?.inactive,
            online: c?.online,
            offline: c?.offline,
            nolocation: c?.nolocation,
            unregister: c?.unregister,
          }));
          if (
            typeof c?.totalItems === "number" ||
            typeof c?.totalPages === "number"
          ) {
            console.log("🧭 [usePaginatedTableSocket] Meta from count:", {
              totalItems: c?.totalItems,
              totalPages: c?.totalPages,
            });
            setMeta({
              totalItems: Number(c?.totalItems) || 0,
              totalPages: Number(c?.totalPages) || 1,
            });
          }
        },
        onAsof: (payload) => setAsof(String(payload)),
      },
    });

    return () => {
      if (emitTimerRef.current) {
        clearTimeout(emitTimerRef.current);
        emitTimerRef.current = null;
      }
      socketApiRef.current?.dispose();
      socketApiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  // Emit normalized params whenever routeSearch changes (debounced)
  useEffect(() => {
    // Stringify once for deep-compare
    const nextParamsStr = JSON.stringify(effectiveParams);

    // Skip if params did not actually change
    if (prevParamsStr.current === nextParamsStr) {
      return;
    }
    if (!socketApiRef.current) return;
    if (emitTimerRef.current) {
      clearTimeout(emitTimerRef.current);
      emitTimerRef.current = null;
    }
    emitTimerRef.current = setTimeout(() => {
      socketApiRef.current?.emitFilters(effectiveParams);
      // Save the latest emitted params snapshot
      prevParamsStr.current = nextParamsStr;
    }, debounceMs);

    return () => {
      if (emitTimerRef.current) {
        clearTimeout(emitTimerRef.current);
        emitTimerRef.current = null;
      }
    };
  }, [effectiveParams, debounceMs]);

  const clear = useCallback(() => {
    setData([]);
  }, []);

  return {
    data,
    counts,
    meta,
    asof,
    isConnected,
    isLoading,
    clear,
  };
}
