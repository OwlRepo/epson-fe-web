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
import matchesFilter from "@/utils/matchesFilter";
import EVSCounts from "@/components/ui/evs-counts";
import { cn } from "@/lib/utils";
import EvacueeInfoDialog from "@/components/dialogs/EvacueeInfoDialog";
import { useState } from "react";
import { unparse } from "papaparse";

interface SearchParams {
  pageSize?: string;
  filter_section?: string;
  filter_employee_id?: string;
  filter_name?: string;
  filter_clocked_in?: string;
  filter_clocked_out?: string;
  filter_status?: string;
  from_log_time?: string;
  to_log_time?: string;
  [key: string]: string | undefined;
}

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/"
)({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    pageSize: search.pageSize as string,
    filter_section: search.filter_section as string,
    filter_employee_id: search.filter_employee_id as string,
    filter_name: search.filter_name as string,
    filter_clocked_in: search.filter_clocked_in as string,
    filter_clocked_out: search.filter_clocked_out as string,
    filter_status: search.filter_status as string,
    from_log_time: search.from_log_time as string,
    to_log_time: search.to_log_time as string,
    ...Object.entries(search)
      .filter(
        ([key]) =>
          key.startsWith("filter_") ||
          key.startsWith("from_") ||
          key.startsWith("to_")
      )
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
  } = useEmployeeData({
    useSearchFrom:
      "/_authenticated/evacuation-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/",
  });

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const navigate = useNavigate({
    from: "/evacuation-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId",
  });

  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/",
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

  //handle click row
  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleExport = () => {
    const summary = [
      { key: "Overall", value: totalLogs?.total },
      { key: "Safe", value: totalLogs?.safe },
      { key: "Injured", value: totalLogs?.injured },
      { key: "Go Home", value: totalLogs?.home },
      { key: "Missing", value: totalLogs?.missing },
    ];

    const summaryCsv = unparse(summary, { header: false });
    const liveData = unparse(data, { header: true });

    const csvContent = `\n${summaryCsv}\n\n${liveData}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
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
                  key: "name",
                  label: "NAME",
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
                  const {
                    employee_id,
                    section,
                    clocked_in,
                    clocked_out,
                    full_name,
                    eva_status,
                    log_time,
                    epc,
                    division,
                    remarks,
                  } = employeeData;
                  return {
                    employee_id: employee_id,
                    section: section,
                    name: full_name,
                    clocked_in: clocked_in,
                    clocked_out: clocked_out,
                    eva_status: eva_status,
                    log_time: log_time,
                    division: division,
                    epc: epc,
                    raw_status: eva_status,
                    remarks: remarks,
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
                  const matchesStatus = matchesFilter(
                    item.eva_status ?? "",
                    search.filter_status
                  );
                  return (
                    matchesSection &&
                    matchesId &&
                    matchesName &&
                    matchesTimeIn &&
                    matchesTimeOut &&
                    matchesStatus
                  );
                })
                .reverse()
                .map((item) => ({
                  ...item,
                  eva_status: (
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          `flex items-center gap-1.5 px-2 py-1 rounded-full border`,
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
                        <span className="text-xs font-bold">
                          {item.eva_status}
                        </span>
                      </div>
                    </div>
                  ),
                }))}
              onFilter={handleFilter}
              onSearch={handleSearch}
              routeSearch={search}
              isLoading={false}
              tableId="divisions-departments-sections-table"
              onRowClick={handleRowClick}
              exportTableData={{
                exportBtnLabel: "Export Records",
                type: "EVS",
                exportBtnOnClick: handleExport,
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10">
            <Spinner />
            <p>Loading...</p>
          </div>
        )}
      </CardSection>
      {open && (
        <EvacueeInfoDialog
          open={open}
          onOpenChange={setOpen}
          evacuee={selectedRow}
        />
      )}
    </>
  );
}
