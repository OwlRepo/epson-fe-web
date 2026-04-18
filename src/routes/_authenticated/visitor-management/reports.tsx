import CardSection from "@/components/layouts/CardSection";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DynamicTable } from "@/components/ui/dynamic-table";
import useTableSelectionStore from "@/store/tableSelectionStore";

import { objToParams } from "@/utils/objToParams";
import { unparse } from "papaparse";
import { useGetVisitorReports } from "@/hooks/query/useGetVisitorReports";
import { useGetGuestTypeList } from "@/hooks/query/useGetGuestTypeList";
import reportExportAll from "@/utils/reportExportAll";
import { isAxiosError } from "axios";
import {
  getVmsCompany,
  getVmsHostPerson,
  getVmsVisitorType,
} from "@/utils/vmsLiveRow";

export interface VisitorReport {
  VisitorID: string;
  CardNo?: string;
  Name: string;
  Company?: string;
  HostPerson?: string;
  VisitorType?: string;
  Purpose?: string;
  CheckedIn: string | null;
  CheckedOut: string | null;
}

export const Route = createFileRoute(
  "/_authenticated/visitor-management/reports",
)({
  component: RouteComponent,
});

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

  const queryString = useMemo(() => objToParams(search), [search]);

  const {
    data: reportList,
    isLoading,
    isError,
    error,
  } = useGetVisitorReports(queryString);

  const { data: guestTypeList } = useGetGuestTypeList();

  useEffect(() => {
    if (isError) {
      setData([]);
      setTotalPages(1);
      setTotalItems(0);
      return;
    }
    if (Array.isArray(reportList?.data)) {
      const mapped = reportList.data.map((item: Record<string, unknown>) => ({
        ...item,
        VisitorID: String(item.VisitorID ?? ""),
        CardNo: item.CardNo != null ? String(item.CardNo) : undefined,
        Name: String(item.Name ?? ""),
        Company: getVmsCompany(item) || "--",
        HostPerson: getVmsHostPerson(item) || "--",
        VisitorType: getVmsVisitorType(item) || "--",
        CheckedIn: (item.CheckedIn as string | null) ?? null,
        CheckedOut: (item.CheckedOut as string | null) ?? null,
      })) as VisitorReport[];
      setData(mapped);
      setTotalPages(reportList?.pagination?.totalPages ?? 1);
      setTotalItems(reportList?.pagination?.totalItems ?? 0);
    }
  }, [reportList, isError]);

  const currentPage = parseInt(search.page || "1", 10);
  const pageSize = parseInt(search.limit || "10", 10);

  const tableId = "visitor-report-table";

  const selectedRows = useMemo(
    () => useTableSelectionStore.getState().getSelectedRows(tableId),
    [useTableSelectionStore((state) => state.selectedRows[tableId])],
  );

  useEffect(() => {
    return useTableSelectionStore.subscribe(
      (state) => state.selectedRows[tableId],
    );
  }, [tableId]);

  const columns = [
    { key: "VisitorID", label: "ID" },
    { key: "CardNo", label: "Card No." },
    { key: "Name", label: "Name" },
    { key: "Company", label: "Company" },
    { key: "HostPerson", label: "Host Person" },
    { key: "VisitorType", label: "Visitor Type" },
    { key: "CheckedIn", label: "Checked In" },
    { key: "CheckedOut", label: "Checked Out" },
  ];

  const filters = useMemo(() => {
    const rows = data as unknown as Record<string, unknown>[];
    const uniqStrings = (getVal: (r: Record<string, unknown>) => string) => {
      const s = new Set<string>();
      rows.forEach((r) => {
        const v = getVal(r)?.trim();
        if (v) s.add(v);
      });
      return Array.from(s)
        .sort()
        .map((v) => ({ label: v, value: v }));
    };

    let visitorTypeOptions = uniqStrings((r) => getVmsVisitorType(r));
    if (Array.isArray(guestTypeList) && guestTypeList.length > 0) {
      visitorTypeOptions = guestTypeList.map(
        (o: { label: string; value: string }) => ({
          label: o.label,
          value: o.label,
        }),
      );
    }

    return [
      {
        key: "Name",
        label: "Name",
        options: uniqStrings((r) => String(r.Name ?? "")),
      },
      {
        key: "Company",
        label: "Company",
        options: uniqStrings((r) =>
          getVmsCompany(r).trim() ? getVmsCompany(r) : "",
        ),
      },
      {
        key: "HostPerson",
        label: "Host Person",
        options: uniqStrings((r) =>
          getVmsHostPerson(r).trim() ? getVmsHostPerson(r) : "",
        ),
      },
      {
        key: "VisitorType",
        label: "Visitor Type",
        options: visitorTypeOptions,
      },
      {
        key: "vms_reports_date_time",
        label: "Date and time range",
        isDateTimeRangePicker: true,
      },
    ];
  }, [data, guestTypeList]);

  const handleExport = (exportData: unknown[]) => {
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

  const handleRowSelectionChange = (_selected: unknown) => {};

  const handleRowClick = (_row: unknown) => {};

  const handlePageChange = (page: number) => {
    const parsedPage = parseInt(String(page), 10);
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
    const parsedSize = parseInt(String(size), 10);
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
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchTerm,
        page: "1",
      }),
      replace: true,
    });
  };

  const errMessage = (() => {
    if (!isError || !error) return null;
    if (isAxiosError(error)) {
      const msg =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message;
      return msg || "Unable to load reports.";
    }
    if (error instanceof Error) return error.message;
    return "Unable to load reports.";
  })();

  return (
    <div className="space-y-2">
      {errMessage && (
        <p
          className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
          role="alert"
        >
          {errMessage} Showing an empty table until the API is available.
        </p>
      )}
      <DynamicTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        onSearch={handleSearch}
        routeSearch={search}
        exportTableData={{
          exportOptions: [
            {
              label: "Export All",
              onClick: () => {
                reportExportAll({
                  search,
                  module: "vms",
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
        enableRowSelection={true}
        tableId={tableId}
        rowIdField="VisitorID"
        onRowSelectionChange={handleRowSelectionChange}
        filters={filters}
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
