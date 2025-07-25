import { EpsonEvsFlame, EvacuatedIcon, InPremisesEvsIcon } from "@/assets/svgs";
import CardSection from "@/components/layouts/CardSection";
import AttendanceCountCard from "@/components/ui/attendance-count-card";
import CardHeaderLeft from "@/components/ui/card-header-left";

import { LiveDataTable } from "@/components/ui/live-data-table";
import Spinner from "@/components/ui/spinner";

import { useOverviewCountData } from "@/hooks/useOverviewCountData";
import formatCountWithCommas from "@/utils/count-shortener";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import matchesFilter from "@/utils/matchesFilter";

import AssignPersonnelDialog from "@/components/dialogs/AssignPersonnelDialog";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({
    from: "/evacuation-monitoring/dashboard/overview",
  });
  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/dashboard/overview",
  });

  //employee data
  const [isOpen, setIsOpen] = useState(false);
  const [, setEmployeeID] = useState("");

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
              count={
                countData?.inside
                  ? parseInt(formatCountWithCommas(countData.inside))
                  : 0
              }
              icon={<InPremisesEvsIcon />}
              subtitle="Inside premises"
              variant="error"
            />
            <AttendanceCountCard
              count={
                countData?.in
                  ? parseInt(formatCountWithCommas(countData.in))
                  : 0
              }
              icon={<EvacuatedIcon />}
              subtitle="Evacuated"
              variant="success"
            />
          </div>
        </CardSection>
        <CardSection
          headerLeft={
            <CardHeaderLeft
              title={
                <div className="flex items-center space-x-2 text-primary-evs">
                  <EpsonEvsFlame />
                  <b className="text-[20px]">Live Data</b>
                </div>
              }
              subtitle=""
            />
          }
        >
          {isLiveDataConnected && !isLiveDataLoading ? (
            <div className="flex">
              <LiveDataTable
                clearSocketData={clearData}
                searchTerm={searchTerm}
                onClearSearch={clearSearch}
                pageSize={Number(search.pageSize) || 10}
                onPageSizeChange={handlePageSizeChange}
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
                    label: "Time In",
                  },
                  {
                    key: "clocked_out",
                    label: "Time Out",
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
                    label: "Time In",
                    options: Array.from(
                      new Set(liveData.map((item) => item.clocked_in ?? "-"))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "clocked_out",
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
        <AssignPersonnelDialog open={isOpen} onOpenChange={setIsOpen} />
      )}
    </>
  );
}
