import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useVisitorsGuestData } from "@/hooks/useVisitorsGuestData";
import { EpsonFlame } from "@/assets/svgs";
import Spinner from "@/components/ui/spinner";
import { LiveDataTable } from "@/components/ui/live-data-table";
import matchesFilter from "@/utils/matchesFilter";
import EVSCounts from "@/components/ui/evs-counts";
import { cn } from "@/lib/utils";

interface SearchParams {
  pageSize?: string;
  filter_employee_id?: string;
  filter_full_name?: string;
  filter_user_type?: string;
  filter_eva_status?: string;
  from_log_time?: string;
  to_log_time?: string;
  [key: string]: string | undefined;
}

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/visitor-guest"
)({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    pageSize: search.pageSize as string,
    filter_employee_id: search.filter_employee_id as string,
    filter_full_name: search.filter_full_name as string,
    filter_user_type: search.filter_user_type as string,
    filter_eva_status: search.filter_eva_status as string,
    from_log_time: search.from_log_time as string,
    to_log_time: search.to_log_time as string,
    ...Object.entries(search)
      .filter(([key]) => key.startsWith("filter_") || key.startsWith("from_") || key.startsWith("to_"))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value as string }), {}),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data,
    isLoading,
    isConnected,
    countData: totalLogs,
    clearData,
    searchData,
    clearSearch,
    searchTerm,
  } = useVisitorsGuestData({
    room: "evs_visitor",
    dataType: "live",
  });

  const navigate = useNavigate({
    from: "/evacuation-monitoring/dashboard/visitor-guest",
  });

  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/dashboard/visitor-guest",
  });
  // Handle filter changes
  const handleFilter = (key: string, value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [`filter_${key}`]: value || undefined,
      }),
      replace: true,
    });
  };

  // Handle search using socket functionality
  const handleSearch = (searchTerm: string) => {
    searchData(searchTerm);
  };

  // Add handler for page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageSize: String(newPageSize),
      }),
      replace: true,
    });
  };

  return (
    <CardSection
      headerRight={<EVSCounts type="compact" countData={totalLogs} />}
      headerLeft={
        <CardHeaderLeft
          title={
            <div className="flex items-center space-x-2">
              <EpsonFlame />
              <b className="text-[20px] text-primary">Live Data</b>
            </div>
          }
        />
      }
    >
      {isConnected && !isLoading ? (
        <div className="flex">
          <LiveDataTable
            clearSocketData={clearData}
            searchTerm={searchTerm}
            onClearSearch={clearSearch}
            pageSize={Number(search.pageSize) || 10}
            onPageSizeChange={handlePageSizeChange}
            columns={[
              {
                key: "employee_id",
                label: "ID",
              },
              {
                key: "full_name",
                label: "NAME",
              },
              {
                key: "user_type",
                label: "TYPE",
              },
              {
                key: "eva_status",
                label: "STATUS",
              },
              {
                key: "log_time",
                label: "EVACUATE TIME",
              },
            ]}
            filters={[
              {
                key: "user_type",
                label: "Type",
                options: Array.from(
                  new Set(data.map((item) => item.user_type))
                ).map((item) => ({
                  label: item,
                  value: item,
                })),
              },
              {
                key: "eva_status",
                label: "Status",
                options: ["Safe", "Injured", "Home", "Missing"].map(
                  (item) => ({
                    label: item,
                    value: item,
                  })
                ),
              },
              {
                key: "log_time",
                label: "Evacuate Time Range",
                isDateTimeRangePicker: true,
              },
            ]}
            data={data
              .map((employeeData) => {
                const {
                  employee_id,
                  eva_status,
                  log_time,
                  full_name,
                  user_type,
                } = employeeData;
                return {
                  employee_id: employee_id,
                  eva_status: eva_status,
                  log_time: log_time,
                  full_name: full_name,
                  user_type: user_type,
                };
              })
              .filter((item) => {
                const matchesId = !search.filter_employee_id
                  ? true
                  : matchesFilter(item.employee_id ?? "", search.filter_employee_id);
                const matchesName = !search.filter_full_name
                  ? true
                  : matchesFilter(item.full_name ?? "", search.filter_full_name);
                const matchesType = !search.filter_user_type
                  ? true
                  : matchesFilter(item.user_type ?? "", search.filter_user_type);
                const matchesStatus = !search.filter_eva_status
                  ? true
                  : matchesFilter(item.eva_status ?? "", search.filter_eva_status);
                
                // Handle date-time range filtering for log_time
                const matchesLogTime = (() => {
                  const fromLogTime = search.from_log_time;
                  const toLogTime = search.to_log_time;
                  
                  if (!fromLogTime && !toLogTime) return true;
                  
                  // Parse the date format: "Aug 17, 2025 11:37 pm"
                  const parseCustomDate = (dateStr: string) => {
                    if (!dateStr) return null;
                    
                    try {
                      // First try direct parsing
                      let parsedDate = new Date(dateStr);
                      
                      // If that fails, try to handle the custom format
                      if (isNaN(parsedDate.getTime())) {
                        // Handle format like "Aug 17, 2025 11:37 pm"
                        const cleanedStr = dateStr
                          .replace(/(\d{1,2}):(\d{2})\s+(am|pm)/i, (_, hour, min, period) => {
                            let h = parseInt(hour);
                            if (period.toLowerCase() === 'pm' && h !== 12) h += 12;
                            if (period.toLowerCase() === 'am' && h === 12) h = 0;
                            return `${h.toString().padStart(2, '0')}:${min}:00`;
                          });
                        
                        parsedDate = new Date(cleanedStr);
                      }
                      
                      return isNaN(parsedDate.getTime()) ? null : parsedDate;
                    } catch {
                      return null;
                    }
                  };
                  
                  const itemDateTime = parseCustomDate(item.log_time ?? "");
                  if (!itemDateTime) return true; // Invalid date, include it
                  
                  let matches = true;
                  
                  if (fromLogTime) {
                    const fromDate = new Date(fromLogTime);
                    if (!isNaN(fromDate.getTime())) {
                      matches = matches && itemDateTime >= fromDate;
                    }
                  }
                  
                  if (toLogTime) {
                    const toDate = new Date(toLogTime);
                    if (!isNaN(toDate.getTime())) {
                      matches = matches && itemDateTime <= toDate;
                    }
                  }
                  
                  return matches;
                })();

                return matchesId && matchesName && matchesType && matchesStatus && matchesLogTime;
              })
              .reverse()
              .map((item) => ({
                ...item,
                eva_status: (
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        `flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border`,
                        item.eva_status === "Missing" &&
                          "border-red-200 border  bg-red-50 text-red-500",
                        item.eva_status === "Safe" &&
                          "border-green-200 border  bg-green-50 text-green-500",
                        item.eva_status === "Injured" &&
                          "border-yellow-200 border  bg-yellow-50 text-yellow-500",
                        item.eva_status === "Home" &&
                          "border-blue-200 border  bg-blue-50 text-blue-500"
                      )}
                    >
                      <span className="font-medium">{item.eva_status}</span>
                    </div>
                  </div>
                ),
              }))}
            onFilter={handleFilter}
            onSearch={handleSearch}
            routeSearch={search}
            isLoading={false}
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
  );
}
