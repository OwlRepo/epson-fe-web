import { DynamicTable } from "./dynamic-table";
import type { Column, Filter } from "./dynamic-table";
import { useNavigate, useParams, useLocation } from "@tanstack/react-router";

// Clear button configuration interface
export interface ClearButtonConfig {
  label: string;
  socketRoom: string;
  emitData: (params?: Record<string, string>) => [string, string];
}

// Route-based clear button configurations
const clearButtonConfigs: Record<string, ClearButtonConfig> = {
  "/attendance-monitoring/dashboard/overview": {
    label: "Clear Outgoings",
    socketRoom: "clear_logs",
    emitData: () => ["ams", ""],
  },
  "/visitor-management/dashboard/overview": {
    label: "Clear Checkouts",
    socketRoom: "clear_logs",
    emitData: () => ["vms", ""],
  },
  // Pattern for sections route - will be matched dynamically
  "attendance-monitoring-sections": {
    label: "Clear Outgoings",
    socketRoom: "clear_logs",
    emitData: (params) => [
      "ams_section",
      `${params?.divisionId || ""}${params?.departmentId || ""}${params?.sectionId || ""}`,
    ],
  },
};

interface LiveDataTableProps {
  columns: Column[];
  data: any[];
  filters?: Filter[];
  onFilter?: (key: string, value: string) => void;
  className?: string;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  routeSearch?: Record<string, string | undefined>;
  searchKey?: string;
  isLoading?: boolean;
  onSearch?: (searchTerm: string) => void;
  tableId?: string;
  onRowClick?: (row: any) => void;
  clearSocketData?: () => void; // Function to clear the socket data
  emitSocketData?: (room: string, data: any) => void; // Function to emit socket data
}

export function LiveDataTable({
  pageSize = 10,
  data,
  onPageSizeChange,
  routeSearch,
  onRowClick,
  clearSocketData,
  emitSocketData,
  ...props
}: LiveDataTableProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });

  // Determine clear button config based on current route
  const getClearButtonConfig = (): ClearButtonConfig | null => {
    const pathname = location.pathname;

    // Check exact matches first
    if (clearButtonConfigs[pathname]) {
      return clearButtonConfigs[pathname];
    }

    // Check for sections route pattern
    if (
      pathname.includes("/attendance-monitoring/dashboard/divisions/") &&
      pathname.split("/").length === 7
    ) {
      // /attendance-monitoring/dashboard/divisions/divId/deptId/secId
      return clearButtonConfigs["attendance-monitoring-sections"];
    }

    return null;
  };

  const clearButtonConfig = getClearButtonConfig();

  // Internal function to handle clearing table data
  const handleClearTable = () => {
    console.log("🧹 Clear button clicked!");
    console.log("📍 Current route:", location.pathname);
    console.log("⚙️ Clear button config:", clearButtonConfig);

    // Clear local data first
    console.log("🗑️ Clearing local socket data...");
    clearSocketData?.();

    // If we have a config and emit function, emit to socket
    if (clearButtonConfig && emitSocketData) {
      const [type, id] = clearButtonConfig.emitData(
        params as Record<string, string>
      );

      console.log("🏠 Joining socket room:", clearButtonConfig.socketRoom);
      console.log("📤 Emitting data:", [type, id]);
      console.log("📋 Data breakdown:", { type, id });

      emitSocketData(clearButtonConfig.socketRoom, [type, id]);

      console.log("✅ Socket emit completed!");
    } else {
      console.log("❌ No clear config or emit function available");
      console.log("- clearButtonConfig:", !!clearButtonConfig);
      console.log("- emitSocketData:", !!emitSocketData);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // Update URL params
    if (routeSearch) {
      navigate({
        // @ts-ignore
        search: (prev) => ({
          ...prev,
          pageSize: String(newPageSize),
        }),
        replace: true,
      });
    }
    // Call the provided callback
    onPageSizeChange?.(newPageSize);
  };

  // Slice the data based on page size
  const slicedData = data.slice(0, pageSize);

  const paginationConfig = {
    pageSize: Number(routeSearch?.pageSize || pageSize),
    currentPage: 1,
    totalItems: data.length,
    totalPages: 1,
  };

  return (
    <DynamicTable
      {...props}
      onRowClick={onRowClick}
      onClearTable={clearButtonConfig ? handleClearTable : undefined}
      clearButtonLabel={clearButtonConfig?.label}
      data={slicedData}
      isLiveData={true}
      pagination={paginationConfig}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
