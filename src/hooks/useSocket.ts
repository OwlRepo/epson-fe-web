import { getApiSocketBaseUrl } from "@/utils/env";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useLocation } from "@tanstack/react-router";
import useToastStyleTheme from "./useToastStyleTheme";
import { toast } from "sonner";
import type { Device } from "@/components/dialogs/DeviceInfoDialog";
import {
  storePreloadData,
  getTopRecords,
  getNextBatch,
  updateData as updateIndexedDbData,
  searchData as searchIndexedDbData,
  clearData as clearIndexedDbData,
  getTotalCount,
  getLatestTimestamp,
} from "@/utils/indexedDbStorage";

// Define types for our data
export interface SummaryData extends DeviceData {
  device_id: string;
  name: string;
  in: string; // Total Count
  out: string; // Total Count
  inside: string; // Optional, only for summary data
  evacuated: string;
  missing: string;
  injured: string;
  safe: string;
  home: string;
  all: string;
  active: string;
  inactive: string;
  Department: string;
}

export interface SummaryCountData {
  in: number | string; // Total Count
  out: number | string; // Total Count
  total?: number | string; // Optional, only for summary data
  inside?: number | string; // Optional, only for summary data
  safe?: number | string;
  injured?: number | string;
  home?: number | string;
  missing?: number | string;
  all?: number | string;
  active?: number | string;
  inactive?: number | string;
  online?: number | string;
  offline?: number | string;
  unregister?: number | string;
  nolocation?: number | string;
  unlisted?: number | string;
}

export interface DeviceData {
  DeviceId: string | number;
  DeviceName: string;
  DeviceLabel: "Clocked In" | "Clocked Out";
  DeviceCount: string | number;
  eva: string;
  home: string;
}

export interface VisitorData {
  ID: string;
  Name: string;
  Purpose: string;
}

export interface LiveData extends DeviceData, VisitorData {
  id: string;
  ERT: string;
  device_id: string;
  name: string;
  employee_id: string;
  employee_no: string;
  full_name: string;
  department: string;
  division: string;
  section: string;
  epc: string;
  in: string;
  out: string;
  tag_id: string;
  clocked_in?: string;
  clocked_out?: string;
  device_in: string;
  device_out: string;
  date_time: string;
  status_in: string;
  status_out: string;
  user_type: string;
  eva_status: string;
  status: string;
  log_time: string;
  FirstName: string;
  LastName: string;
  Position: string;
  ContactNo: string;
  ID: string;
  FullName: string;
  Status: string;
  remarks?: string;
  controller_type?: string;
  date_receive?: string;
  type?: string;
  evacuated?: string;
  missing?: string;
  device_name?: string;
}

type DataType = "summary" | "live";

interface UseSocketProps {
  room: string;
  dataType?: DataType;
  statusFilter?: boolean; // External status filter state
}

const SOCKET_URL = getApiSocketBaseUrl();

export const useSocket = <
  T extends SummaryData | LiveData | SummaryCountData | Device,
