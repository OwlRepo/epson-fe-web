import {
  ClockedInIcon,
  ClockedOutIcon,
  EpsonFlame,
  InPremisesIcon,
} from "@/assets/svgs";
import CardSection from "@/components/layouts/CardSection";
import AttendanceCountCard from "@/components/ui/attendance-count-card";
import CardHeaderLeft from "@/components/ui/card-header-left";
import EmpInfoDialog from "@/components/ui/emp-info-dialog";
import SocketDynamicTable from "@/components/ui/socket-dynamic-table";
import Spinner from "@/components/ui/spinner";
import { useGetEmployeeByNo } from "@/hooks/query/useGetEmployeeById";
import { usePaginatedTableSocket } from "@/hooks/socket/usePaginatedTableSocket";
import formatCountWithCommas from "@/utils/formatCountWithCommas";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/dashboard/overview"
)({
  component: RouteComponent,
});
// table keys
const EMPLOYEE_NO_TABLE_KEY = "employee_no";
const EMPLOYEE_NAME_TABLE_KEY = "full_name";
const EMPLOYEE_SECTION_TABLE_KEY = "section";
const EMPLOYEE_CLOCKED_IN_TABLE_KEY = "clocked_in";
const EMPLOYEE_CONTROLLER_TYPE = "controller_type";
const EMPLOYEE_DATE_TIME = "date_receive";
const DEVICE_NAME = "device_name";

