import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/dynamic-table";
import EmpInfoDialog from "@/components/ui/emp-info-dialog";
import api from "@/config/axiosInstance";
import { useGetEmployeeByNo } from "@/hooks/query/useGetEmployeeById";
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
  EPC?: string;
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

// Mock data
export const mockEmployeeData: EmployeeData[] = [
  {
    APOAccount: "APO123",
    Birthdate: "1990-01-01",
    CardNo1: "12345",
    Cardno2: "67890",
    CostCenterCode: "CC001",
    DateHired: "2020-06-15",
    DepartmentName: "R&D",
    DivisionName: "Engineering",
    EPC: "",
    EmailAddress: "john.doe@example.com",
    EmployeeID: "EMP001",
    EmployeeNo: "1001",
    EmploymentStatus: "Active",
    FirstName: "John",
    Gender: "Male",
    Grade: "A",
    LastName: "Doe",
    MiddleName: "M",
    Position: "Software Engineer",
    SectionName: "Development",
    FullName: "John Doe",
    AC: <IdCard className="text-gray-400" />,
  },
  {
    APOAccount: "APO456",
    Birthdate: "1985-05-20",
    CardNo1: "54321",
    Cardno2: "09876",
    CostCenterCode: "CC002",
    DateHired: "2018-03-10",
    DepartmentName: "ACCOUNTING",
    DivisionName: "Finance",
    EPC: "",
    EmailAddress: "jane.smith@example.com",
    EmployeeID: "EMP002",
    EmployeeNo: "1002",
    EmploymentStatus: "Inactive",
    FirstName: "Jane",
    Gender: "Female",
    Grade: "B",
    LastName: "Smith",
    MiddleName: "A",
    Position: "Accountant",
    SectionName: "Audit",
    FullName: "Jane Smith",
    AC: <IdCard className="text-gray-400" />,
  },
];

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
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<EmployeeData[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  //employee data
  const [employeeNo, setEmployeeNo] = useState("");
  const { data: employee, isLoading: isEmployeeLoading } =
    useGetEmployeeByNo(employeeNo);

  // Get pagination values from URL params
  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.pageSize || "10");

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate an API call to fetch employee datas
        const res = await api.get("/api/employees");

        const employeeData = res.data.map((item: EmployeeData) => ({
          ...item,
          FullName: `${item.FirstName} ${item.LastName}`,
          AC: item.EPC ? (
            <IdCard className="text-green-400" />
          ) : (
            <IdCard className="text-gray-400" />
          ),
        }));

        setIsLoading(true);
        setData([...mockEmployeeData, ...employeeData]);
        setIsLoading(false);
      } catch {
        console.error("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, search.filter_role, search.filter_status]);

  const filters: Filter[] = [
    {
      key: "department",
      label: "Department",
      options: [
        { label: "R&D", value: "R&D" },
        { label: "ACCOUNTING", value: "ACCOUNTING" },
      ],
      singleSelect: true,
    },
  ];

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
          pageSize: String(parsedSize),
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
        [`filter_${key}`]: value || undefined,
        page: "1",
      }),
      replace: true,
    });
  };

  // Filter data based on search params
  const filterData = (data: EmployeeData[]) => {
    return data.filter((item) => {
      const matchesDepartment =
        !search.filter_department ||
        item.DepartmentName === search.filter_department;

      return matchesDepartment;
    });
  };

  // Apply filtering and pagination
  const filteredData = filterData(data);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
          data={paginatedData}
          filters={filters}
          pagination={{
            currentPage,
            pageSize,
            totalPages: Math.ceil(filteredData.length / pageSize),
            totalItems: filteredData.length,
          }}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onFilter={handleFilter}
          isLoading={isLoading}
          tableId={tableId}
          onRowClick={(row) => {
            setEmployeeNo(row.EmployeeNo);
            setIsOpen(true);
          }}
        />
      </CardSection>
      <EmpInfoDialog
        employee={employee}
        isLoading={isEmployeeLoading}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