>({
  room,
  dataType,
  statusFilter = false,
}: UseSocketProps) => {
  const [data, setData] = useState<T[]>([]);
  const [countData, setCountData] = useState<SummaryCountData | null>(null);
  const [overallCountData, setOverallCountData] = useState<{
    employee: string;
    visitor: string;
  } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [response, setResponse] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<"success" | "fail" | "">(
    ""
  );
  const [asofData, setAsofData] = useState<string>("---");
  const { successStyle, errorStyle } = useToastStyleTheme();
  const socketRef = useRef<Socket | null>(null);
  const location = useLocation();

  // IndexedDB state for large datasets (live dataType only)
  const [loadedOffset, setLoadedOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [useIndexedDb, setUseIndexedDb] = useState(false); // Flag to enable IndexedDB for large datasets
  const latestTimestampRef = useRef<number | null>(null);
  const loadedOffsetRef = useRef(0); // Ref to track current offset
  const dataRef = useRef<T[]>([]); // Ref to track current data for synchronous access

  // Connect to socket and join room
  useEffect(() => {
    console.log("🚀 Initializing socket connection...");
    console.log("🏠 Target room:", room);
    console.log("📡 Socket URL:", SOCKET_URL);
    console.log("📝 Data type:", dataType);

    if (!room) {
      console.error("❌ Room name is required but not provided");
      setError("Room name is required");
      setIsLoading(false);
      return;
    }

    // Guard: prevent duplicate connections if socket already exists and is connected
    if (socketRef.current?.connected) {
      console.log("⚠️ Socket already connected, skipping duplicate connection");
      return;
    }

    let socketInstance: Socket;

    try {
      console.log("🔧 Creating socket instance with config...");
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
      console.log("✅ Socket instance created successfully");
      socketRef.current = socketInstance;
    } catch (err) {
      const errorMessage = `Failed to initialize socket: ${err instanceof Error ? err.message : String(err)}`;
      console.error("🔴 Socket initialization failed:", errorMessage);
      console.error("🔍 Error details:", err);
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    // Set loading state
    console.log("⏳ Setting loading state...");
    setIsLoading(true);

    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected to server successfully!");
      console.log("🔗 Connection ID:", socketInstance.id);
      setIsConnected(true);
      setError(null);

      // Join the specified room
      console.log(`🚪 Attempting to join room: "${room}"`);
      socketInstance.emit("join", room);
      console.log(`✅ Successfully joined socket room: "${room}"`);
    });

    socketInstance.on("connect_error", (err) => {
      setIsConnected(false);
      setError(`Connection error: ${err.message}`);
      setIsLoading(false);
      console.error("🔴 Socket connection error:", err.message);
      console.error("🔍 Error details:", err);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔌 Socket disconnected from server");
    });

    // Listen for preload data when joining room
    socketInstance.on("preload", async (preloadData) => {
      console.log("📦 Preload data received for room:", room);
      console.log("📊 Data type:", typeof preloadData);
      console.log(
        "📈 Records count:",
        Array.isArray(preloadData) ? preloadData.length : "N/A"
      );
      console.log("preloadData", preloadData);

      if (Array.isArray(preloadData)) {
        const recordCount = preloadData.length;

        // Use IndexedDB for large datasets (live dataType with 1000+ records)
        if (dataType === "live" && recordCount >= 1000) {
          console.log(
            "💾 Using IndexedDB for large dataset:",
            recordCount,
            "records"
          );
          setUseIndexedDb(true);

          try {
            // Store all preload data in IndexedDB
            await storePreloadData(room, preloadData);

            // Get total count
            const count = await getTotalCount(room);
            setTotalCount(count);

            // Load only top 1k records into state
            const topRecords = await getTopRecords(room, 1000);
            console.log(
              `📊 [useSocket] Loaded ${topRecords.length} top records from IndexedDB for room: ${room}`
            );
            if (topRecords.length > 0) {
              console.log(
                `📋 [useSocket] Sample record fields:`,
                Object.keys(topRecords[0])
              );
              console.log(
                `📋 [useSocket] Sample record eva_status:`,
                topRecords[0]?.eva_status
              );
            } else {
              console.warn(
                `⚠️ [useSocket] No records loaded from IndexedDB for room: ${room}`
              );
            }
            setData(topRecords as T[]);
            dataRef.current = topRecords as T[];
            const initialOffset = topRecords.length;
            loadedOffsetRef.current = initialOffset;
            setLoadedOffset(initialOffset);
            console.log(
              `📊 [useSocket] Initial offset set to: ${initialOffset} for room: ${room}`
            );

            // Store latest timestamp
            const latestTs = await getLatestTimestamp(room);
            latestTimestampRef.current = latestTs;

            console.log(
              "✅ Preload data stored in IndexedDB, loaded top 1000 records"
            );
          } catch (error) {
            console.error("❌ Error storing preload data in IndexedDB:", error);
            // Fallback to regular state storage
            setData(preloadData as T[]);
            setUseIndexedDb(false);
          }
        } else {
          // For small datasets or summary data, use regular state
          console.log(
            "📝 Using regular state for dataset:",
            recordCount,
            "records"
          );
          setData(preloadData as T[]);
          dataRef.current = preloadData as T[];
          setUseIndexedDb(false);
          setTotalCount(recordCount);
        }
      } else {
        console.error(
          "❌ Expected array for preload data but got:",
          typeof preloadData
        );
        console.error("🔍 Received data:", preloadData);
        setData([]);
        setUseIndexedDb(false);
      }
      setIsLoading(false);
    });

    // Listen for updates
    socketInstance.on("data", async (newData) => {
      console.log("🔄 New live data received for room:", room);
      console.log("🆕 Data type mode:", dataType);
      console.log("📋 New data payload:", newData);

      if (dataType === "summary") {
        // For summary data, update the matching item in array
        setData((prevData) => {
          const updateItem = (item: T) => {
            return { ...item, ...newData };
          };

          const addItem = () => {
            return [...prevData, newData as T];
          };

          if (
            Object.keys(prevData[0]).includes("Department") &&
            location.pathname.includes("cdepro")
          ) {
            const exists = prevData.some(
              (item: any) => item.Department === newData.Department
            );
            return exists
              ? prevData.map((item: any) =>
                  item.Department === newData.Department
                    ? updateItem(item)
                    : item
                )
              : addItem();
          }

          if (
            Object.keys(prevData[0]).includes("XAxis") ||
            Object.keys(prevData[0]).includes("xaxis")
          ) {
            const exists = prevData.some((item: any) => item.ID === newData.ID);
            return exists
              ? prevData.map((item: any) =>
                  item.ID === newData.ID ? updateItem(item) : item
                )
              : addItem();
          }

          if (Object.keys(prevData[0]).includes("DeviceId")) {
            const deviceId = (newData as DeviceData).DeviceId;
            const exists = prevData.some(
              (item) => (item as DeviceData).DeviceId === deviceId
            );

            return exists
              ? prevData.map((item) =>
                  (item as DeviceData).DeviceId === deviceId
                    ? updateItem(item)
                    : item
                )
              : addItem();
          } else {
            const itemName = (newData as SummaryData).name;
            const exists = prevData.some(
              (item) => (item as SummaryData).name === itemName
            );

            return exists
              ? prevData.map((item) =>
                  (item as SummaryData).name === itemName
                    ? updateItem(item)
                    : item
                )
              : addItem();
          }
        });
      } else if (dataType === "live") {
        const newLiveData = newData as LiveData;

        // Check if this is a newer record (should be prepended to view)
        const newTimestamp = newLiveData.date_receive
          ? new Date(newLiveData.date_receive).getTime()
          : newLiveData.date_time
            ? new Date(newLiveData.date_time).getTime()
            : newLiveData.log_time
              ? new Date(newLiveData.log_time).getTime()
              : Date.now();

        const isLatest =
          latestTimestampRef.current === null ||
          newTimestamp >= latestTimestampRef.current;

        if (isLatest) {
          latestTimestampRef.current = newTimestamp;
        }

        // Check if this is a new record by examining current data
        const currentData = dataRef.current;
        let isNewRecord = false;

        if (!currentData || currentData.length === 0) {
          isNewRecord = true;
        } else {
          const firstItem = currentData[0] as Record<string, any> | undefined;

          if (!firstItem || typeof firstItem !== "object") {
            isNewRecord = true;
          } else if (Object.keys(currentData[0])?.includes("controller_type")) {
            isNewRecord = true; // controller_type records are always treated as new
          } else {
            // Check if record exists
            const existingRecordIndex = currentData.findIndex((item) => {
              const liveItem = item as LiveData;

              if (newLiveData?.id) {
                return liveItem?.["id"] === newLiveData?.["id"];
              }

              if (!newLiveData?.employee_id) {
                return (
                  liveItem?.["ID"] === newLiveData?.["ID"] &&
                  liveItem?.clocked_in === newLiveData?.clocked_in
                );
              } else {
                return (
                  liveItem?.employee_id === newLiveData?.employee_id &&
                  liveItem?.clocked_in === newLiveData?.clocked_in
                );
              }
            });

            isNewRecord = existingRecordIndex === -1;
          }
        }

        // Update UI IMMEDIATELY for real-time display (non-blocking)
        console.log(
          `🔄 [useSocket] Updating UI with new data for room: ${room}`,
          {
            useIndexedDb,
            prevDataLength: dataRef.current?.length || 0,
            isNewRecord,
            isLatest,
          }
        );

        setData((prevData) => {
          // Update ref with latest data
          const updatedData = (() => {
            if (!prevData || prevData.length === 0) {
              console.log(`✅ [useSocket] Adding first record to empty state`);
              return [newData as T];
            }

            const firstItem = prevData[0] as Record<string, any> | undefined;
            if (!firstItem || typeof firstItem !== "object") {
              return [newData as T];
            }

            if (Object.keys(prevData[0])?.includes("controller_type")) {
              // If it's latest, prepend; otherwise append
              return isLatest
                ? [newData as T, ...prevData]
                : [...prevData, newData as T];
            } else {
              // Find existing record
              const existingRecordIndex = prevData.findIndex((item) => {
                const liveItem = item as LiveData;

                if (
                  location.pathname.includes("dashboard/realtime") &&
                  newLiveData?.epc
                ) {
                  return liveItem?.["epc"] === newLiveData?.["epc"];
                }

                if (newLiveData?.id) {
                  return liveItem?.["id"] === newLiveData?.["id"];
                }

                if (!newLiveData?.employee_id) {
                  return (
                    liveItem?.["ID"] === newLiveData?.["ID"] &&
                    liveItem?.clocked_in === newLiveData?.clocked_in
                  );
                } else {
                  return (
                    liveItem?.employee_id === newLiveData?.employee_id &&
                    liveItem?.clocked_in === newLiveData?.clocked_in
                  );
                }
              });

              if (existingRecordIndex !== -1) {
                // Update existing record
                return prevData.map((item, index) =>
                  index === existingRecordIndex ? { ...item, ...newData } : item
                );
              } else {
                // Insert as new record - prepend if latest, otherwise append
                if (isLatest) {
                  // Prepend and limit to reasonable size (5k max in view)
                  const updated = [newData as T, ...prevData];
                  return updated.slice(0, 5000);
                } else {
                  return [...prevData, newData as T];
                }
              }
            }
          })();

          dataRef.current = updatedData;
          console.log(
            `✅ [useSocket] State updated, new length: ${updatedData.length}`
          );
          return updatedData;
        });

        // Update IndexedDB in the background (non-blocking) after UI update
        if (useIndexedDb) {
          console.log(
            `💾 [useSocket] Updating IndexedDB in background for room: ${room}`
          );
          // Don't await - update IndexedDB asynchronously without blocking
          updateIndexedDbData(room, newData).catch((error) => {
            console.error("❌ Error updating IndexedDB:", error);
          });

          // Update total count in background
          getTotalCount(room)
            .then((count) => setTotalCount(count))
            .catch((error) => {
              console.error("❌ Error getting total count:", error);
            });
        } else {
          // For non-IndexedDB mode, increment count if it's a new record
          if (isNewRecord) {
            setTotalCount((prev) => (prev !== undefined ? prev + 1 : 1));
          }
        }
      }
    });

    //Listen for removed data
    socketInstance.on("remove_data", async (epc) => {
      console.log("remove from data", epc);

      if (useIndexedDb) {
        // Note: IndexedDB removal would need to be implemented if needed
        // For now, just update the displayed data
      }

      setData((prev) => {
        return prev.filter(
          (item: any) => item?.epc !== epc && item?.ID !== Number(epc)
        );
      });

      if (useIndexedDb) {
        const count = await getTotalCount(room);
        setTotalCount(count);
      }
    });

    //Listen for get_user  data
    socketInstance.on("get_user", (data) => {
      console.log("get_user", data);
      setResponse(data);
    });

    //Listen for get_user  data
    socketInstance.on("cdepro_update_response", (data) => {
      if (data.includes("already")) {
        toast.error(data, {
          style: errorStyle,
        });
        setResponseStatus("fail");
      } else {
        toast.success(data, {
          style: successStyle,
        });
        setResponseStatus("success");
      }
      console.log("cdepro_update_resppose", data);

      setTimeout(() => {
        setResponseStatus("");
      }, 100);
    });

    //Listen for cdeppro add  data
    socketInstance.on("cdepro_add_response", (data) => {
      if (data.includes("already")) {
        toast.error(data, {
          style: errorStyle,
        });
        setResponseStatus("fail");
      } else {
        toast.success(data, {
          style: successStyle,
        });
        setResponseStatus("success");
      }

      console.log("cdepro_add_response", data);
      setTimeout(() => {
        setResponseStatus("");
      }, 100);
    });

    socketInstance.on("device_update_response", (data) => {
      if (data.includes("already")) {
        toast.error(data, {
          style: errorStyle,
        });
        setResponseStatus("fail");
      } else {
        toast.success(data, {
          style: successStyle,
        });
        setResponseStatus("success");
      }

      console.log("device_update_response", data);
      setTimeout(() => {
        setResponseStatus("");
      }, 100);
    });

    //Listen to overall count data
    socketInstance.on("overall_count", (overallCountData) => {
      console.log("overall_count", overallCountData);
      setOverallCountData(overallCountData);
    });

    //Listen for get_user  data
    socketInstance.on("cdepro_remove_response", (data) => {
      console.log("cdepro_remove_resppose", data);
      setIsLoading(false);
      setResponseStatus("success");
      setTimeout(() => {
        setResponseStatus("");
      }, 100);
    });
    // Listen for summary count data
    socketInstance.on("count", (countData) => {
      console.log("📊 Count data received for room:", room);
      console.log("🔢 Count details:", {
        in: countData.in,
        out: countData.out,
        total: countData.total,
        inside: countData.inside,
        safe: countData.safe,
        injured: countData.injured,
        home: countData.home,
        missing: countData.missing,
        all: countData.all,
        active: countData.active,
        inactive: countData.inactive,
      });
      console.log("📈 Raw count data:", countData);

      setCountData((prevData) => {
        const updatedData: SummaryCountData = {
          ...prevData,
          in: countData.in,
          out: countData.out,
          total: countData.total,
          inside: countData.inside,
          safe: countData.safe,
          injured: countData.injured,
          home: countData.home,
          missing: countData.missing,
          all: countData.all,
          active: countData.active,
          inactive: countData.inactive,
          online: countData.online,
          offline: countData.offline,
          nolocation: countData.nolocation,
          unregister: countData.unregister,
          unlisted: countData.unlisted,
        };
        console.log("✅ Count data updated in state:", updatedData);
        return updatedData;
      });
    });

    socketInstance.on("asof", (asofData) => {
      setAsofData(asofData);
    });

    setSocket(socketInstance);

    // Clean up function
    return () => {
      console.log("🧹 Cleaning up socket connections...");
      socketInstance.off("connect");
      socketInstance.off("disconnect");
      socketInstance.off("connect_error");
      socketInstance.off("preload");
      socketInstance.off("data");
      socketInstance.off("count");
      socketInstance.off("remove_data");
      socketInstance.off("get_user");
      socketInstance.off("cdepro_update_response");
      socketInstance.off("cdepro_add_response");
      socketInstance.off("device_update_response");
      socketInstance.off("overall_count");
      socketInstance.off("cdepro_remove_response");
      socketInstance.off("asof");
      socketInstance.disconnect();
      socketRef.current = null;
      console.log(`👋 Left socket room: "${room}"`);
      console.log("✨ Socket cleanup completed");
    };
  }, [room, dataType]);

  // Function to search through data
  const searchData = useCallback((term: string) => {
    console.log("🔍 Searching data with term:", term);
    setSearchTerm(term);
  }, []);

  // Function to clear search
  const clearSearch = useCallback(() => {
    console.log("🧹 Clearing search term");
    setSearchTerm("");
  }, []);

  // State for search results from IndexedDB
  const [indexedDbSearchResults, setIndexedDbSearchResults] = useState<T[]>([]);

  // Search IndexedDB when search term is provided and using IndexedDB
  useEffect(() => {
    if (useIndexedDb && searchTerm.trim()) {
      const searchTimeout = setTimeout(async () => {
        try {
          const results = await searchIndexedDbData(
            room,
            searchTerm,
            undefined,
            1000
          );
          setIndexedDbSearchResults(results as T[]);
        } catch (error) {
          console.error("❌ Error searching IndexedDB:", error);
          setIndexedDbSearchResults([]);
        }
      }, 300); // Debounce search

      return () => clearTimeout(searchTimeout);
    } else {
      setIndexedDbSearchResults([]);
    }
  }, [searchTerm, useIndexedDb, room]);

  // Compute filtered data based on search term and status filter
  const filteredData = useMemo(() => {
    console.log(`🔍 [useSocket] Computing filteredData for room: ${room}`, {
      dataLength: data?.length || 0,
      searchTerm,
      statusFilter,
      useIndexedDb,
      indexedDbSearchResultsLength: indexedDbSearchResults?.length || 0,
    });

    // If using IndexedDB and searching, merge displayed data with IndexedDB results
    let dataToFilter = data;
    if (
      useIndexedDb &&
      searchTerm.trim() &&
      indexedDbSearchResults.length > 0
    ) {
      // Merge and deduplicate
      const displayedIds = new Set(data.map((item: any) => item.id || item.ID));
      const additionalResults = indexedDbSearchResults.filter(
        (item: any) => !displayedIds.has(item.id || item.ID)
      );
      dataToFilter = [...data, ...additionalResults];
      console.log(
        `🔍 [useSocket] Merged IndexedDB search results: ${dataToFilter.length} total`
      );
    }

    let filteredBySearch = dataToFilter;
    // Apply search filter first
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();

      filteredBySearch = dataToFilter.filter((item) => {
        // Search through all string and number properties of the item
        return Object.values(item).some((value) => {
          if (value === null || value === undefined) {
            return false;
          }

          // Convert value to string and search case-insensitively
          const stringValue = String(value).toLowerCase();
          return stringValue.includes(lowerSearchTerm);
        });
      });
      console.log(
        `🔍 [useSocket] After search filter: ${filteredBySearch.length} records`
      );
    }

    // Apply status filter (only when explicitly enabled)
    if (statusFilter) {
      const filtered = filteredBySearch.filter((item: any) => {
        // When statusFilter is true, show only "Missing" records
        if (item?.eva_status) {
          return item?.eva_status?.toLowerCase() === "missing";
        }

        // For other data types, check status field
        if (item?.status) {
          return item?.status?.toString()?.length > 0;
        }
        return false;
      });

      console.log(
        `🔍 [useSocket] After status filter (ON): ${filtered.length} records (from ${filteredBySearch.length})`
      );

      // Only log if there's a significant difference (helps debug)
      if (filteredBySearch.length > 0 && filtered.length === 0) {
        console.warn(
          `⚠️ [useSocket] Status filter removed all records. Total: ${filteredBySearch.length}, Filtered: ${filtered.length}`
        );
      }
      return filtered;
    }

    // When statusFilter is false, return all data (no filtering)
    console.log(
      `🔍 [useSocket] No status filter: returning all ${filteredBySearch.length} records`
    );
    return filteredBySearch;
  }, [
    data,
    searchTerm,
    statusFilter,
    indexedDbSearchResults,
    useIndexedDb,
    room,
  ]);

  // Function to manually leave current room and join a new one
  const joinRoom = useCallback(
    (newRoom: string) => {
      if (!socket) {
        console.log("❌ Cannot join room - socket not available");
        return;
      }

      console.log(`🔄 Switching rooms: "${room}" → "${newRoom}"`);
      setIsLoading(true);
      socket.emit("room", newRoom);
      console.log(`✅ Successfully joined new room: "${newRoom}"`);

      // Reset data when changing rooms
      console.log("🗑️ Clearing data for room switch...");
      setData([]);
    },
    [socket, room]
  );

  // Load more data for infinite scroll
  const loadMore = useCallback(async () => {
    if (!useIndexedDb) {
      console.log(
        `⏸️ [useSocket] loadMore skipped: useIndexedDb=${useIndexedDb}`
      );
      return;
    }

    // Safety check: if offset is 0 but we have data, use data length as offset
    let currentOffset = loadedOffsetRef.current;
    if (currentOffset === 0 && dataRef.current.length > 0) {
      console.warn(
        `⚠️ [useSocket] Offset is 0 but we have ${dataRef.current.length} records. Using data length as offset.`
      );
      currentOffset = dataRef.current.length;
      loadedOffsetRef.current = currentOffset;
      setLoadedOffset(currentOffset);
    }

    console.log(
      `🔄 [useSocket] Loading more data: offset=${currentOffset}, room=${room}, dataLength=${dataRef.current.length}`
    );

    setIsLoadingMore(true);
    try {
      const nextBatch = await getNextBatch(room, currentOffset, 1000);
      console.log(
        `📦 [useSocket] Received next batch: ${nextBatch.length} records`
      );
      if (nextBatch.length > 0) {
        setData((prev) => {
          const updated = [...prev, ...(nextBatch as T[])];
          console.log(
            `✅ [useSocket] Updated data: ${prev.length} -> ${updated.length} records`
          );
          dataRef.current = updated;
          return updated;
        });
        const newOffset = currentOffset + nextBatch.length;
        loadedOffsetRef.current = newOffset;
        setLoadedOffset(newOffset);
        console.log(
          `📊 [useSocket] Updated offset: ${currentOffset} -> ${newOffset}`
        );
      } else {
        console.log(
          `⚠️ [useSocket] No more records to load at offset ${currentOffset}`
        );
      }
    } catch (error) {
      console.error("❌ Error loading more data:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [useIndexedDb, room]);

  // Clear all data
  const clearData = useCallback(async () => {
    console.log("🧹 Clearing all socket data manually");
    setData([]);

    if (useIndexedDb) {
      try {
        await clearIndexedDbData(room);
        loadedOffsetRef.current = 0;
        setLoadedOffset(0);
        setTotalCount(0);
        latestTimestampRef.current = null;
      } catch (error) {
        console.error("❌ Error clearing IndexedDB:", error);
      }
    }

    console.log("✅ Socket data cleared successfully");
  }, [useIndexedDb, room]);

  //emit
  const emitData = useCallback(
    (targetRoom: string, payload?: any, successMessage?: string) => {
      if (!socket) {
        console.log("❌ Socket not available for emission");
        return;
      }
      console.log("🚀 Socket emitting to room:", targetRoom);
      console.log("📦 Socket payload:", payload);
      switch (targetRoom) {
        case "users":
          socket.emit(room, "users");
          if (successMessage) {
            toast.success(successMessage, {
              style: successStyle,
            });
          }
          break;
        default:
          socket.emit(targetRoom, payload);
          if (successMessage) {
            toast.success(successMessage, {
              style: successStyle,
            });
          }
          break;
      }
      console.log("✨ Socket emission sent successfully");
    },
    [socket]
  );

  return {
    data: filteredData, // Return filtered data instead of raw data
    originalData: data, // Provide access to original unfiltered data
    countData,
    isConnected,
    error,
    isLoading,
    searchTerm,
    response,
    responseStatus,
    overallCountData,
    asofData,
    searchData,
    clearSearch,
    joinRoom,
    clearData,
    emitData,
    // New properties for infinite scroll
    loadMore: useIndexedDb ? loadMore : undefined,
    isLoadingMore: useIndexedDb ? isLoadingMore : false,
    totalCount: useIndexedDb ? totalCount : data.length,
  };
};
