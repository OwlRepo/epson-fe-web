import { EpsonEvsFlame } from "@/assets/svgs";
import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";

import { LiveDataTable } from "@/components/ui/live-data-table";
import Spinner from "@/components/ui/spinner";

import { useOverviewCountData } from "@/hooks/useOverviewCountData";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import matchesFilter from "@/utils/matchesFilter";

import AssignPersonnelDialog from "@/components/dialogs/AssignPersonnelDialog";
import EVSCounts from "@/components/ui/evs-counts";

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
    room: "evs",
    dataType: "live",
  });

  return (
    <>
      <div className="space-y-8">
        <EVSCounts countData={countData} />
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
                    key: "type",
                    label: "Type",
                  },
                  {
                    key: "name",
                    label: "Name",
                  },
                  {
                    key: "status",
                    label: "Status",
                  },
                  {
                    key: "date_time",
                    label: "Date",
                  },
                ]}
                filters={[
                  // {
                  //   key: "employee_id",
                  //   label: "ID",
                  //   options: Array.from(
                  //     new Set(liveData.map((item) => item.employee_id))
                  //   ).map((item) => ({
                  //     label: item,
                  //     value: item,
                  //   })),
                  // },
                  // {
                  //   key: "name",
                  //   label: "Name",
                  //   options: Array.from(
                  //     new Set(liveData.map((item) => item.full_name))
                  //   ).map((item) => ({
                  //     label: item,
                  //     value: item,
                  //   })),
                  // },
                  {
                    key: "type",
                    label: "Type",
                    options: Array.from(
                      new Set(liveData.map((item) => item.user_type))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "status",
                    label: "Status",
                    options: ["Safe", "Injured", "Go Home", "Missing"].map(
                      (item) => ({
                        label: item,
                        value: item,
                      })
                    ),
                  },
                  {
                    key: "date_time",
                    label: "Date",
                    options: Array.from(
                      new Set(liveData.map((item) => item.date_time ?? "-"))
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
                      full_name,
                      user_type,
                      eva_status,
                      evacuation_time,
                    } = employeeData;
                    return {
                      employee_id: employee_id,
                      name: full_name,
                      type: user_type,
                      date_time: evacuation_time,
                      status: eva_status,
                    };
                  })
                  .filter((item) => {
                    const matchesId = !search.filter_employee_id
                      ? true
                      : matchesFilter(
                          item.employee_id.toString() ?? "",
                          search.filter_employee_id
                        );
                    const matchesType = !search.filter_type
                      ? true
                      : matchesFilter(item.type ?? "", search.filter_type);
                    const matchesName = matchesFilter(
                      item.name ?? "",
                      search.filter_name
                    );
                    const matchesDate = !search.filter_date_time
                      ? true
                      : matchesFilter(
                          item.date_time ?? "",
                          search.filter_date_time
                        );
                    const matchesStatus = !search.filter_status
                      ? true
                      : matchesFilter(item.status ?? "", search.filter_status);

                    return (
                      matchesId &&
                      matchesType &&
                      matchesName &&
                      matchesDate &&
                      matchesStatus
                    );
                  })
                  .reverse()}
                onFilter={handleFilter}
                onSearch={handleSearch}
                routeSearch={search}
                isLoading={false}
                tableId="evs-table"
                exportTableData={{
                  type: "EVS",
                  exportBtnLabel: "Evacuated",
                  exportOptions: [
                    {
                      label: "Evacuated",
                      onClick: () => {
                        console.log(liveData);
                      },
                    },
                    {
                      label: "Inside Premises(Missing)",
                      onClick: () => {
                        console.log(Object.values(liveData));
                      },
                    },
                  ],
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
      </div>
      {isOpen && (
        <AssignPersonnelDialog open={isOpen} onOpenChange={setIsOpen} />
      )}
    </>
  );
}
