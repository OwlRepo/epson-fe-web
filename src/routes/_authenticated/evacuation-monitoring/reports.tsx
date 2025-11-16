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
import dayjs from "dayjs";

import EVSCounts from "@/components/ui/evs-counts";
import type { SummaryCountData } from "@/hooks/useSocket";
import { useGetEVSReports } from "@/hooks/query/useGetEVSReport";
import { useGetTypeList } from "@/hooks/query/useGetTypeList";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import reportExportAll from "@/utils/reportExportAll";
import { useGetCompletedList } from "@/hooks/query/useGetCompletedList";
import { useGetDeviceList } from "@/hooks/query/useGetDeviceList";
import { usePaginatedTableSocket } from "@/hooks/socket/usePaginatedTableSocket";
import SocketDynamicTable from "@/components/ui/socket-dynamic-table";

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
  "/_authenticated/evacuation-monitoring/reports"
)({
  component: RouteComponent,
});

// Component setup
function ReportsDataTable() {
  const navigate = useNavigate({
    from: "/evacuation-monitoring/reports",
  });

  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/reports",
  });

  const [data, setData] = useState<EmployeeReport[]>([]);
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(10);
  const [totalLogs, setTotalLogs] = useState<Partial<SummaryCountData>>({});

  const {
    data: reportList,
    isFetching: isLoading,
    refetch,
  } = useGetEVSReports(objToParams(search) as any);

  useEffect(() => {
    if (Array.isArray(reportList?.data)) {
      const { Overall, Safe, Injured, GoHome, Missing } = reportList;
      const data = reportList?.data.map((item: any) => ({
        ...item,
        ClockedIN: item.ClockedIN
          ? dayjs(item.ClockedIN).format("hh:mm a")
          : null,
        ClockedOUT: item.ClockedOUT
          ? dayjs(item.ClockedOUT).format("hh:mm a")
          : null,
        EvacuationTime: item.EvacuationTime
          ? dayjs(item.EvacuationTime).format("MMM D, YYYY hh:mm a")
          : null,
        Completed: item.Completed
          ? dayjs(item.Completed).format("MMM D, YYYY hh:mm a")
          : null,
      }));
      setData(data);
      setTotalLogs({
        all: Overall,
        safe: Safe,
        injured: Injured,
        home: GoHome,
        missing: Missing,
      });
      setTotalPages(reportList?.pagination?.totalPages ?? 10);
      setTotalItems(reportList?.pagination?.totalItems ?? 10);
    }
  }, [reportList]);

  const { data: typeList } = useGetTypeList();
  const { data: completedList } = useGetCompletedList();
  const { data: deviceList } = useGetDeviceList();

  const activeFilter = search.EvacuationStatus || "current";
  const isCurrentTab = activeFilter === "current";

  // Socket data source for CURRENT tab ONLY
  const {
    data: socketRows,
    counts: socketCounts,
    meta: socketMeta,
    isLoading: isSocketLoading,
  } = usePaginatedTableSocket<any>({
    room: isCurrentTab ? "evs_reports" : "",
    routeSearch: isCurrentTab
      ? (search as Record<string, string | undefined>)
      : {},
    rowId: "EmployeeNo",
    emitEvent: "evs_reports",
    normalizeParams: (p) => {
      if (!isCurrentTab) return {};
      // Normalize params so server receives consistent keys
      // Keep existing keys: page, limit, search, filters, date ranges
      const payload: Record<string, unknown> = {
        EvacuationStatus: p.EvacuationStatus || "current",
        page: p.page ? Number(p.page) : 1,
        limit: p.limit ? Number(p.limit) : 10,
        search: p.search || "",
        Type: p.Type,
        Status: p.Status,
        DeviceName: p.DeviceName,
      };
      // Date range params (current tab)
      if (p.from_evs_reports_date || p.to_evs_reports_date) {
        payload.from_evs_reports_date = p.from_evs_reports_date;
        payload.to_evs_reports_date = p.to_evs_reports_date;
      }
      return payload;
    },
  });

  useEffect(() => {
    refetch();
  }, [search]);

  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.limit || "10");

  // Fix selection hooks - use useMemo to prevent re-renders
  const tableId = "report-table";

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
    { key: "ID", label: "ID" },
    { key: "EmployeeNo", label: "Employee No" },
    { key: "Name", label: "Name" },
    { key: "Type", label: "Type" },
    { key: "Status", label: "Status" },
    { key: "Remarks", label: "Remarks" },
    { key: "EvacuationTime", label: "Evacuation Date and Time" },
    { key: "DeviceName", label: "Device Name" },
    { key: "Completed", label: "Evacuation Completed At" },
    { key: "Trigger_by", label: "EC Trigger By" },
  ];

  // const mockedData = {
  //   Overall: 100,
  //   Safe: 80,
  //   Injured: 15,
  //   GoHome: 5,
  //   Missing: 0,
  //   data: [
  //     {
  //       EmployeeNo: "001",
  //       Name: "John Doe",
  //       Type: "Staff",
  //       Status: "Safe",
  //       EvacuationTime: "10:15:00 AM",
  //     },
  //     {
  //       EmployeeNo: "002",
  //       Name: "Jane Smith",
  //       Type: "Staff",
  //       Status: "Injured",
  //       EvacuationTime: "10:20:00 AM",
  //     },
  //     {
  //       EmployeeNo: "003",
  //       Name: "Alice Johnson",
  //       Type: "Visitor",
  //       Status: "Go Home",
  //       EvacuationTime: "10:25:00 AM",
  //     },
  //   ],
  //   pageSize: 10,
  //   totalItems: 3,
  //   totalPages: 1,
  // };

  const filters = [
    {
      key: "Type",
      label: "Type",
      options: typeList ?? [],
    },
    {
      key: "Status",
      label: "Status",
      options: ["Safe", "Injured", "Home", "Missing"].map((item) => ({
        label: item,
        value: item,
      })),
    },
    {
      key: "DeviceName",
      label: "Device Name",
      options: deviceList ?? [],
    },

    ...(search.EvacuationStatus === "completed"
      ? [
          {
            key: "completeEvacuationDate",
            label: "Completed Date",
            options: completedList ?? [],
          },
        ]
      : []),
    ...(search.EvacuationStatus === "current"
      ? [
          {
            key: "evs_reports_date",
            label: "Date",
            isDateRangePicker: true,
          },
        ]
      : []),
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

  const handleEvacuationStatusFilter = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        EvacuationStatus: value || undefined,
      }),
      replace: true,
    });
  };

  useEffect(() => {
    if (!search.EvacuationStatus) {
      handleEvacuationStatusFilter("current");
    }
  }, [search.EvacuationStatus]);

  return (
    <div>
      <div className="mt-2 mb-10 flex justify-between items-center">
        <ButtonGroup>
          <Button
            variant={activeFilter === "current" ? "default" : "outline"}
            className={
              activeFilter === "current"
                ? "bg-primary-evs text-white hover:bg-primary-evs"
                : "bg-white hover:bg-primary-evs hover:text-white"
            }
            onClick={() => handleEvacuationStatusFilter("current")}
          >
            Current
          </Button>
          <Button
            variant={activeFilter === "completed" ? "default" : "outline"}
            className={
              activeFilter === "completed"
                ? "bg-primary-evs text-white hover:bg-primary-evs"
                : "bg-white hover:bg-primary-evs hover:text-white"
            }
            onClick={() => handleEvacuationStatusFilter("completed")}
          >
            Completed
          </Button>
        </ButtonGroup>
        <EVSCounts
          countData={
            activeFilter === "current" ? socketCounts || {} : totalLogs
          }
          type="compact"
        />
      </div>
      {activeFilter === "current" ? (
        <SocketDynamicTable
          columns={columns}
          data={(socketRows || []).map((item: any) => ({
            ...item,
            ClockedIN: item.ClockedIN
              ? dayjs(item.ClockedIN).format("hh:mm a")
              : null,
            ClockedOUT: item.ClockedOUT
              ? dayjs(item.ClockedOUT).format("hh:mm a")
              : null,
            EvacuationTime: item.EvacuationTime
              ? dayjs(item.EvacuationTime).format("MMM D, YYYY hh:mm a")
              : null,
            Completed: item.Completed
              ? dayjs(item.Completed).format("MMM D, YYYY hh:mm a")
              : null,
          }))}
          isLoading={isSocketLoading}
          onRowClick={handleRowClick}
          onSearch={handleSearch}
          routeSearch={search}
          exportTableData={{
            type: "EVS",
            exportOptions: [
              {
                label: "Export All",
                onClick: () => {
                  reportExportAll({
                    search,
                    module: "evs",
                  });
                },
              },
              {
                label: "Export Page",
                onClick: () => {
                  handleExport(socketRows);
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
          enableRowSelection={true}
          tableId={tableId}
          rowIdField="EmployeeNo"
          onRowSelectionChange={handleRowSelectionChange}
          filters={filters}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onFilter={handleFilter}
          pagination={{
            currentPage,
            pageSize,
            totalPages: socketMeta?.totalPages ?? totalPages,
            totalItems: socketMeta?.totalItems ?? totalItems,
          }}
        />
      ) : (
        <DynamicTable
          columns={columns}
          data={data ? data : []}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          onSearch={handleSearch}
          routeSearch={search}
          exportTableData={{
            type: "EVS",
            exportOptions: [
              {
                label: "Export All",
                onClick: () => {
                  reportExportAll({
                    search,
                    module: "evs",
                  });
                },
              },
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
      )}
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
