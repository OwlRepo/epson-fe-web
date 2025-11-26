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
              typeof p?.pagination?.totalItems === "number" ||
              typeof p?.pagination?.totalPages === "number"
            ) {
              console.log("🧭 [usePaginatedTableSocket] Preload meta:", {
                totalItems: p?.pagination?.totalItems,
                totalPages: p?.pagination?.totalPages,
              });
              setMeta({
                totalItems: Number(p?.pagination?.totalItems) || 0,
                totalPages: Number(p?.pagination?.totalPages) || 1,
              });
            }
          }
          setIsLoading(false);
        },
        onData: (payload) => {
          console.log("🔄 [usePaginatedTableSocket] Live data received", {
            isArray: Array.isArray(payload),
            length: Array.isArray(payload) ? (payload as any[]).length : 1,
            payload,
          });
          if (!payload) return;
          // Support single row or batch
          const rows: T[] = Array.isArray(payload)
            ? (payload as T[])
            : [payload as T];

          setData((prev) => {
            if (!prev || prev.length === 0) {
              console.log(
                "✅ [usePaginatedTableSocket] Adding first records to empty state",
                { count: rows.length, data: rows }
              );
              return rows;
            }

            const updatedData = rows.reduce(
              (acc, newRow) => {
                const newRowAny = newRow as any;

                // Determine the key to match records by
                // Try multiple ID strategies similar to useSocket.ts
                const findExistingIndex = () => {
                  // Log current array state for debugging
                  console.log(
                    `🔍 [usePaginatedTableSocket] Searching for existing record in array of ${acc.length} items`,
                    {
                      newRowIds: {
                        epc: newRowAny.epc,
                        [rowId]: newRowAny[rowId],
                        employee_id: newRowAny.employee_id,
                        ID: newRowAny.ID,
                        EmployeeNo: newRowAny.EmployeeNo,
                      },
                      sampleExistingItems: acc.slice(0, 3).map((item: any) => ({
                        epc: item.epc,
                        [rowId]: item[rowId],
                        employee_id: item.employee_id,
                        ID: item.ID,
                        EmployeeNo: item.EmployeeNo,
                      })),
                    }
                  );

                  // Strategy 1: For evacuation monitoring, check epc first (most reliable)
                  if (newRowAny.epc) {
                    const epcToMatch = String(newRowAny.epc).trim();
                    const index = acc.findIndex((item) => {
                      const itemEpc = String((item as any).epc || "").trim();
                      const matches = itemEpc === epcToMatch;
                      if (matches) {
                        console.log(
                          `✅ [usePaginatedTableSocket] EPC match found:`,
                          { epcToMatch, itemEpc, item }
                        );
                      }
                      return matches;
                    });
                    if (index !== -1) {
                      console.log(
                        `🔍 [usePaginatedTableSocket] Found existing record by epc:`,
                        epcToMatch,
                        { existingItem: acc[index], index }
                      );
                      return index;
                    }
                  }

                  // Strategy 2: Use rowId field (primary)
                  if (newRowAny[rowId]) {
                    const rowIdValue = String(newRowAny[rowId]).trim();
                    const index = acc.findIndex(
                      (item) =>
                        String((item as any)[rowId] || "").trim() === rowIdValue
                    );
                    if (index !== -1) {
                      console.log(
                        `🔍 [usePaginatedTableSocket] Found existing record by ${rowId}:`,
                        rowIdValue,
                        { existingItem: acc[index] }
                      );
                      return index;
                    }
                  }

                  // Strategy 3: Check employee_id (with cross-field matching)
                  if (newRowAny.employee_id) {
                    const empIdToMatch = String(newRowAny.employee_id).trim();
                    const index = acc.findIndex((item) => {
                      const itemAny = item as any;
                      return (
                        String(itemAny.employee_id || "").trim() ===
                          empIdToMatch ||
                        String(itemAny.ID || "").trim() === empIdToMatch ||
                        String(itemAny.EmployeeNo || "").trim() === empIdToMatch
                      );
                    });
                    if (index !== -1) {
                      console.log(
                        `🔍 [usePaginatedTableSocket] Found existing record by employee_id:`,
                        empIdToMatch,
                        { existingItem: acc[index] }
                      );
                      return index;
                    }
                  }

                  // Strategy 4: Check ID or EmployeeNo (with cross-field matching)
                  if (newRowAny.ID || newRowAny.EmployeeNo) {
                    const idToMatch = String(
                      newRowAny.ID || newRowAny.EmployeeNo
                    ).trim();
                    const index = acc.findIndex((item) => {
                      const itemAny = item as any;
                      return (
                        String(itemAny.ID || "").trim() === idToMatch ||
                        String(itemAny.EmployeeNo || "").trim() === idToMatch ||
                        String(itemAny.employee_id || "").trim() === idToMatch
                      );
                    });
                    if (index !== -1) {
                      console.log(
                        `🔍 [usePaginatedTableSocket] Found existing record by ID/EmployeeNo:`,
                        idToMatch,
                        { existingItem: acc[index] }
                      );
                      return index;
                    }
                  }

                  console.log(
                    `❌ [usePaginatedTableSocket] No existing record found for:`,
                    {
                      epc: newRowAny.epc,
                      [rowId]: newRowAny[rowId],
                      employee_id: newRowAny.employee_id,
                      ID: newRowAny.ID,
                      EmployeeNo: newRowAny.EmployeeNo,
                      newData: newRowAny,
                    }
                  );
                  return -1;
                };

                const existingIndex = findExistingIndex();

                if (existingIndex !== -1) {
                  // Update existing record - create completely new object reference
                  // to ensure React detects the change and re-renders components
                  const oldRecord = acc[existingIndex];

                  // Create a completely new object with merged data
                  // This ensures React detects the change even if nested properties change
                  const updatedRecord = JSON.parse(
                    JSON.stringify({ ...oldRecord, ...newRow })
                  );

                  console.log(
                    `🔄 [usePaginatedTableSocket] Updating existing record at index ${existingIndex}`,
                    {
                      oldData: oldRecord,
                      newData: newRow,
                      updatedRecord,
                      matchKey:
                        newRowAny[rowId] ||
                        newRowAny.epc ||
                        newRowAny.employee_id ||
                        newRowAny.ID ||
                        newRowAny.EmployeeNo,
                    }
                  );

                  // Replace with new object reference
                  acc[existingIndex] = updatedRecord;

                  // Continue with reduce - don't return early
                  return acc;
                } else {
                  // New record - determine if it should be prepended or appended based on timestamp
                  const getTimestamp = (item: any) => {
                    return (
                      (item.date_receive
                        ? new Date(item.date_receive).getTime()
                        : null) ||
                      (item.date_time
                        ? new Date(item.date_time).getTime()
                        : null) ||
                      (item.EvacuationTime
                        ? new Date(item.EvacuationTime).getTime()
                        : null) ||
                      (item.log_time
                        ? new Date(item.log_time).getTime()
                        : null) ||
                      Date.now()
                    );
                  };

                  const newTimestamp = getTimestamp(newRowAny);
                  const firstItemTimestamp =
                    acc.length > 0 ? getTimestamp(acc[0]) : null;

                  // If new record is latest (or first item), prepend; otherwise append
                  const isLatest =
                    firstItemTimestamp === null ||
                    newTimestamp >= firstItemTimestamp;

                  if (isLatest) {
                    console.log(
                      `➕ [usePaginatedTableSocket] Prepending new latest record`,
                      {
                        newData: newRow,
                        timestamp: newTimestamp,
                        firstItemTimestamp,
                      }
                    );
                    return [newRow, ...acc];
                  } else {
                    console.log(
                      `➕ [usePaginatedTableSocket] Appending new older record`,
                      {
                        newData: newRow,
                        timestamp: newTimestamp,
                        firstItemTimestamp,
                      }
                    );
                    return [...acc, newRow];
                  }
                }
              },
              [...prev]
            );

            // Always return a new array reference with deep-cloned objects
            // This ensures React detects changes and re-renders components (like Badge)
            const finalData = updatedData.map((item) =>
              JSON.parse(JSON.stringify(item))
            );

            console.log(`✅ [usePaginatedTableSocket] Data updated`, {
              previousLength: prev.length,
              newLength: finalData.length,
              recordsProcessed: rows.length,
              dataChanged: prev.length !== finalData.length,
            });
            return finalData;
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
