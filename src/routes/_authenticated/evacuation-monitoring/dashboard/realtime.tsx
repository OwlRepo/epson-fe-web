import { EpsonEvsFlame } from "@/assets/svgs";
import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";

import SocketDynamicTable from "@/components/ui/socket-dynamic-table";
import Spinner from "@/components/ui/spinner";

import { usePaginatedTableSocket } from "@/hooks/socket/usePaginatedTableSocket";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";

import EVSCounts from "@/components/ui/evs-counts";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import VisitorEvacueeInfoDialog from "@/components/dialogs/VisitorEvacueeInfoDialog";
import EvacueeInfoDialog from "@/components/dialogs/EvacueeInfoDialog";
import { getIsEVS, getApiSocketBaseUrl } from "@/utils/env";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { useSocketEmit } from "@/hooks/socket/useSocketEmit";
import { io, Socket } from "socket.io-client";

interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  Type?: string;
  Status?: string;
  DeviceName?: string;
  [key: string]: string | undefined;
}

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/realtime"
)({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    page: search.page as string,
    limit: search.limit as string,
    search: search.search as string,
    Type: search.Type as string,
    Status: search.Status as string,
    DeviceName: search.DeviceName as string,
    ...Object.entries(search).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value as string }),
      {}
    ),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({
    from: "/evacuation-monitoring/dashboard/realtime",
  });
  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/dashboard/realtime",
  });

  //employee data
  const [openVisitorDialog, setOpenVisitorDialog] = useState(false);
  const [openEvacueeDialog, setOpenEvacueeDialog] = useState(false);

  const [evacuee, setEvacuee] = useState<any>(null);

  // Missing People toggle state
  const [flaggedRecords, setFlaggedRecords] = useState(false);

  // Accumulated data for Load More pagination
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const previousPageRef = useRef<number>(1);
  const previousParamsRef = useRef<string>("");
  const previousSocketRowsRef = useRef<any[]>([]);

  // Socket emit for dialogs
  const { emit } = useSocketEmit();
  const [visitorResponse, setVisitorResponse] = useState<any>(null);
  const dialogSocketRef = useRef<Socket | null>(null);
  // Refresh key to force table re-render when data updates
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  // Create emitData function for VisitorEvacueeInfoDialog
  const emitData = (event: string, data: any) => {
    emit(event, data);
  };

  // Setup socket listener for get_user response
  useEffect(() => {
    if (!openVisitorDialog && !openEvacueeDialog) {
      // Clean up socket when dialogs are closed
      if (dialogSocketRef.current) {
        dialogSocketRef.current.off("get_user");
        dialogSocketRef.current.disconnect();
        dialogSocketRef.current = null;
      }
      return;
    }

    // Initialize socket connection for dialog responses
    const SOCKET_URL = getApiSocketBaseUrl();
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
      console.log("🟢 [realtime.tsx] Dialog socket connected");
    });

    socketInstance.on("get_user", (data) => {
      console.log("📦 [realtime.tsx] get_user response received:", data);
      setVisitorResponse(data);
    });

    dialogSocketRef.current = socketInstance;

    return () => {
      if (dialogSocketRef.current) {
        dialogSocketRef.current.off("get_user");
        dialogSocketRef.current.disconnect();
        dialogSocketRef.current = null;
      }
    };
  }, [openVisitorDialog, openEvacueeDialog]);

  // Build routeSearch with Missing People filter
  const routeSearchWithFilter = useMemo(() => {
    const baseSearch: Record<string, string | undefined> = {
      ...search,
      Status: flaggedRecords ? "missing" : search.Status || "all",
      page: search.page || "1",
      limit: search.limit || "1000",
      // Ensure all filter keys are explicitly included
      Type: search.Type,
      DeviceName: search.DeviceName,
      search: search.search,
    };
    return baseSearch;
  }, [search, flaggedRecords]);

  // Socket data source
  const {
    data: socketRows,
    counts: socketCounts,
    meta: socketMeta,
    isLoading: isSocketLoading,
    isConnected: isSocketConnected,
  } = usePaginatedTableSocket<any>({
    room: "evs",
    routeSearch: routeSearchWithFilter,
    rowId: "employee_id",
    emitEvent: "evs_search",
    debounceMs: 100, // Reduced debounce for faster filter response
    normalizeParams: (p) => {
      const payload: Record<string, unknown> = {
        page: p.page ? Number(p.page) : 1,
        limit: p.limit ? Number(p.limit) : 1000,
        search: p.search || "",
      };
      // Only include filter values if they exist (not undefined/empty)
      if (p.Type) {
        payload.Type = p.Type;
      }
      if (p.Status) {
        payload.Status = p.Status;
      }
      if (p.DeviceName) {
        payload.DeviceName = p.DeviceName;
      }
      return payload;
    },
  });

  // Accumulate data for Load More pagination
  useEffect(() => {
    if (!socketRows || socketRows.length === 0) {
      // If socketRows becomes empty, clear accumulated data
      if (accumulatedData.length > 0) {
        setAccumulatedData([]);
      }
      return;
    }

    const currentPage = parseInt(search.page || "1");
    const paramsKey = JSON.stringify({
      Status: routeSearchWithFilter.Status,
      Type: routeSearchWithFilter.Type,
      DeviceName: routeSearchWithFilter.DeviceName,
      search: routeSearchWithFilter.search,
    });

    // Check if socketRows actually changed (for live updates)
    const socketRowsChanged =
      previousSocketRowsRef.current.length !== socketRows.length ||
      JSON.stringify(previousSocketRowsRef.current) !==
        JSON.stringify(socketRows);

    // Reset accumulated data if filters/search changed
    if (previousParamsRef.current !== paramsKey) {
      console.log(
        `🔄 [realtime.tsx] Filters/search changed, resetting accumulated data`,
        { paramsKey, socketRowsLength: socketRows.length }
      );
      setAccumulatedData([...socketRows]);
      previousParamsRef.current = paramsKey;
      previousPageRef.current = currentPage;
      previousSocketRowsRef.current = [...socketRows];
      return;
    }

    // If page increased, append new data
    if (currentPage > previousPageRef.current) {
      console.log(`➕ [realtime.tsx] Page increased, appending new data`, {
        fromPage: previousPageRef.current,
        toPage: currentPage,
        newRowsCount: socketRows.length,
      });
      setAccumulatedData((prev) => [...prev, ...socketRows]);
      previousPageRef.current = currentPage;
      previousSocketRowsRef.current = [...socketRows];
    } else if (currentPage < previousPageRef.current) {
      // If page decreased (went back), reset to current page data
      console.log(`⬇️ [realtime.tsx] Page decreased, resetting data`, {
        fromPage: previousPageRef.current,
        toPage: currentPage,
      });
      setAccumulatedData([...socketRows]);
      previousPageRef.current = currentPage;
      previousSocketRowsRef.current = [...socketRows];
    } else if (currentPage === previousPageRef.current) {
      // Same page - could be initial load or live update
      if (currentPage === 1) {
        // For page 1, always sync with socketRows to get fresh data
        // This ensures onData updates and preload refreshes are reflected
        console.log(
          `🔄 [realtime.tsx] Syncing page 1 data (onPreload or onData update)`,
          {
            socketRowsLength: socketRows.length,
            previousAccumulatedLength: accumulatedData.length,
            socketRowsChanged,
            sampleRecord: socketRows[0],
          }
        );
        // Always create new array with new object references to force React re-render
        // This ensures Badge components and other UI elements update properly
        setAccumulatedData(
          socketRows.map((item: any) => {
            // Create a completely new object to ensure React detects the change
            return JSON.parse(JSON.stringify(item));
          })
        );
        previousSocketRowsRef.current = socketRows.map((item: any) => ({
          ...item,
        }));
        // Increment refresh key to force table component re-render
        setTableRefreshKey((prev) => prev + 1);
      } else {
        // For pages > 1, merge updates into accumulated data
        // This handles live updates to records that are already in accumulated data
        setAccumulatedData((prev) => {
          // Create a map of existing records by their ID
          const byId = new Map<string, any>();
          prev.forEach((item: any) => {
            const id =
              item.employee_id || item.ID || item.EmployeeNo || item.epc;
            if (id) byId.set(String(id), item);
          });

          // Update or add new records from socketRows
          socketRows.forEach((newItem: any) => {
            const id =
              newItem.employee_id ||
              newItem.ID ||
              newItem.EmployeeNo ||
              newItem.epc;
            if (id) {
              const existing = byId.get(String(id));
              if (existing) {
                // Update existing record
                byId.set(String(id), { ...existing, ...newItem });
              } else {
                // New record - check if it should be prepended or appended
                const getTimestamp = (item: any) => {
                  return (
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

                const newTimestamp = getTimestamp(newItem);
                const firstTimestamp =
                  prev.length > 0 ? getTimestamp(prev[0]) : null;
                const isLatest =
                  firstTimestamp === null || newTimestamp >= firstTimestamp;

                if (isLatest) {
                  // Prepend to beginning
                  byId.set(String(id), newItem);
                } else {
                  // Append to end
                  byId.set(String(id), newItem);
                }
              }
            }
          });

          // Convert map back to array, maintaining order
          // For prepended items, we need to handle them specially
          const updated = Array.from(byId.values());
          // Sort by timestamp to maintain correct order
          updated.sort((a, b) => {
            const getTimestamp = (item: any) => {
              return (
                (item.date_time ? new Date(item.date_time).getTime() : 0) ||
                (item.EvacuationTime
                  ? new Date(item.EvacuationTime).getTime()
                  : 0) ||
                (item.log_time ? new Date(item.log_time).getTime() : 0) ||
                0
              );
            };
            return getTimestamp(b) - getTimestamp(a); // Descending (newest first)
          });

          return updated;
        });
      }
    }
  }, [socketRows, search.page, routeSearchWithFilter]);

  // Map counts from response format to EVSCounts format
  const countData = useMemo(() => {
    if (!socketCounts) return null;
    return {
      all: socketCounts.all,
      safe: socketCounts.safe,
      injured: socketCounts.injured,
      home: socketCounts.home,
      missing: socketCounts.missing,
    };
  }, [socketCounts]);

  // Handle filter changes
  const handleFilter = (key: string, value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: value || undefined,
        page: "1", // Reset to page 1 on filter change
      }),
      replace: true,
    });
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchTerm || undefined,
        page: "1", // Reset to page 1 on search
      }),
      replace: true,
    });
  };

  // Handle Load More
  const handleLoadMore = async () => {
    const currentPage = parseInt(search.page || "1");
    const nextPage = currentPage + 1;
    navigate({
      search: (prev) => ({
        ...prev,
        page: String(nextPage),
      }),
      replace: true,
    });
  };

  // Handle Missing People toggle
  const handleMissingToggle = (checked: boolean) => {
    setFlaggedRecords(checked);
    navigate({
      search: (prev) => ({
        ...prev,
        Status: checked ? "missing" : "all",
        page: "1", // Reset to page 1 on toggle
      }),
      replace: true,
    });
  };

  return (
    <div className="space-y-8">
      <EVSCounts countData={countData} />
      <CardSection
        headerRight={
          isSocketConnected &&
          !isSocketLoading && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Missing People
              </span>
              <Switch
                id="airplane-mode"
                className="data-[state=checked]:bg-primary-evs"
                checked={flaggedRecords}
                onCheckedChange={handleMissingToggle}
                disabled={!isSocketConnected || isSocketLoading}
              />
            </div>
          )
        }
        headerLeft={
          <CardHeaderLeft
            title={
              <div
                className={cn(
                  "flex items-center space-x-2",
                  getIsEVS() ? "text-primary-evs" : "text-primary"
                )}
              >
                <EpsonEvsFlame />
                <b
                  className={cn(
                    "text-[20px]",
                    getIsEVS() ? "text-primary-evs" : "text-primary"
                  )}
                >
                  Live Data
                </b>
              </div>
            }
            subtitle=""
          />
        }
      >
        {isSocketConnected && !isSocketLoading ? (
          <div className="flex" key={tableRefreshKey}>
            <SocketDynamicTable
              columns={[
                {
                  key: "ID",
                  label: "ID",
                },
                {
                  key: "Name",
                  label: "Name",
                },
                {
                  key: "Type",
                  label: "Type",
                },
                {
                  key: "Status",
                  label: "Status",
                },
                {
                  key: "EvacuationTime",
                  label: "Evacuation Date and Time",
                },
                {
                  key: "device_name",
                  label: "Device Name",
                },
              ]}
              data={accumulatedData
                .map((item: any) => {
                  // Get the raw status value (prioritize updated fields)
                  // Check both Status and eva_status to handle updates
                  const rawStatus = item.eva_status || item.Status || "Unknown";
                  // Ensure we use the most recent status value
                  const status = rawStatus;

                  // Get the most recent date_time value
                  const dateTimeValue =
                    item.date_time || item.EvacuationTime || null;

                  return {
                    ...item,
                    ID: item.ID || item.employee_id || item.EmployeeNo,
                    Name: item.Name || item.full_name,
                    Type: item.Type || item.user_type,
                    // Preserve original fields needed by dialogs
                    employee_id: item.employee_id || item.ID || item.EmployeeNo,
                    full_name: item.full_name || item.Name,
                    user_type: item.user_type || item.Type,
                    eva_status: item.eva_status || item.Status,
                    raw_status: status, // Needed by dialogs - use the actual status value
                    epc: item.epc, // Needed for epc_eva_updates
                    remarks: item.remarks || item.Remarks || "",
                    date_time: dateTimeValue, // Preserve the most recent date_time
                    log_time: item.log_time,
                    Status: (
                      <Badge
                        key={`${item.epc || item.employee_id || item.ID}-${status}-${dateTimeValue}`}
                        className={cn(
                          `rounded-full border`,
                          status === "Missing" &&
                            "border-red-200 border bg-red-50 text-red-500 hover:text-white hover:bg-red-500/80",
                          status === "Safe" &&
                            "border-green-200 border bg-green-50 text-green-500 hover:text-white hover:bg-green-500/80",
                          status === "Injured" &&
                            "border-yellow-200 border bg-yellow-50 text-yellow-500 hover:text-white hover:bg-yellow-500/80",
                          status === "Home" &&
                            "border-blue-200 border bg-blue-50 text-blue-500 hover:text-white hover:bg-blue-500/80"
                        )}
                        variant="default"
                      >
                        {status}
                      </Badge>
                    ),
                    EvacuationTime: dateTimeValue
                      ? dayjs(dateTimeValue).format("MMM D, YYYY hh:mm a")
                      : null,
                    device_name: item.device_name || item.DeviceName || "",
                  };
                })
                .sort((a, b) => {
                  const dateA = new Date(a.date_time || 0).getTime();
                  const dateB = new Date(b.date_time || 0).getTime();
                  return dateB - dateA; // Descending order (newest first)
                })}
              filters={[
                {
                  key: "Type",
                  label: "Type",
                  options: Array.from(
                    new Set(
                      accumulatedData.map(
                        (item: any) => item.Type || item.user_type
                      )
                    )
                  )
                    .filter(Boolean)
                    .map((item) => ({
                      label: item,
                      value: item,
                    })),
                },
                {
                  key: "Status",
                  label: "Status",
                  options: [
                    {
                      label: "Total Evacuees",
                      value: "Safe",
                    },
                    ...["Injured", "Home", "Missing"].map((item) => ({
                      label: item,
                      value: item,
                    })),
                  ],
                },
                {
                  key: "DeviceName",
                  label: "Device Name",
                  options: Array.from(
                    new Set(
                      accumulatedData.map(
                        (item: any) => item.device_name || item.DeviceName
                      )
                    )
                  )
                    .filter(Boolean)
                    .map((item) => ({
                      label: item,
                      value: item,
                    })),
                },
              ]}
              isLoading={isSocketLoading}
              onRowClick={(row) => {
                // Ensure all required fields are present for dialogs
                const evacueeData = {
                  ...row,
                  employee_id: row.employee_id || row.ID || row.EmployeeNo,
                  raw_status: row.raw_status || row.Status || row.eva_status,
                  epc: row.epc,
                  remarks: row.remarks || row.Remarks || "",
                  type: row.Type || row.user_type || row.type,
                };
                setEvacuee(evacueeData);
                const type = evacueeData.type;
                if (type === "Employee") {
                  setOpenEvacueeDialog(true);
                } else {
                  setOpenVisitorDialog(true);
                }
              }}
              onSearch={handleSearch}
              routeSearch={routeSearchWithFilter}
              onFilter={handleFilter}
              onLoadMore={handleLoadMore}
              isLoadingMore={false}
              totalCount={socketMeta?.totalItems}
              tableId="evs-table"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10">
            <Spinner />
            <p>Loading...</p>
          </div>
        )}
      </CardSection>
      {openVisitorDialog && (
        <VisitorEvacueeInfoDialog
          open={openVisitorDialog}
          evacuee={evacuee}
          onOpenChange={(open) => {
            setOpenVisitorDialog(open);
            if (!open) {
              // Clear response when dialog closes
              setVisitorResponse(null);
            }
          }}
          emitData={emitData}
          response={visitorResponse}
          isLoading={false}
        />
      )}
      {openEvacueeDialog && (
        <EvacueeInfoDialog
          open={openEvacueeDialog}
          evacuee={evacuee}
          onOpenChange={setOpenEvacueeDialog}
        />
      )}
    </div>
  );
}
