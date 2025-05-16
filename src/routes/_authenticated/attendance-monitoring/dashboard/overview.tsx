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
import countShortener from "@/utils/count-shortener";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({
    from: "/attendance-monitoring/dashboard/overview",
  });
  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/dashboard/overview",
  });

  //employee data
  const [isOpen, setIsOpen] = useState(false);
  const [employeeNo, setEmployeeNo] = useState("");
  const { data: employee, isLoading: isEmployeeLoading } =
    useGetEmployeeByNo(employeeNo);

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

  // Handle search
  const handleSearch = (searchTerm: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchTerm,
      }),
      replace: true,
    });
  };

  const {
    data: liveData,
    isLoading: isLiveDataLoading,
    isConnected: isLiveDataConnected,
    countData,
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
              count={
                countData?.inside
                  ? parseInt(countShortener(countData.inside))
                  : 0
              }
              icon={<InPremisesIcon />}
              subtitle="Inside premises"
            />
            <AttendanceCountCard
              count={countData?.in ? parseInt(countShortener(countData.in)) : 0}
              icon={<ClockedInIcon />}
              subtitle="Clocked in"
              variant="success"
            />
            <AttendanceCountCard
              count={
                countData?.out ? parseInt(countShortener(countData.out)) : 0
              }
              icon={<ClockedOutIcon />}
              subtitle="Clocked out"
              variant="error"
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
                onRowClick={(row) => {
                  setEmployeeNo(row.employee_id);
                  setIsOpen(true);
                }}
                columns={[
                  {
                    key: "employee_id",
                    label: "ID",
                  },
                  {
                    key: "department",
                    label: "DEPARTMENT",
                  },
                  {
                    key: "name",
                    label: "NAME",
                  },
                  {
                    key: "clocked_in",
                    label: "CLOCKED IN",
                  },
                  {
                    key: "clocked_out",
                    label: "CLOCKED OUT",
                  },
                ]}
                filters={[
                  {
                    key: "employee_id",
                    label: "ID",
                    options: [
                      { label: "All", value: "" },
                      ...liveData.map((item) => ({
                        label: item.employee_id,
                        value: item.employee_id,
                      })),
                    ],
                  },
                  {
                    key: "department",
                    label: "Department",
                    options: [
                      ...liveData.map((item) => ({
                        label: item.department,
                        value: item.department,
                      })),
                    ],
                  },
                  {
                    key: "name",
                    label: "Name",
                    options: [
                      ...liveData.map((item) => ({
                        label: item.full_name,
                        value: item.full_name,
                      })),
                    ],
                  },
                  {
                    key: "dateTime",
                    label: "Date & Time",
                    isDateTimePicker: true,
                  },
                ]}
                data={liveData
                  .map((employeeData) => {
                    const {
                      employee_id,
                      department,
                      in: clockedIn,
                      out,
                      full_name,
                    } = employeeData;
                    return {
                      employee_id: employee_id,
                      department: department,
                      name: full_name,
                      clocked_in: clockedIn,
                      clocked_out: out,
                    };
                  })
                  .filter((item) => {
                    const matchesDepartment =
                      !search.filter_department ||
                      item.department === search.filter_department;
                    const matchesId =
                      !search.filter_employee_id ||
                      item.employee_id === search.filter_employee_id;
                    const matchesName =
                      !search.filter_name || item.name === search.filter_name;

                    return matchesDepartment && matchesId && matchesName;
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
