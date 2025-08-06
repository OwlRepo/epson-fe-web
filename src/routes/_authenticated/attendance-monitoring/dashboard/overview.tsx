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
import { LiveDataTable } from "@/components/ui/live-data-table";
import Spinner from "@/components/ui/spinner";
import { useGetEmployeeByNo } from "@/hooks/query/useGetEmployeeById";
import { useOverviewCountData } from "@/hooks/useOverviewCountData";
import formatCountWithCommas from "@/utils/formatCountWithCommas";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import matchesFilter from "@/utils/matchesFilter";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/dashboard/overview"
)({
  component: RouteComponent,
});
// table keys
const EMPLOYEE_NO_TABLE_KEY = "employee_id";
const EMPLOYEE_NAME_TABLE_KEY = "full_name";
const EMPLOYEE_SECTION_TABLE_KEY = "section";
const EMPLOYEE_CLOCKED_IN_TABLE_KEY = "clocked_in";
const EMPLOYEE_CLOCKED_OUT_TABLE_KEY = "clocked_out";

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

  const {
    data: liveData,
    isLoading: isLiveDataLoading,
    isConnected: isLiveDataConnected,
    countData,
    clearData,
    emitData,
    searchData,
    clearSearch,
    searchTerm,
  } = useOverviewCountData({
    room: "AMS",
    dataType: "live",
  });

  return (
    <>
      <div className="space-y-8">
        <CardSection headerLeft={<CardHeaderLeft />}>
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
          {isLiveDataConnected && !isLiveDataLoading ? (
            <div className="flex">
              <LiveDataTable
                pageSize={Number(search.pageSize) || 10}
                onPageSizeChange={handlePageSizeChange}
                clearSocketData={clearData}
                emitSocketData={emitData}
                searchTerm={searchTerm}
                onClearSearch={clearSearch}
                onRowClick={(row) => {
                  setEmployeeID(row.employee_id);
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
                    key: EMPLOYEE_CLOCKED_IN_TABLE_KEY,
                    label: "Time In",
                  },
                  {
                    key: EMPLOYEE_CLOCKED_OUT_TABLE_KEY,
                    label: "Time Out",
                  },
                ]}
                filters={[
                  {
                    key: EMPLOYEE_NO_TABLE_KEY,
                    label: "ID",
                    options: Array.from(
                      new Set(liveData.map((item) => item.employee_id))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: EMPLOYEE_SECTION_TABLE_KEY,
                    label: "Section",
                    options: Array.from(
                      new Set(liveData.map((item) => item.section))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: EMPLOYEE_NAME_TABLE_KEY,
                    label: "Name",
                    options: Array.from(
                      new Set(liveData.map((item) => item.full_name))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: EMPLOYEE_CLOCKED_IN_TABLE_KEY,
                    label: "Time In",
                    options: Array.from(
                      new Set(liveData.map((item) => item.clocked_in ?? "-"))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: EMPLOYEE_CLOCKED_OUT_TABLE_KEY,
                    label: "Time Out",
                    options: Array.from(
                      new Set(liveData.map((item) => item.clocked_out ?? "-"))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                ]}
                data={liveData
                  .map((employeeData) => {
                    const {
                      [EMPLOYEE_NO_TABLE_KEY]: employee_id,
                      [EMPLOYEE_SECTION_TABLE_KEY]: section,
                      [EMPLOYEE_CLOCKED_IN_TABLE_KEY]: clocked_in,
                      [EMPLOYEE_CLOCKED_OUT_TABLE_KEY]: clocked_out,
                      [EMPLOYEE_NAME_TABLE_KEY]: full_name,
                    } = employeeData;
                    return {
                      [EMPLOYEE_NO_TABLE_KEY]: employee_id,
                      [EMPLOYEE_SECTION_TABLE_KEY]: section,
                      [EMPLOYEE_NAME_TABLE_KEY]: full_name,
                      [EMPLOYEE_CLOCKED_IN_TABLE_KEY]: clocked_in,
                      [EMPLOYEE_CLOCKED_OUT_TABLE_KEY]: clocked_out,
                    };
                  })
                  .filter((item) => {
                    const matchesSection = matchesFilter(
                      item[EMPLOYEE_SECTION_TABLE_KEY] ?? "",
                      search.filter_section
                    );
                    const matchesId = matchesFilter(
                      item[EMPLOYEE_NO_TABLE_KEY] ?? "",
                      search.filter_employee_id
                    );
                    const matchesName = matchesFilter(
                      item[EMPLOYEE_NAME_TABLE_KEY] ?? "",
                      search.filter_name
                    );
                    const matchesTimeIn =
                      !search.filter_clocked_in ||
                      item[EMPLOYEE_CLOCKED_IN_TABLE_KEY] ===
                        search.filter_clocked_in;
                    const matchesTimeOut =
                      !search.filter_clocked_out ||
                      item[EMPLOYEE_CLOCKED_OUT_TABLE_KEY] ===
                        search.filter_clocked_out;

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
