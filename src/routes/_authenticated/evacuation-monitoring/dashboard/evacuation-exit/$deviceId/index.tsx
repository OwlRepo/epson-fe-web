import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";

import { EpsonFlame } from "@/assets/svgs";
import Spinner from "@/components/ui/spinner";
import { LiveDataTable } from "@/components/ui/live-data-table";
import matchesFilter from "@/utils/matchesFilter";
import { useEvacuationExitsData } from "@/hooks/useEvacuationExitsData";
import EVSCounts from "@/components/ui/evs-counts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/evacuation-exit/$deviceId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_authenticated/evacuation-monitoring/dashboard/evacuation-exit/$deviceId/",
  });
  const {
    data,
    isLoading,
    isConnected,
    countData: totalLogs,
    clearData,
    searchData,
    clearSearch,
    searchTerm,
  } = useEvacuationExitsData({
    room: "evs_device" + params.deviceId,
    dataType: "live",
  });

  const navigate = useNavigate({
    from: "/evacuation-monitoring/dashboard/evacuation-exit/$deviceId",
  });

  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/dashboard/evacuation-exit/$deviceId/",
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
      headerRight={<EVSCounts countData={totalLogs} type="compact" />}
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
                key: "id",
                label: "ID",
              },
              {
                key: "name",
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
            filters={[]}
            data={data
              .map((employeeData) => {
                const { id, name, user_type, eva_status, log_time } =
                  employeeData;
                return {
                  id: id,
                  name: name,
                  user_type: user_type,
                  eva_status: eva_status,
                  log_time: log_time,
                };
              })
              .filter((item) => {
                const matchesId = matchesFilter(
                  item.id ?? "",
                  search.filter_employee_id
                );
                const matchesName = matchesFilter(
                  item.name ?? "",
                  search.filter_name
                );
                const matchesStatus = matchesFilter(
                  item.eva_status ?? "",
                  search.filter_status
                );

                return matchesId && matchesName && matchesStatus;
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
