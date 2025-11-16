import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SummaryCountData } from "@/hooks/useSocket";
import { createTableSocket } from "@/sockets/baseTableSocket";

export interface UsePaginatedTableSocketParams<T extends Record<string, any>> {
  room: string;
  routeSearch: Record<string, string | undefined>;
  rowId?: string;
  debounceMs?: number;
  normalizeParams?: (
    params: Record<string, string | undefined>
  ) => Record<string, unknown>;
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
}: UsePaginatedTableSocketParams<T>) {
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

  const effectiveParams = useMemo(() => {
    try {
      const raw = routeSearch || {};
      return (normalizeParams ? normalizeParams(raw) : raw) as Record<
        string,
        unknown
      >;
    } catch {
      return routeSearch as unknown as Record<string, unknown>;
    }
  }, [routeSearch, normalizeParams]);

  useEffect(() => {
    setIsLoading(true);

    socketApiRef.current = createTableSocket({
      room,
      handlers: {
        onConnect: () => {
          setIsConnected(true);
          setIsLoading(false);
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
        onConnectError: () => {
          setIsConnected(false);
          setIsLoading(false);
        },
        onPreload: (payload) => {
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
              setMeta({
                totalItems: Number(p?.totalItems) || 0,
                totalPages: Number(p?.totalPages) || 1,
              });
            }
          }
          setIsLoading(false);
        },
        onData: (payload) => {
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
          setData((prev) => {
            const value = payload as any;
            return prev.filter(
              (r) => String(r[rowId]) !== String(value?.[rowId] ?? value)
            );
          });
        },
        onCount: (payload) => {
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
    if (!socketApiRef.current) return;
    if (emitTimerRef.current) {
      clearTimeout(emitTimerRef.current);
      emitTimerRef.current = null;
    }
    emitTimerRef.current = setTimeout(() => {
      socketApiRef.current?.emitFilters(effectiveParams);
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
