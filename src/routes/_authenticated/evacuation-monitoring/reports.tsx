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
import { useGetDepartmentList } from "@/hooks/query/useGetDepartmentList";
import { useGetDeviceList } from "@/hooks/query/useGetDeviceList";
import { useGetDivisionList } from "@/hooks/query/useGetDivisionList";
import { useGetSectionList } from "@/hooks/query/useGetSectionList";
import { usePaginatedTableSocket } from "@/hooks/socket/usePaginatedTableSocket";
import SocketDynamicTable from "@/components/ui/socket-dynamic-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSocketEmit } from "@/hooks/socket/useSocketEmit";
import { getApiSocketBaseUrl } from "@/utils/env";

/** Plain string from API (PascalCase or lowercase). */
function pickOrgString(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value).trim();
  return s === "" ? "" : s;
}

/** Stable display keys Division / Department / Section; missing → "--". */
function addOrgDisplayFields<T extends Record<string, unknown>>(row: T) {
  const division =
    pickOrgString(row.Division) || pickOrgString(row.division);
  const department =
    pickOrgString(row.Department) || pickOrgString(row.department);
  const section = pickOrgString(row.Section) || pickOrgString(row.section);
  const display = (v: string) => (v === "" ? "--" : v);
  return {
    ...row,
    Division: display(division),
    Department: display(department),
    Section: display(section),
  };
}

function normalizeExportStatus(row: Record<string, unknown>): string {
  const s = row.Status;
  if (typeof s === "string") return s;
  return String(row.eva_status ?? "");
}

/** Unlisted from API (boolean or string); display Yes / No / -- */
function formatUnlistedDisplay(row: Record<string, unknown>): string {
  const raw =
    row.unlisted !== undefined && row.unlisted !== null
      ? row.unlisted
      : row.Unlisted;
  if (raw === undefined || raw === null || raw === "") return "--";
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  const s = String(raw).toLowerCase();
  if (s === "true" || s === "1" || s === "yes") return "Yes";
  if (s === "false" || s === "0" || s === "no") return "No";
  return "--";
}

/** Org filter from URL: prefer PascalCase contract, fall back to legacy lowercase. */
function orgFromSearch(p: Record<string, string | undefined>) {
  return {
    Division: p.Division || p.division,
    Department: p.Department || p.department,
    Section: p.Section || p.section,
  };
}

/** Unlisted filter for socket/API: "true" | "false" from Yes/No UI. */
function unlistedPayloadValue(
  raw: string | undefined
): boolean | undefined {
  if (raw === undefined || raw === "") return undefined;
  if (raw === "true" || raw === "Yes") return true;
  if (raw === "false" || raw === "No") return false;
  return undefined;
}

/** Plain row for CSV export (no React nodes); matches table column keys. */
function toEvsExportRow(
  row: Record<string, unknown>,
  includeCompleted: boolean
): Record<string, string | null> {
  const withOrg = addOrgDisplayFields(row);
  const evacuationTimeRaw = row.EvacuationTime;
  let evacuationTimeStr = "";
  if (evacuationTimeRaw) {
    if (
      typeof evacuationTimeRaw === "string" &&
      !/^\d{4}-\d{2}-\d{2}T/.test(evacuationTimeRaw)
    ) {
      evacuationTimeStr = evacuationTimeRaw;
    } else {
      evacuationTimeStr = dayjs(evacuationTimeRaw as string).format(
        "MMM D, YYYY hh:mm a"
      );
    }
  }
  const base: Record<string, string | null> = {
    ID: String(withOrg.ID ?? ""),
    EmployeeNo: String(withOrg.EmployeeNo ?? ""),
    Name: String(withOrg.Name ?? ""),
    Division: withOrg.Division as string,
    Department: withOrg.Department as string,
    Section: withOrg.Section as string,
    Type: String(withOrg.Type ?? ""),
    Status: normalizeExportStatus(row),
    Remarks: String(withOrg.Remarks ?? ""),
    EvacuationTime: evacuationTimeStr || null,
    device_name: String(
      (row.device_name as string) ?? (row.DeviceName as string) ?? ""
    ),
    Unlisted: formatUnlistedDisplay(row),
  };
  if (includeCompleted) {
    const completedRaw = row.Completed;
    let completedStr = "";
    if (completedRaw) {
      if (
        typeof completedRaw === "string" &&
        !/^\d{4}-\d{2}-\d{2}T/.test(completedRaw)
      ) {
        completedStr = completedRaw;
      } else {
        completedStr = dayjs(completedRaw as string).format(
          "MMM D, YYYY hh:mm a"
        );
      }
    }
    base.Completed = completedStr || null;
    base.Trigger_by = String(row.Trigger_by ?? "");
  }
  return base;
}

