import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { useEntryExitPointsData } from "@/hooks";
import { EpsonFlame } from "@/assets/svgs";
import Spinner from "@/components/ui/spinner";
import { LiveDataTable } from "@/components/ui/live-data-table";
import CardHeaderRight from "@/components/ui/card-header-right";
import useEntryExitStore from "@/store/useEntryExitStore";
import matchesFilter from "@/utils/matchesFilter";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/entry-exit/$deviceId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_authenticated/evacuation-monitoring/dashboard/entry-exit/$deviceId/",
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
  } = useEntryExitPointsData({
    room: "VIEW_CONTROLLER" + params.deviceId,
    dataType: "live",
  });

  const navigate = useNavigate({
    from: "/evacuation-monitoring/dashboard/entry-exit/$deviceId",
  });

  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/dashboard/entry-exit/$deviceId/",
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

  const { currentSelectedDeviceType } = useEntryExitStore();

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
      headerRight={
        <CardHeaderRight
          clockedOut={
            currentSelectedDeviceType === "Clocked Out"
              ? totalLogs?.out
              : undefined
          }
          clockedIn={
            currentSelectedDeviceType === "Clocked In"
              ? totalLogs?.in
              : undefined
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
                key: "section",
                label: "SECTION",
              },
              {
                key: "name",
                label: "NAME",
              },
              currentSelectedDeviceType === "Clocked In"
                ? {
                    key: "clocked_in",
                    label: "TIME IN",
                  }
                : {
                    key: "clocked_out",
                    label: "TIME OUT",
                  },
            ]}
            filters={[
              {
                key: "employee_id",
                label: "ID",
                options: Array.from(
                  new Set(data.map((item) => item.employee_id))
                ).map((item) => ({
                  label: item,
                  value: item,
                })),
              },
              {
                key: "section",
                label: "Section",
                options: Array.from(
                  new Set(data.map((item) => item.section))
                ).map((item) => ({
                  label: item,
                  value: item,
                })),
              },
              {
                key: "name",
                label: "Name",
                options: Array.from(
                  new Set(data.map((item) => item.full_name))
                ).map((item) => ({
                  label: item,
                  value: item,
                })),
              },
              {
                key: "clocked_in",
                label: "Time In",
                options: Array.from(
                  new Set(data.map((item) => item.clocked_in ?? "-"))
                ).map((item) => ({
                  label: item,
                  value: item,
                })),
              },
              {
                key: "clocked_out",
                label: "Time Out",
                options: Array.from(
                  new Set(data.map((item) => item.clocked_out ?? "-"))
                ).map((item) => ({
                  label: item,
                  value: item,
                })),
              },
            ]}
            data={data
              .map((employeeData) => {
                const {
                  employee_id,
                  section,
                  clocked_in,
                  clocked_out,
                  full_name,
                } = employeeData;
                return {
                  employee_id: employee_id,
                  section: section,
                  name: full_name,
                  clocked_in: clocked_in ?? "-",
                  clocked_out: clocked_out ?? "-",
                };
              })
              .filter((item) => {
                const matchesSection = matchesFilter(
                  item.section ?? "",
                  search.filter_section
                );
                const matchesId = matchesFilter(
                  item.employee_id ?? "",
                  search.filter_employee_id
                );
                const matchesName = matchesFilter(
                  item.name ?? "",
                  search.filter_name
                );
                const matchesTimeIn = matchesFilter(
                  item.clocked_in ?? "",
                  search.filter_clocked_in
                );
                const matchesTimeOut = matchesFilter(
                  item.clocked_out ?? "",
                  search.filter_clocked_out
                );

                return (
                  matchesSection &&
                  matchesId &&
                  matchesName &&
                  matchesTimeIn &&
                  matchesTimeOut
                );
              })
              .reverse()}
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
