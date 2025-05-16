import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/dynamic-table";
import EmpInfoDialog from "@/components/ui/emp-info-dialog";
import { useGetEmployeeByNo } from "@/hooks/query/useGetEmployeeById";
import { useGetEmployees } from "@/hooks/query/useGetEmployees";
import { objToParams } from "@/utils/objToParams";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import dayjs from "dayjs";
import { IdCard } from "lucide-react";
import React, { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/employees"
)({
  component: RouteComponent,
});

const lastSyncDate = dayjs().format("MMMM D, YYYY");
const tableId = "employee-table";

export interface EmployeeData {
  APOAccount?: string;
  Birthdate?: string;
  CardNo1?: string;
  Cardno2?: string;
  CostCenterCode?: string;
  DateHired?: string;
  DepartmentName?: string;
  DivisionName?: string;
  UHF?: string;
  EmailAddress?: string;
  EmployeeID?: string;
  EmployeeNo?: string;
  EmploymentStatus?: string;
  FirstName?: string;
  Gender?: string;
  Grade?: string;
  LastName?: string;
  MiddleName?: string;
  Position?: string;
  SectionName?: string;
  FullName?: string;
  AC?: React.ReactNode;
}

// Column definitions
const columns: Column[] = [
  { key: "AC", label: "AC" },
  { key: "EmployeeID", label: "ID" },
  { key: "FullName", label: "Name" },
  { key: "DepartmentName", label: "Department" },
  { key: "sampleData", label: "Status" },
];

function RouteComponent() {
  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/employees",
  });
  const navigate = useNavigate({
    from: "/attendance-monitoring/employees",
  });
  const [data, setData] = useState<EmployeeData[]>([]);
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(10);

  const [isOpen, setIsOpen] = useState(false);

  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.limit || "10");

  //employee data
  const [employeeNo, setEmployeeNo] = useState("");
  const { data: employee, isLoading: isEmployeeLoading } =
    useGetEmployeeByNo(employeeNo);

  //employeeList
  const {
    data: employeeList,
    isLoading: isEmployeeListLoading,
    refetch,
  } = useGetEmployees(objToParams(search) as any);

  useEffect(() => {
    if (Array.isArray(employeeList?.data)) {
      const data = employeeList.data.map((item: EmployeeData) => ({
        ...item,
        FullName: `${item.FirstName} ${item.LastName}`,
        AC: item.UHF ? (
          <IdCard className="text-green-400" />
        ) : (
          <IdCard className="text-gray-400" />
        ),
      }));
      setData(data);
      setTotalPages(employeeList.pagination.totalPages ?? 10);
      setTotalItems(employeeList.pagination.totalItems ?? 10);
    }
  }, [employeeList]);

  const filters: Filter[] = [
    {
      key: "Department",
      label: "Department",
      options: [
        { label: "GAD", value: "GAD" },
        { label: "ACCOUNTING", value: "ACCOUNTING" },
      ],
      singleSelect: true,
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
      <CardSection
        headerLeft={
          <CardHeaderLeft
            title="Employees"
            subtitle={`Last Sync: ${lastSyncDate}`}
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
          isLoading={isEmployeeListLoading}
          tableId={tableId}
          onRowClick={(row) => {
            setEmployeeNo(row.EmployeeNo);
            setIsOpen(true);
          }}
        />
      </CardSection>
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
