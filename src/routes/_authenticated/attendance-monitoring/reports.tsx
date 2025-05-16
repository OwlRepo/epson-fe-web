import CardSection from "@/components/layouts/CardSection";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
// Import necessary components and hooks
import { useEffect, useMemo, useState } from "react";
import { DynamicTable } from "@/components/ui/dynamic-table";
import useTableSelectionStore from "@/store/tableSelectionStore";

import { useGetEmployeeReports } from "@/hooks/query/useGetAttendaceReports";
import { objToParams } from "@/utils/objToParams";

export interface EmployeeReport {
  EmployeeNo: string;
  Name: string;
  Department: string;
  LogDate: string | null;
  ClockedIN: string | null;
  ClockedOUT: string | null;
  FullName: string;
}

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/reports"
)({
  component: RouteComponent,
});

// Component setup
function ReportsDataTable() {
  const navigate = useNavigate({
    from: "/attendance-monitoring/reports",
  });

  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/reports",
  });

  const [data, setData] = useState<EmployeeReport[]>([]);
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(10);

  const {
    data: reportList,
    isLoading,
    refetch,
  } = useGetEmployeeReports(objToParams(search) as any);

  useEffect(() => {
    if (reportList) {
      setData(reportList.data);
      setTotalPages(reportList?.pagination?.totalPages ?? 10);
      setTotalItems(reportList?.pagination?.totalItems ?? 10);
    }
  }, [reportList]);

  useEffect(() => {
    refetch();
  }, [search]);

  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.limit || "10");

  // Fix selection hooks - use useMemo to prevent re-renders
  const tableId = "report-table";

  useMemo(
    () => useTableSelectionStore.getState().getSelectedRows(tableId),
    [useTableSelectionStore((state) => state.selectedRows[tableId])]
  );

  // Add a subscriber to force re-renders when selection changes
  useEffect(() => {
    return useTableSelectionStore.subscribe(
      (state) => state.selectedRows[tableId]
    );
  }, [tableId]);

  // Define columns
  const columns = [
    { key: "EmployeeNo", label: "ID" },
    { key: "Name", label: "Name" },
    { key: "Department", label: "Department" },
    { key: "ClockedIn", label: "Clocked In" },
    { key: "ClockedOut", label: "Clocked Out" },
  ];

  const filters = [
    {
      key: "Department",
      label: "Department",
      options: [
        { label: "GAD", value: "GAD" },
        { label: "HR", value: "HR" },
        { label: "Engineering", value: "Engineering" },
        { label: "Sales", value: "Sales" },
      ],
    },
  ];

  // Handle selection changes
  const handleRowSelectionChange = (selected: any) => {
    console.log("Selected rows:", Object.values(selected));
    // Perform actions with selected rows
  };

  // Handle row click if needed
  const handleRowClick = (row: any) => {
    console.log("Clicked row:", row);
  };

  // Handlers for table interactions
  const handlePageChange = (page: number) => {
    console.log("handlePageChange", page);
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
    console.log("handlePageSizeChange", size);
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

  return (
    <div>
      {/* Render the table with multi-select enabled */}
      <DynamicTable
        columns={columns}
        data={data ? data : []}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        onSearch={handleSearch}
        routeSearch={search}
        exportTableData={{
          exportOptions: [
            {
              label: "Export Page",
              onClick: () => {
                console.log("Export Page clicked");
              },
            },
            {
              label: "Export Selected Data",
              onClick: () => {
                console.log("Export Selected Data clicked");
              },
            },
          ],
        }}
        // Multi-select configuration
        enableRowSelection={true}
        tableId={tableId}
        rowIdField="EmployeeNo"
        onRowSelectionChange={handleRowSelectionChange}
        filters={filters}
        // Other optional props
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onFilter={handleFilter}
        pagination={{
          currentPage,
          pageSize,
          totalPages,
          totalItems,
        }}
      />
    </div>
  );
}

function RouteComponent() {
  return (
    <CardSection>
      <ReportsDataTable />
    </CardSection>
  );
}
