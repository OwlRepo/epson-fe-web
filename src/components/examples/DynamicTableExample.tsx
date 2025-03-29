import { useEffect, useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/DynamicTable";

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
}

// Mock data for the example
const MOCK_USERS: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  role: i % 3 === 0 ? "Developer" : i % 3 === 1 ? "Designer" : "Manager",
  status: i % 2 === 0 ? "Active" : "Inactive",
}));

export function DynamicTableExample() {
  // Get route search params from TanStack Router
  const search = useSearch({ from: "/components" });
  const navigate = useNavigate({ from: "/components" });
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);

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

  // Column definitions
  const columns: Column[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ];

  // Filter definitions
  const filters: Filter[] = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "Developer", value: "Developer" },
        { label: "Designer", value: "Designer" },
        { label: "Manager", value: "Manager" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
      singleSelect: true,
    },
  ];

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

  // Filter data based on search params
  const filterData = (data: User[]) => {
    return data.filter((item) => {
      const matchesRole =
        !search.filter_role || item.role === search.filter_role;
      const matchesStatus =
        !search.filter_status || item.status === search.filter_status;
      const matchesSearch =
        !search.search ||
        item.name.toLowerCase().includes(search.search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.search.toLowerCase()) ||
        item.status.toLowerCase().includes(search.search.toLowerCase());

      return matchesRole && matchesStatus && matchesSearch;
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
      <h2 className="text-2xl font-semibold mb-4">Dynamic Table Component</h2>
      <p className="text-gray-600 mb-4">
        The DynamicTable component extends the basic table with filters and
        pagination capabilities. Current URL params:
        <code className="ml-2 p-1 bg-gray-200 rounded text-sm whitespace-normal break-all">
          {Object.entries(search)
            .filter(
              ([key]) =>
                key === "page" ||
                key === "pageSize" ||
                key.startsWith("filter_")
            )
            .map(([key, value]) => (value ? `${key}=${value}` : null))
            .filter(Boolean)
            .join("&") || "None"}
        </code>
      </p>

      <div className="p-4 bg-gray-50 rounded-lg">
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
          onSearch={handleSearch}
          routeSearch={search}
          isLoading={isLoading}
        />
      </div>

      {/* Pagination info display */}
      <div className="mt-4 flex justify-center">
        <span className="text-sm text-gray-600">
          Pagination state: Page {currentPage} of{" "}
          {Math.ceil(filteredData.length / pageSize)}, showing {pageSize} items
          per page ({filteredData.length} total items)
        </span>
      </div>

      <div className="mt-4 bg-gray-100 p-4 rounded-lg">
        <pre className="text-sm">
          {`// Complete DynamicTable Example with URL Sync
// Set up router hooks
const search = useSearch({ from: "/your-route" });
const navigate = useNavigate({ from: "/your-route" });

// Get pagination values directly from URL
const currentPage = parseInt(search.page || "1");
const pageSize = parseInt(search.pageSize || "10");

// Update URL with navigation
const handlePageChange = (page: number) => {
  navigate({
    search: (prev) => ({
      ...prev,
      page: String(page)
    }),
    replace: true
  });
};

const handlePageSizeChange = (size: number) => {
  navigate({
    search: (prev) => ({
      ...prev,
      pageSize: String(size),
      page: "1"
    }),
    replace: true
  });
};

// Filter & paginate data
const filteredData = filterData(data);
const paginatedData = filteredData.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

// Render the table
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
  onSearch={handleSearch}
  onFilter={handleFilter}
  routeSearch={search}
  isLoading={isLoading}
/>`}
        </pre>
      </div>
    </>
  );
}
