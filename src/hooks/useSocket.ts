import { getApiSocketBaseUrl } from "@/utils/env";
import { useState, useEffect, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";

// Define types for our data
export interface SummaryData extends DeviceData {
  device_id: string;
  name: string;
  in: string; // Total Count
  out: string; // Total Count
  inside: string; // Optional, only for summary data
}

export interface SummaryCountData {
  in: number; // Total Count
  out: number; // Total Count
  total?: number; // Optional, only for summary data
  inside?: number; // Optional, only for summary data
  safe?: number;
  injured?: number;
  home?: number;
  missing?: number;
  all?: number;
}

export interface DeviceData {
  DeviceId: string | number;
  DeviceName: string;
  DeviceLabel: "Clocked In" | "Clocked Out";
  DeviceCount: string | number;
}

export interface VisitorData {
  ID: string;
  Name: string;
  Purpose: string;
}

export interface LiveData extends DeviceData, VisitorData {
  id: string;
  device_id: string;
  name: string;
  employee_id: string;
  employeeNo:string;
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
  evacuation_time: string;
}

type DataType = "summary" | "live";

interface UseSocketProps {
  room: string;
  dataType?: DataType;
}

const SOCKET_URL = getApiSocketBaseUrl();

export const useSocket = <T extends SummaryData | LiveData | SummaryCountData>({
  room,
  dataType,
}: UseSocketProps) => {
  const [data, setData] = useState<T[]>([]);
  const [countData, setCountData] = useState<SummaryCountData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
      setIsLoading(false);
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
    socketInstance.on("preload", (preloadData) => {
      console.log("📦 Preload data received for room:", room);
      console.log("📊 Data type:", typeof preloadData);
      console.log(
        "📈 Records count:",
        Array.isArray(preloadData) ? preloadData.length : "N/A"
      );
      console.log("🗂️ Preload data:", preloadData);

      if (Array.isArray(preloadData)) {
        setData(preloadData as T[]);
        console.log("✅ Preload data successfully set in state");
      } else {
        console.error(
          "❌ Expected array for preload data but got:",
          typeof preloadData
        );
        console.error("🔍 Received data:", preloadData);
        setData([]);
      }
      setIsLoading(false);
    });

    // Listen for updates
    socketInstance.on("data", (newData) => {
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
        // For live data, check if record exists with same employee_id AND clocked_in
        setData((prevData) => {
          const newLiveData = newData as LiveData;
          // Find existing record with same employee_id AND clocked_in
          const existingRecordIndex = prevData.findIndex((item) => {
            const liveItem = item as LiveData;

            if (!newLiveData.employee_id) {
              return (
                liveItem.ID === newLiveData.ID &&
                liveItem.clocked_in === newLiveData.clocked_in
              );
            } else {
              return (
                liveItem.employee_id === newLiveData.employee_id &&
                liveItem.clocked_in === newLiveData.clocked_in
              );
            }

            // return (
            //   (liveItem.employee_id === newLiveData.employee_id &&
            //     liveItem.clocked_in === newLiveData.clocked_in) ||
            //   (liveItem.ID === newLiveData.ID &&
            //     liveItem.clocked_in === newLiveData.clocked_in)
            // );
          });
          if (existingRecordIndex !== -1) {
            // Update existing record with same employee_id and clocked_in
            return prevData.map((item, index) =>
              index === existingRecordIndex ? { ...item, ...newData } : item
            );
          } else {
            // Insert as new record (either new employee or same employee with different clocked_in)
            return [...prevData, newData as T];
          }
        });
      }
    });

    //Listen for removed data
    socketInstance.on("remove_data", (epc) => {
      console.log("remove from evs", epc);
      setData((prev) => prev.filter((item: any) => item?.epc !== epc));
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
      });
      console.log("📈 Raw count data:", countData);

      setCountData((prevData) => {
        const updatedData = {
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
        };
        console.log("✅ Count data updated in state:", updatedData);
        return updatedData;
      });
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
      socketInstance.disconnect();
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

  // Compute filtered data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return data;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    return data.filter((item) => {
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
  }, [data, searchTerm]);

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

  // Clear all data
  const clearData = useCallback(() => {
    console.log("🧹 Clearing all socket data manually");
    setData([]);
    console.log("✅ Socket data cleared successfully");
  }, []);

  //emit
  const emitData = useCallback(
    (targetRoom: string, payload?: any) => {
      if (!socket) {
        console.log("❌ Socket not available for emission");
        return;
      }
      console.log("🚀 Socket emitting to room:", targetRoom);
      console.log("📦 Socket payload:", payload);
      switch (targetRoom) {
        case "users":
          socket.emit(room, "users");
          break;
        default:
          socket.emit(targetRoom, payload);
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
    searchData,
    clearSearch,
    joinRoom,
    clearData,
    emitData,
  };
};
