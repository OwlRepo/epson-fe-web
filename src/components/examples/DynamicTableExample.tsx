import { useEffect, useState, useMemo } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/dynamic-table";
import useTableSelectionStore from "@/store/tableSelectionStore";
import { Button } from "@/components/ui/button";

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

  // Fix selection hooks - use useMemo to prevent re-renders
  const tableId = "users-table";
  // const selectedRows = useMemo(
  //   () =>
  //     useTableSelectionStore.getState().getSelectedRows(tableId),
  //   [useTableSelectionStore.getState().selectedRows[tableId]]
  // );
  const selectedRows = useTableSelectionStore(state => state.getSelectedRows(tableId));
  const selectedCount = useMemo(
    () =>
      useTableSelectionStore.getState().getSelectedCount(tableId),
    [useTableSelectionStore.getState().selectedRows[tableId]]
  );

  // Add a subscriber to force re-renders when selection changes
  useEffect(() => {
    return useTableSelectionStore.subscribe(
      (state) => state.selectedRows[tableId],
    );
  }, [tableId]);

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

  // Handler for row selection changes
  const handleRowSelectionChange = (selected: Record<string, any>) => {
    console.log("Selected rows:", Object.values(selected));
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
        The DynamicTable component extends the basic table with filters,
        pagination, and multi-select capabilities. Current URL params:
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

      {/* Actions for selected rows example */}
      {selectedCount > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Selected Rows ({selectedCount})</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => alert(`Performing bulk action on ${selectedCount} rows`)}
                variant="default"
              >
                Bulk Action
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => useTableSelectionStore.getState().clearSelection(tableId)}
              >
                Clear Selection
              </Button>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Selected items:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.values(selectedRows).slice(0, 6).map((row: any) => (
                <div key={row.id} className="text-sm flex items-center gap-2 bg-white p-1.5 rounded border border-blue-100">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  {row.name} ({row.role})
                </div>
              ))}
              {selectedCount > 6 && (
                <div className="text-sm text-gray-500 flex items-center justify-center bg-white p-1.5 rounded border border-blue-100">
                  + {selectedCount - 6} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          // Multi-select props
          enableRowSelection={true}
          tableId="users-table"
          rowIdField="id"
          onRowSelectionChange={handleRowSelectionChange}
        />
      </div>

      {/* Pagination info display */}
      <div className="mt-4 flex justify-center">
        <span className="text-sm text-gray-600">
          Pagination state: Page {currentPage} of{" "}
          {Math.ceil(filteredData.length / pageSize)}, showing {pageSize} items
          per page ({filteredData.length} total items {selectedCount})
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="font-medium text-lg">Multi-selection Feature Usage</h3>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Complete Example with Multi-select</h4>
          <pre className="text-sm bg-white p-4 rounded border overflow-auto">
            {`// Import necessary components and hooks
import { useState, useEffect, useMemo } from "react";
import { DynamicTable } from "@/components/ui/dynamic-table";
import useTableSelectionStore from "@/store/tableSelectionStore";

// Component setup
function DataTable() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Define table ID
  const tableId = "my-table";
  
  // Access selected rows from the store
  const selectedRows = useMemo(
    () => useTableSelectionStore.getState().getSelectedRows(tableId),
    [useTableSelectionStore.getState().selectedRows[tableId]]
  );
  const selectedCount = useMemo(
    () => useTableSelectionStore.getState().getSelectedCount(tableId),
    [useTableSelectionStore.getState().selectedRows[tableId]]
  );

  // Subscribe to store changes to trigger re-renders
  useEffect(() => {
    return useTableSelectionStore.subscribe(
      (state) => state.selectedRows[tableId]
    );
  }, [tableId]);
  
  // Define columns
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    // ...more columns
  ];
  
  // Handle selection changes
  const handleRowSelectionChange = (selected) => {
    console.log("Selected rows:", Object.values(selected));
    // Perform actions with selected rows
  };
  
  // Handle row click if needed
  const handleRowClick = (row) => {
    console.log("Clicked row:", row);
  };
  
  // Example of using selected rows for bulk actions
  const handleBulkDelete = () => {
    const ids = Object.values(selectedRows).map(row => row.id);
    console.log("Deleting IDs:", ids);
    // API call to delete items
    // ...
    // Clear selection when done
    useTableSelectionStore.getState().clearSelection(tableId);
  };
  
  return (
    <div>
      {/* Show selection data */}
      {selectedCount > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <div className="flex justify-between items-center">
            <p>{selectedCount} items selected</p>
            <button onClick={handleBulkDelete}>Delete Selected</button>
          </div>
        </div>
      )}
      
      {/* Render the table with multi-select enabled */}
      <DynamicTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        
        // Multi-select configuration
        enableRowSelection={true}
        tableId={tableId}
        rowIdField="id"
        onRowSelectionChange={handleRowSelectionChange}
        
        // Other optional props
        pagination={{
          currentPage: 1,
          pageSize: 10,
          totalPages: 5,
          totalItems: 50
        }}
      />
    </div>
  );
}`}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-medium mb-2">1. Enable multi-select feature</h4>
            <pre className="text-sm bg-white p-2 rounded border">
              {`<DynamicTable
  // ...other props
  enableRowSelection={true}
  tableId="users-table"  // Unique ID for this table
  rowIdField="id"        // Property used as row identifier
/>`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-medium mb-2">2. Access selected rows anywhere</h4>
            <pre className="text-sm bg-white p-2 rounded border">
              {`// Import the store
import useTableSelectionStore from "@/store/tableSelectionStore";

// Get selected rows for a specific table
const selectedRows = useTableSelectionStore(
  state => state.getSelectedRows("users-table")
);

// Get count of selected rows
const selectedCount = useTableSelectionStore(
  state => state.getSelectedCount("users-table")
);`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-medium mb-2">3. Handle selection changes</h4>
            <pre className="text-sm bg-white p-2 rounded border">
              {`<DynamicTable
  // ...other props
  onRowSelectionChange={(selectedRows) => {
    // Do something with the selected rows
    console.log("Selected:", Object.values(selectedRows));
  }}
/>`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-medium mb-2">4. Manipulate selections</h4>
            <pre className="text-sm bg-white p-2 rounded border">
              {`// Clear all selections for a table
useTableSelectionStore.getState().clearSelection("users-table");

// Check if a row is selected
const isSelected = useTableSelectionStore.getState()
  .isSelected("users-table", "123");

// Select or deselect specific rows
useTableSelectionStore.getState()
  .selectRow("users-table", "123", rowData);
useTableSelectionStore.getState()
  .deselectRow("users-table", "123");`}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}
