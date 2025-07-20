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
import matchesFilter from "@/utils/matchesFilter";

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
    clearData,
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
              subtitle="Incoming"
              variant="success"
            />
            <AttendanceCountCard
              count={
                countData?.out ? parseInt(countShortener(countData.out)) : 0
              }
              icon={<ClockedOutIcon />}
              subtitle="Outgoing"
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
                clearSocketData={clearData}
                onRowClick={(row) => {
                  setEmployeeID(row.employee_id);
                  setIsOpen(true);
                }}
                columns={[
                  {
                    key: "employee_id",
                    label: "ID",
                  },
                  {
                    key: "section",
                    label: "Section",
                  },
                  {
                    key: "name",
                    label: "Name",
                  },
                  {
                    key: "clocked_in",
                    label: "Incoming",
                  },
                  {
                    key: "clocked_out",
                    label: "Outgoing",
                  },
                ]}
                filters={[
                  {
                    key: "employee_id",
                    label: "ID",
                    options: Array.from(
                      new Set(liveData.map((item) => item.employee_id))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "section",
                    label: "Section",
                    options: Array.from(
                      new Set(liveData.map((item) => item.section))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "name",
                    label: "Name",
                    options: Array.from(
                      new Set(liveData.map((item) => item.full_name))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "clocked_in",
                    label: "Incoming",
                    options: Array.from(
                      new Set(liveData.map((item) => item.clocked_in ?? "-"))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "clocked_out",
                    label: "Outgoing",
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