export interface EmployeeReport {
  EmployeeNo: string;
  Name: string;
  Department: string;
  Division?: string;
  Section?: string;
  division?: string;
  department?: string;
  section?: string;
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
      const data = reportList?.data.map((item: any) =>
        addOrgDisplayFields({
          ...item,
          Unlisted: formatUnlistedDisplay(item),
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
        })
      );
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
  const { data: divisionList } = useGetDivisionList();
  const { data: departmentList } = useGetDepartmentList();
  const { data: sectionList } = useGetSectionList();

  const { emitWithAck } = useSocketEmit();

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
    debounceMs: 100, // Reduced debounce for faster filter response
    normalizeParams: (p) => {
      if (!isCurrentTab) return {};
      // Normalize params so server receives consistent keys
      // Keep existing keys: page, limit, search, filters, date ranges
      const payload: Record<string, unknown> = {
        EvacuationStatus: p.EvacuationStatus || "current",
        page: p.page ? Number(p.page) : 1,
        limit: p.limit ? Number(p.limit) : 10,
        search: p.search || "",
      };
      // Only include filter values if they exist (not undefined/empty)
      if (p.Type) {
        payload.Type = p.Type;
      }
      if (p.Status) {
        payload.Status = p.Status;
      }
      if (p.DeviceName) {
        payload.DeviceName = p.DeviceName;
      }
      const org = orgFromSearch(p);
      if (org.Division) {
        payload.Division = org.Division;
      }
      if (org.Department) {
        payload.Department = org.Department;
      }
      if (org.Section) {
        payload.Section = org.Section;
      }
      const unlisted = unlistedPayloadValue(p.Unlisted);
      if (unlisted !== undefined) {
        payload.Unlisted = unlisted;
      }
      // Date+time range params (current tab), ISO-like strings
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

  const includeCompletedColumns = search.EvacuationStatus === "completed";

  // Define columns
  const columns = [
    { key: "ID", label: "ID" },
    { key: "EmployeeNo", label: "Employee No" },
    { key: "Name", label: "Name" },
    { key: "Division", label: "Division" },
    { key: "Department", label: "Department" },
    { key: "Section", label: "Section" },
    { key: "Unlisted", label: "Unlisted" },
    { key: "Type", label: "Type" },
    { key: "Status", label: "Status" },
    { key: "Remarks", label: "Remarks" },
    { key: "EvacuationTime", label: "Evacuation Date and Time" },
    { key: "device_name", label: "Device Name" },
    ...(includeCompletedColumns
      ? [
          { key: "Completed", label: "Evacuation Completed At" },
          { key: "Trigger_by", label: "EC Trigger By" },
        ]
      : []),
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
      key: "Division",
      label: "Division",
      options: divisionList ?? [],
    },
    {
      key: "Department",
      label: "Department",
      options: departmentList ?? [],
    },
    {
      key: "Section",
      label: "Section",
      options: sectionList ?? [],
    },
    {
      key: "Unlisted",
      label: "Unlisted",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
      singleSelect: true,
    },
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
            label: "Date & time range",
            isDateTimeRangePicker: true,
          },
        ]
      : []),
  ];

  const handleExport = (rows: unknown[]) => {
    const csv = unparse(
      rows.map((row) =>
        toEvsExportRow(row as Record<string, unknown>, includeCompletedColumns)
      ) as unknown[]
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build payload for export (similar to normalizeParams but without pagination)
  const buildExportPayload = (
    searchParams: Record<string, string | undefined>
  ) => {
    const payload: Record<string, unknown> = {
      search: searchParams.search || "",
    };
    // Only include filter values if they exist (not undefined/empty)
    if (searchParams.Type) {
      payload.Type = searchParams.Type;
    }
    if (searchParams.Status) {
      payload.Status = searchParams.Status;
    }
    if (searchParams.DeviceName) {
      payload.DeviceName = searchParams.DeviceName;
    }
    const orgExp = orgFromSearch(searchParams);
    if (orgExp.Division) {
      payload.Division = orgExp.Division;
    }
    if (orgExp.Department) {
      payload.Department = orgExp.Department;
    }
    if (orgExp.Section) {
      payload.Section = orgExp.Section;
    }
    const unlistedExp = unlistedPayloadValue(searchParams.Unlisted);
    if (unlistedExp !== undefined) {
      payload.Unlisted = unlistedExp;
    }
    // Date+time range params (current tab)
    if (
      searchParams.from_evs_reports_date ||
      searchParams.to_evs_reports_date
    ) {
      payload.from_evs_reports_date = searchParams.from_evs_reports_date;
      payload.to_evs_reports_date = searchParams.to_evs_reports_date;
    }
    return payload;
  };

  // Handle selection changes
  const handleRowSelectionChange = (_selected: unknown) => {
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
            ...addOrgDisplayFields(item),
            Unlisted: formatUnlistedDisplay(item),
            EvacuationTime: item.EvacuationTime
              ? dayjs(item.EvacuationTime).format("MMM D, YYYY hh:mm a")
              : null,
            Completed: item.Completed
              ? dayjs(item.Completed).format("MMM D, YYYY hh:mm a")
              : null,
            Status: (
              <Badge
                className={cn(
                  `rounded-full border `,
                  item.Status === "Missing" &&
                    "border-red-200 border  bg-red-50 text-red-500 hover:text-white hover:bg-red-500/80",
                  item.Status === "Safe" &&
                    "border-green-200 border  bg-green-50 text-green-500 hover:text-white hover:bg-green-500/80",
                  item.Status === "Injured" &&
                    "border-yellow-200 border  bg-yellow-50 text-yellow-500 hover:text-white hover:bg-yellow-500/80",
                  item.Status === "Home" &&
                    "border-blue-200 border  bg-blue-50 text-blue-500 hover:text-white hover:bg-blue-500/80"
                )}
                variant="default"
              >
                {item.Status || "Unknown"}
              </Badge>
            ),
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
                  const payload = buildExportPayload(
                    search as Record<string, string | undefined>
                  );
                  emitWithAck("evs_all", payload, (response) => {
                    if (response.ok && response.url) {
                      const baseUrl = getApiSocketBaseUrl();
                      const downloadUrl = `${baseUrl}${response.url}`;
                      window.open(downloadUrl, "_blank");
                    } else {
                      console.error(
                        "Export failed:",
                        response.error || "Unknown error"
                      );
                    }
                  });
                },
              },
              {
                label: "Export Page",
                onClick: () => {
                  handleExport(socketRows || []);
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
          data={
            data
              ? data.map((item: any) => ({
                  ...item,
                  Status: (
                    <Badge
                      className={cn(
                        `rounded-full border `,
                        item.Status === "Missing" &&
                          "border-red-200 border  bg-red-50 text-red-500 hover:text-white hover:bg-red-500/80",
                        item.Status === "Safe" &&
                          "border-green-200 border  bg-green-50 text-green-500 hover:text-white hover:bg-green-500/80",
                        item.Status === "Injured" &&
                          "border-yellow-200 border  bg-yellow-50 text-yellow-500 hover:text-white hover:bg-yellow-500/80",
                        item.Status === "Home" &&
                          "border-blue-200 border  bg-blue-50 text-blue-500 hover:text-white hover:bg-blue-500/80"
                      )}
                      variant="default"
                    >
                      {item.Status || "Unknown"}
                    </Badge>
                  ),
                }))
              : []
          }
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
