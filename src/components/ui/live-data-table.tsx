import { DynamicTable } from "./dynamic-table";
import type { Column, Filter } from "./dynamic-table";
import { useNavigate } from "@tanstack/react-router";

interface LiveDataTableProps {
  columns: Column[];
  data: any[];
  filters?: Filter[];
  onFilter?: (key: string, value: string) => void;
  className?: string;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  routeSearch?: Record<string, string | undefined>;
  searchKey?: string;
  isLoading?: boolean;
  onSearch?: (searchTerm: string) => void;
  tableId?: string;
  onRowClick?: (row: any) => void;
  clearSocketData: () => void; // Function to clear the socket data
}

export function LiveDataTable({
  pageSize = 10,
  data,
  onPageSizeChange,
  routeSearch,
  onRowClick,
  clearSocketData,
  ...props
}: LiveDataTableProps) {
  const navigate = useNavigate();

  // Internal function to handle clearing table data
  const handleClearTable = () => {
    clearSocketData();
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // Update URL params
    if (routeSearch) {
      navigate({
        // @ts-ignore
        search: (prev) => ({
          ...prev,
          pageSize: String(newPageSize),
        }),
        replace: true,
      });
    }
    // Call the provided callback
    onPageSizeChange?.(newPageSize);
  };

  // Slice the data based on page size
  const slicedData = data.slice(0, pageSize);

  const paginationConfig = {
    pageSize: Number(routeSearch?.pageSize || pageSize),
    currentPage: 1,
    totalItems: data.length,
    totalPages: 1,
  };

  return (
    <DynamicTable
      {...props}
      onRowClick={onRowClick}
      onClearTable={handleClearTable}
      data={slicedData}
      isLiveData={true}
      pagination={paginationConfig}
      onPageSizeChange={handlePageSizeChange}
    />
  );
}
