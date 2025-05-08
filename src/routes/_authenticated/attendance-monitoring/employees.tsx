import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/dynamic-table";
import EmpInfoDialog from "@/components/ui/emp-info-dialog";
import RFIDSerialReader from "@/components/ui/rfid-reader";
import SerialPortComponent from "@/components/ui/serial-port";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/employees"
)({
  component: RouteComponent,
});

const lastSyncDate = dayjs().format("MMMM D, YYYY");
const tableId = "employee-table";

interface EmployeeData {
  id: string | number;
  name: string;
  department: string;
  sampleData: string;
}

// Mock data for the example
const MOCK_USERS: EmployeeData[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  department: i % 3 === 0 ? "R&D" : i % 3 === 1 ? "ACCOUNTING" : "R&D",
  sampleData: i % 2 === 0 ? "Active" : "Inactive",
}));

// Column definitions
const columns: Column[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "department", label: "Department" },
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

  // Get pagination values from URL params
  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.pageSize || "10");

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(MOCK_USERS);
      setIsLoading(false);
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
        item.department === search.filter_department;

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
            setIsOpen(true);
          }}
        />
      </CardSection>
      <EmpInfoDialog
        employee={employeeData}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
      <SerialPortComponent />
    </>
  );
}

// Example employee data
const employeeData: Employee = {
  id: "000000481",
  name: "Sophia Carter",
  section: "Research & Development",
  avatarUrl: "https://via.placeholder.com/150/0077FF/FFFFFF?text=SC", // Example avatar URL
  skills: [
    "Machine Operation",
    "Welding & Fabrication",
    "Assembly Line Work",
    "CNC Machining",
    "Quality Control & Inspection",
    "Inventory Management",
  ],
  rfidCard: "",
  cardLinked: false,
};

interface Employee {
  id: string;
  name: string;
  section: string;
  avatarUrl?: string;
  skills: string[];
  rfidCard: string;
  cardLinked: boolean;
}
