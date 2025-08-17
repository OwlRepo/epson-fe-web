import { EpsonFlame } from "@/assets/svgs";
import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import CardHeaderRight from "@/components/ui/card-header-right";
import EVSCounts from "@/components/ui/evs-counts";
import { LiveDataTable } from "@/components/ui/live-data-table";
import Spinner from "@/components/ui/spinner";
import { useCDEPROControllerData } from "@/hooks/useCDEPROControllerData";
import matchesFilter from "@/utils/matchesFilter";
import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/cdepro/$controllerId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_authenticated/evacuation-monitoring/cdepro/$controllerId/",
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
  } = useCDEPROControllerData({
    room: "cdepro_department" + params.controllerId,
    dataType: "live",
  });

  const navigate = useNavigate({
    from: "/evacuation-monitoring/cdepro/$controllerId",
  });

  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/cdepro/$controllerId/",
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
      headerRight={
        <EVSCounts countData={totalLogs} type="compact" countType="cdepro" />
      }
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
                key: "position",
                label: "POSITION",
              },
              {
                key: "contact_no",
                label: "CONTACT NO.",
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
                  clocked_in: clocked_in,
                  clocked_out: clocked_out,
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
            isLoading={false}
            tableId="cdepro-controller-table"
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
