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

import { objToParams } from "@/utils/objToParams";
import { unparse } from "papaparse";
import { useGetVisitorReports } from "@/hooks/query/useGetVisitorReports";

export interface VisitorReport {
  VisitorID: string;
  Name: string;
  Purpose: string;
  CheckedIn: string | null;
  CheckedOut: string | null;
}

export const Route = createFileRoute(
  "/_authenticated/visitor-management/reports"
)({
  component: RouteComponent,
});

// Component setup
function ReportsDataTable() {
  const navigate = useNavigate({
    from: "/visitor-management/reports",
  });

  const search = useSearch({
    from: "/_authenticated/visitor-management/reports",
  });

  const [data, setData] = useState<VisitorReport[]>([]);
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(10);

  const {
    data: reportList,
    isLoading,
    refetch,
  } = useGetVisitorReports(objToParams(search) as any);

  useEffect(() => {
    if (Array.isArray(reportList?.data)) {
      const data = reportList?.data.map((item: VisitorReport) => ({
        ...item,
        CheckedIn: item.CheckedIn,
        CheckedOut: item.CheckedOut,
      }));
      setData(data);
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
  const tableId = "visitor-report-table";

  const selectedRows = useMemo(
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
    { key: "VisitorID", label: "ID" },
    { key: "Name", label: "Name" },
    { key: "CheckedIn", label: "Checked In" },
    { key: "CheckedOut", label: "Checked Out" },
  ];

  const filters = [
    // {
    //   key: "VisitorID",
    //   label: "ID",
    //   options: Array.from(
    //     new Set(reportList?.data.map((item: VisitorReport) => item.VisitorID))
    //   ).map((item) => ({
    //     label: item,
    //     value: item,
    //   })),
    // },
    // {
    //   key: "Name",
    //   label: "Name",
    //   options: Array.from(
    //     new Set(reportList?.data.map((item: VisitorReport) => item.Name))
    //   ).map((item) => ({
    //     label: item,
    //     value: item,
    //   })),
    // },
    {
      key: "vms_reports_date",
      label: "Date",
      isDateRangePicker: true,
    },
  ];

  const handleExport = (exportData: any) => {
    const csv = unparse(exportData);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        page: "1",
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
                handleExport(data);
              },
            },
            {
              label: "Export Selected Data",
              onClick: () => {
                handleExport(Object.values(selectedRows));
              },
              disabled: Object.values(selectedRows).length === 0,
            },
          ],
        }}
        // Multi-select configuration
        enableRowSelection={true}
        tableId={tableId}
        rowIdField="VisitorID"
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
