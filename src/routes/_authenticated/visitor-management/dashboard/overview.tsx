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
import { useGetVisitorById } from "@/hooks/query/useGetVisitorById";
import { useOverviewCountData } from "@/hooks/useOverviewCountData";
import countShortener from "@/utils/count-shortener";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({
    from: "/visitor-management/dashboard/overview",
  });
  const search = useSearch({
    from: "/_authenticated/visitor-management/dashboard/overview",
  });

  //employee data
  const [isOpen, setIsOpen] = useState(false);
  const [visitorID, setVisitorID] = useState("");
  const { data: visitor, isLoading: isVisitorLoading } =
    useGetVisitorById(visitorID);

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
    room: "VMS",
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
                  setVisitorID(row.ID);
                  setIsOpen(true);
                }}
                columns={[
                  {
                    key: "ID",
                    label: "ID",
                  },
                  {
                    key: "Name",
                    label: "NAME",
                  },
                  {
                    key: "Purpose",
                    label: "PURPOSE",
                  },
                  {
                    key: "clocked_in",
                    label: "CHECKED IN",
                  },
                  {
                    key: "clocked_out",
                    label: "CHECKED OUT",
                  },
                ]}
                filters={[
                  {
                    key: "employee_id",
                    label: "ID",
                    options: Array.from(
                      new Set(liveData.map((item) => item.ID))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "Name",
                    label: "Name",
                    options: Array.from(
                      new Set(liveData.map((item) => item.Name))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "Purpose",
                    label: "Purpose",
                    options: Array.from(
                      new Set(liveData.map((item) => item.Purpose))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "clocked_in",
                    label: "Checked In",
                    options: Array.from(
                      new Set(liveData.map((item) => item.clocked_in ?? "-"))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "clocked_out",
                    label: "Checked Out",
                    options: Array.from(
                      new Set(liveData.map((item) => item.clocked_out ?? "-"))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                ]}
                data={liveData
                  .map((visitorData) => {
                    const { ID, Name, clocked_in, clocked_out, Purpose } =
                      visitorData;
                    return {
                      ID: ID,
                      Name: Name,
                      Purpose: Purpose,
                      clocked_in: clocked_in,
                      clocked_out: clocked_out,
                    };
                  })
                  .filter((item) => {
                    const matchesId =
                      !search.filter_ID || item.ID === search.filter_ID;
                    const matchesName =
                      !search.filter_Name || item.Name === search.filter_Name;
                    const matchesPurpose =
                      !search.filter_Purpose ||
                      item.Purpose === search.filter_Purpose;
                    const matchesClockedIn =
                      !search.filter_clocked_in ||
                      item.clocked_in === search.filter_clocked_in;
                    const matchesClockedOut =
                      !search.filter_clocked_out ||
                      item.clocked_out === search.filter_clocked_out;

                    return (
                      matchesId &&
                      matchesName &&
                      matchesPurpose &&
                      matchesClockedIn &&
                      matchesClockedOut
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
          employee={visitor}
          isLoading={isVisitorLoading}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </>
  );
}
