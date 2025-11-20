import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEmployeeData } from "@/hooks";
import { EpsonFlame } from "@/assets/svgs";
import Spinner from "@/components/ui/spinner";
import { LiveDataTable } from "@/components/ui/live-data-table";
import CardHeaderRight from "@/components/ui/card-header-right";
import matchesFilter from "@/utils/matchesFilter";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data,
    isLoading,
    isConnected,
    countData: totalLogs,
    clearData,
    emitData,
    searchData,
    clearSearch,
    searchTerm,
    asofData,
  } = useEmployeeData();

  const navigate = useNavigate({
    from: "/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId",
  });

  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/",
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
        <CardHeaderRight
          clockedOut={totalLogs?.out}
          clockedIn={totalLogs?.in}
        />
      }
      headerLeft={
        <CardHeaderLeft
          title={
            <div className="flex items-center space-x-2">
              <EpsonFlame />
              <b className="text-[20px] text-primary">Live Data</b>
            </div>
          }
          subtitle={`As of ${asofData}`}
        />
      }
    >
      {isConnected && !isLoading ? (
        <div className="flex">
          <LiveDataTable
            clearSocketData={clearData}
            emitSocketData={emitData}
            searchTerm={searchTerm}
            onClearSearch={clearSearch}
            pageSize={Number(search.pageSize) || 10}
            onPageSizeChange={handlePageSizeChange}
            columns={[
              {
                key: "employee_no",
                label: "EMPLOYEE NO.",
              },
              {
                key: "name",
                label: "NAME",
              },
              {
                key: "section",
                label: "SECTION",
              },
              {
                key: "controller_type",
                label: "TYPE",
              },
              {
                key: "date_receive",
                label: "DATE TIME",
              },
              {
                key: "device_name",
                label: "DEVICE NAME",
              },
            ]}
            filters={[
              // {
              //   key: "employee_no",
              //   label: "ID",
              //   options: Array.from(
              //     new Set(data.map((item) => item.employee_no))
              //   ).map((item) => ({
              //     label: item,
              //     value: item,
              //   })),
              // },
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
                key: "controller_type",
                label: "Type",
                options: Array.from(
                  new Set(data.map((item) => item.controller_type))
                ).map((item) => ({
                  label: item,
                  value: item,
                })),
              },
              {
                key: "device_name",
                label: "Device Name",
                options: Array.from(
                  new Set(data.map((item: any) => item.device_name))
                ).map((item) => ({
                  label: item,
                  value: item,
                })),
              },
              // {
              //   key: "name",
              //   label: "Name",
              //   options: Array.from(
              //     new Set(data.map((item) => item.full_name))
              //   ).map((item) => ({
              //     label: item,
              //     value: item,
              //   })),
              // },
              // {
              //   key: "clocked_in",
              //   label: "Time In",
              //   options: Array.from(
              //     new Set(data.map((item) => item.clocked_in ?? "-"))
              //   ).map((item) => ({
              //     label: item,
              //     value: item,
              //   })),
              // },
              // {
              //   key: "clocked_out",
              //   label: "Time Out",
              //   options: Array.from(
              //     new Set(data.map((item) => item.clocked_out ?? "-"))
              //   ).map((item) => ({
              //     label: item,
              //     value: item,
              //   })),
              // },
            ]}
            data={data
              .map((employeeData) => {
                const {
                  employee_no,
                  section,
                  clocked_in,
                  clocked_out,
                  full_name,
                  controller_type,
                  date_receive,
                  device_name,
                } = employeeData;
                return {
                  employee_no: employee_no,
                  section: section,
                  name: full_name,
                  clocked_in: clocked_in,
                  clocked_out: clocked_out,
                  controller_type: "Time " + controller_type,
                  date_receive: date_receive,
                  device_name,
                };
              })
              .filter((item: any) => {
                const matchesSection = matchesFilter(
                  item.section ?? "",
                  search.filter_section
                );
                const matchesId = matchesFilter(
                  item.employee_no ?? "",
                  search.filter_employee_no
                );
                const matchesName = matchesFilter(
                  item.name ?? "",
                  search.filter_name
                );
                const matchesTimeIn =
                  !search.filter_clocked_in ||
                  item.clocked_in === search.filter_clocked_in;
                const matchesTimeOut =
                  !search.filter_clocked_out ||
                  item.clocked_out === search.filter_clocked_out;

                const matchesDeviceName = matchesFilter(
                  item.device_name ?? "",
                  search.filter_device_name
                );

                const matchesType = matchesFilter(
                  "controller_type",
                  search.filter_controller_type
                );

                return (
                  matchesSection &&
                  matchesId &&
                  matchesName &&
                  matchesTimeIn &&
                  matchesTimeOut &&
                  matchesDeviceName &&
                  matchesType
                );
              })
              .sort((a, b) => {
                const dateA = new Date(a.date_receive || 0).getTime();
                const dateB = new Date(b.date_receive || 0).getTime();
                return dateB - dateA; // Descending order (newest first)
              })}
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