function RouteComponent() {
  const navigate = useNavigate({
    from: "/attendance-monitoring/dashboard/overview",
  });
  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/dashboard/overview",
  });

  //employee data
  const [isOpen, setIsOpen] = useState(false);
  const [employeeID, setEmployeeID] = useState("");
  const { data: employee, isLoading: isEmployeeLoading } =
    useGetEmployeeByNo(employeeID);

  // Accumulated data for Load More pagination
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const previousPageRef = useRef<number>(1);
  const previousParamsRef = useRef<string>("");
  const previousSocketRowsRef = useRef<any[]>([]);
  // Refresh key to force table re-render when data updates
  const [tableRefreshKey, setTableRefreshKey] = useState(0);

  // Build routeSearch with filters
  const routeSearchWithFilter = useMemo(() => {
    const baseSearch: Record<string, string | undefined> = {
      ...search,
      page: search.page || "1",
      limit: search.limit || "1000",
      search: search.search,
      // Ensure all filter keys are explicitly included
      filter_section: search.filter_section,
      filter_controller_type: search.filter_controller_type,
      filter_device_name: search.filter_device_name,
    };
    return baseSearch;
  }, [search]);

  // Socket data source
  const {
    data: socketRows,
    counts: socketCounts,
    meta: socketMeta,
    asof: socketAsof,
    isLoading: isSocketLoading,
    isConnected: isSocketConnected,
  } = usePaginatedTableSocket<any>({
    room: "AMS",
    routeSearch: routeSearchWithFilter,
    rowId: "employee_id",
    emitEvent: "ams_search",
    debounceMs: 100, // Reduced debounce for faster filter response
    normalizeParams: (p) => {
      const payload: Record<string, unknown> = {
        page: p.page ? Number(p.page) : 1,
        limit: p.limit ? Number(p.limit) : 1000,
        search: p.search || "",
      };
      // Only include filter values if they exist (not undefined/empty)
      if (p.filter_section) {
        payload.Section = p.filter_section;
      }
      if (p.filter_controller_type) {
        payload.ControllerType = p.filter_controller_type;
      }
      if (p.filter_device_name) {
        payload.DeviceName = p.filter_device_name;
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
      filter_section: routeSearchWithFilter.filter_section,
      filter_controller_type: routeSearchWithFilter.filter_controller_type,
      filter_device_name: routeSearchWithFilter.filter_device_name,
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
        `🔄 [overview.tsx] Filters/search changed, resetting accumulated data`,
        { paramsKey, socketRowsLength: socketRows.length }
      );
      setAccumulatedData([...socketRows]);
      previousParamsRef.current = paramsKey;
      previousPageRef.current = currentPage;
      previousSocketRowsRef.current = [...socketRows];
      setTableRefreshKey((prev) => prev + 1);
      return;
    }

    // If page increased, append new data
    if (currentPage > previousPageRef.current) {
      console.log(`➕ [overview.tsx] Page increased, appending new data`, {
        fromPage: previousPageRef.current,
        toPage: currentPage,
        newRowsCount: socketRows.length,
      });
      setAccumulatedData((prev) => [...prev, ...socketRows]);
      previousPageRef.current = currentPage;
      previousSocketRowsRef.current = [...socketRows];
    } else if (currentPage < previousPageRef.current) {
      // If page decreased (went back), reset to current page data
      console.log(`⬇️ [overview.tsx] Page decreased, resetting data`, {
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
          `🔄 [overview.tsx] Syncing page 1 data (onPreload or onData update)`,
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
          const existingMap = new Map();
          prev.forEach((item: any) => {
            const key =
              item.employee_id ||
              item.employee_no ||
              item.ID ||
              item.EmployeeNo;
            if (key) {
              existingMap.set(String(key), item);
            }
          });

          // Update or add records from socketRows
          socketRows.forEach((newItem: any) => {
            const key =
              newItem.employee_id ||
              newItem.employee_no ||
              newItem.ID ||
              newItem.EmployeeNo;
            if (key) {
              existingMap.set(String(key), newItem);
            }
          });

          // Convert map back to array
          const updated = Array.from(existingMap.values());
          return updated;
        });
        previousSocketRowsRef.current = [...socketRows];
      }
    }
  }, [socketRows, search.page, routeSearchWithFilter]);

  // Map counts from response format
  const countData = useMemo(() => {
    if (!socketCounts) return null;
    return {
      in: socketCounts.in,
      out: socketCounts.out,
      total: socketCounts.total,
    };
  }, [socketCounts]);

  // Get asofData from socket
  const asofData = socketAsof || "";

  // Handle filter changes
  const handleFilter = (key: string, value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [`filter_${key}`]: value || undefined,
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

  return (
    <>
      <div className="space-y-8">
        <CardSection
          headerLeft={<CardHeaderLeft subtitle={`As of ${asofData}`} />}
        >
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <AttendanceCountCard
              count={countData?.in ? formatCountWithCommas(countData.in) : 0}
              icon={<ClockedInIcon />}
              subtitle="Time In"
              variant="success"
            />
            <AttendanceCountCard
              count={countData?.out ? formatCountWithCommas(countData.out) : 0}
              icon={<ClockedOutIcon />}
              subtitle="Time Out"
              variant="error"
            />
            <AttendanceCountCard
              count={
                countData?.total ? formatCountWithCommas(countData.total) : 0
              }
              icon={<InPremisesIcon />}
              subtitle="Total Employees"
            />
          </div>
        </CardSection>
        <CardSection
          headerLeft={
            <CardHeaderLeft
              title={
                <div className="flex items-center space-x-2">
                  <EpsonFlame />
                  <b className="text-[20px] text-primary">Live Data</b>
                </div>
              }
              subtitle=""
            />
          }
        >
          {isSocketConnected && !isSocketLoading ? (
            <div className="flex" key={tableRefreshKey}>
              <SocketDynamicTable
                onLoadMore={handleLoadMore}
                isLoadingMore={false}
                totalCount={socketMeta?.totalItems}
                onRowClick={(row) => {
                  setEmployeeID(row[EMPLOYEE_NO_TABLE_KEY]);
                  setIsOpen(true);
                }}
                columns={[
                  {
                    key: EMPLOYEE_NO_TABLE_KEY,
                    label: "Employee No.",
                  },
                  {
                    key: EMPLOYEE_NAME_TABLE_KEY,
                    label: "Name",
                  },
                  {
                    key: EMPLOYEE_SECTION_TABLE_KEY,
                    label: "Section",
                  },
                  {
                    key: EMPLOYEE_CONTROLLER_TYPE,
                    label: "Type",
                  },
                  {
                    key: EMPLOYEE_DATE_TIME,
                    label: "Date Time",
                  },
                  {
                    key: DEVICE_NAME,
                    label: "Device Name",
                  },
                ]}
                filters={[
                  {
                    key: EMPLOYEE_SECTION_TABLE_KEY,
                    label: "Section",
                    options: Array.from(
                      new Set(
                        accumulatedData.map(
                          (item) => item[EMPLOYEE_SECTION_TABLE_KEY]
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
                    key: "controller_type",
                    label: "Type",
                    options: Array.from(
                      new Set(
                        accumulatedData.map(
                          (item) => `Time ${item[EMPLOYEE_CONTROLLER_TYPE]}`
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
                    key: DEVICE_NAME,
                    label: "Device Name",
                    options: Array.from(
                      new Set(accumulatedData.map((item) => item[DEVICE_NAME]))
                    )
                      .filter(Boolean)
                      .map((item) => ({
                        label: item,
                        value: item,
                      })),
                  },
                ]}
                data={accumulatedData
                  .map((employeeData) => {
                    const {
                      [EMPLOYEE_NO_TABLE_KEY]: employee_id,
                      [EMPLOYEE_SECTION_TABLE_KEY]: section,
                      [EMPLOYEE_CLOCKED_IN_TABLE_KEY]: clocked_in,
                      [EMPLOYEE_DATE_TIME]: date_receive,
                      [EMPLOYEE_NAME_TABLE_KEY]: full_name,
                      [EMPLOYEE_CONTROLLER_TYPE]: controller_type,
                      [DEVICE_NAME]: device_name,
                    } = employeeData;
                    return {
                      [EMPLOYEE_NO_TABLE_KEY]: employee_id,
                      [EMPLOYEE_SECTION_TABLE_KEY]: section,
                      [EMPLOYEE_NAME_TABLE_KEY]: full_name,
                      [EMPLOYEE_CLOCKED_IN_TABLE_KEY]: clocked_in,
                      [EMPLOYEE_DATE_TIME]: date_receive,
                      [EMPLOYEE_CONTROLLER_TYPE]: "Time " + controller_type,
                      device_name,
                    };
                  })
                  .sort((a, b) => {
                    const dateA = new Date(
                      a[EMPLOYEE_DATE_TIME] || 0
                    ).getTime();
                    const dateB = new Date(
                      b[EMPLOYEE_DATE_TIME] || 0
                    ).getTime();
                    return dateB - dateA; // Descending order (newest first)
                  })}
                onFilter={handleFilter}
                onSearch={handleSearch}
                routeSearch={routeSearchWithFilter}
                isLoading={isSocketLoading}
                tableId="divisions-departments-sections-table"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10">
              <Spinner />
              <p>Loading...</p>
            </div>
          )}
        </CardSection>
      </div>
      {isOpen && (
        <EmpInfoDialog
          employee={employee}
          isLoading={isEmployeeLoading}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </>
  );
}
