import { ClockedInIcon, ClockedOutIcon, InPremisesIcon } from "@/assets/svgs";
import { type VisitorData } from "@/components/BasicInformationForm";
import CardSection from "@/components/layouts/CardSection";
import AttendanceCountCard from "@/components/ui/attendance-count-card";
import CardHeaderLeft from "@/components/ui/card-header-left";

import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/dynamic-table";
import { ReservedGuestInfoDialog } from "@/components/ui/reserved-guest-dialog.card";

import { useGetVisitorById } from "@/hooks/query/useGetVisitorById";
import { useGetVisitors } from "@/hooks/query/useGetVisitors";
import { useGetVisitorsStatistics } from "@/hooks/query/useGetVisitorsStatistics";
import { useGetVisitorTypes } from "@/hooks/query/useGetVisitorTypes";
import countShortener from "@/utils/count-shortener";
import { objToParams } from "@/utils/objToParams";

import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/reserved-guest/overview"
)({
  component: RouteComponent,
});

const tableId = "employee-table";

export interface GuestType {
  id: number | string;
  name: string;
}

// Column definitions
const columns: Column[] = [
  { key: "ID", label: "ID" },
  { key: "Name", label: "Name" },
  {
    key: "GuestType",
    label: "Guest Type",
    render: (row) => row.GuestType.name,
  },
  { key: "Purpose", label: "Purpose" },
  { key: "DateFrom", label: "From Date" },
  { key: "DateTo", label: "To Date" },
];

function RouteComponent() {
  const search = useSearch({
    from: "/_authenticated/visitor-management/reserved-guest/overview",
  });
  const navigate = useNavigate({
    from: "/visitor-management/reserved-guest/overview",
  });
  const [data, setData] = useState<VisitorData[]>([]);
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(10);

  const [isOpen, setIsOpen] = useState(false);

  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.limit || "10");

  //visitor data
  const [visitorID, setVisitorID] = useState("");
  const { data: visitor, isLoading: isVisitorLoading } =
    useGetVisitorById(visitorID);

  //visitorList
  const {
    data: visitorList,
    isLoading: isVisitorListLoading,
    refetch,
  } = useGetVisitors(objToParams(search) as any);

  const { data: visitorStatistics, isLoading: isVisitorStatisticsLoading } =
    useGetVisitorsStatistics();

  const { data: visitorTypes, isLoading: isVisitorTypesLoading } =
    useGetVisitorTypes();

  useEffect(() => {
    if (Array.isArray(visitorList?.data) || Array.isArray(visitorList)) {
      setData(visitorList?.data);
      if (visitorList?.pagination) {
        setTotalPages(visitorList?.pagination?.totalPages ?? 10);
        setTotalItems(visitorList?.pagination?.totalItems ?? 10);
      }
    }
  }, [visitorList]);

  const filters: Filter[] = [
    {
      key: "GuestType",
      label: "Guest Type",
      options: isVisitorTypesLoading
        ? []
        : visitorTypes?.map((item: any) => ({
            label: item.Name,
            value: item.ID,
          })),
    },
  ];

  useEffect(() => {
    refetch();
  }, [search]);

  // Handlers for table interactions
  const handlePageChange = (page: number) => {
    const parsedPage = parseInt(String(page));
    if (!isNaN(parsedPage) && parsedPage > 0) {
      navigate({
        search: (prev) => ({
          ...prev,
          page: String(parsedPage),
        }),
        replace: true,
      });
    }
  };

  const handlePageSizeChange = (size: number) => {
    const parsedSize = parseInt(String(size));
    if (!isNaN(parsedSize) && parsedSize > 0) {
      navigate({
        search: (prev) => ({
          ...prev,
          limit: String(parsedSize),
          page: "1",
        }),
        replace: true,
      });
    }
  };

  const handleSearch = (searchTerm: string) => {
    console.log("handleSearch", searchTerm);
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchTerm,
      }),
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: value || undefined,
        page: "1",
      }),
      replace: true,
    });
  };

  return (
    <>
      <div className="space-y-8">
        <CardSection headerLeft={<CardHeaderLeft />}>
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <AttendanceCountCard
              count={
                isVisitorStatisticsLoading
                  ? 0
                  : parseInt(countShortener(visitorStatistics?.Registered ?? 0))
              }
              icon={<InPremisesIcon />}
              subtitle="Registered Guest"
            />
            <AttendanceCountCard
              count={
                isVisitorStatisticsLoading
                  ? 0
                  : parseInt(countShortener(visitorStatistics?.Active ?? 0))
              }
              icon={<ClockedInIcon />}
              subtitle="Active Guest"
              variant="success"
            />
            <AttendanceCountCard
              count={
                isVisitorStatisticsLoading
                  ? 0
                  : parseInt(countShortener(visitorStatistics?.Inactive ?? 0))
              }
              icon={<ClockedOutIcon />}
              subtitle="Inactive Guest"
              variant="error"
            />
          </div>
        </CardSection>
        <CardSection
          headerLeft={
            <CardHeaderLeft
              title={
                <div className="flex items-center space-x-2 text-primary">
                  <Star />
                  <b className="text-[20px] text-primary">Reserved Guest</b>
                </div>
              }
              subtitle=""
            />
          }
        >
          <DynamicTable
            columns={columns}
            data={data}
            filters={filters}
            pagination={{
              currentPage,
              pageSize,
              totalPages,
              totalItems,
            }}
            routeSearch={search}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onFilter={handleFilter}
            isLoading={isVisitorListLoading}
            tableId={tableId}
            onRowClick={(row) => {
              setVisitorID(row.ID);
              setIsOpen(true);
            }}
          />
        </CardSection>
      </div>
      {isOpen && (
        <ReservedGuestInfoDialog
          visitor={visitor}
          isLoading={isVisitorLoading}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </>
  );
}
