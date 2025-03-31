import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "./table";
import { useNavigate } from "@tanstack/react-router";
import Spinner from "./spinner";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "./input";
/**
/**
 * DynamicTable Component Guide:
 * 
 * - columns: An array of objects defining the table columns. Each object should have a 'key' and 'label'.
 * - data: An array of data objects to be displayed in the table. Each object should match the column keys.
 * - filters: Optional. An array of filter objects to filter table data. Each filter has a 'key', 'label', and 'options'.
 * - onFilter: Optional. A function to handle filter changes. Receives the filter key and value as arguments.
 * - className: Optional. A string of additional CSS classes to apply to the table.
 * - pagination: Optional. An object defining pagination settings, including currentPage, totalPages, pageSize, and totalItems.
 * - onPageChange: Optional. A function to handle page changes. Receives the new page number as an argument.
 * - onPageSizeChange: Optional. A function to handle changes in the number of items per page. Receives the new page size as an argument.
 * - routeSearch: A record of search parameters for routing purposes.
 * - searchKey: Optional. A string to namespace search parameters for the specific table.
 * - isLoading: Optional. A boolean to indicate if the table data is loading.
 * - onSearch: Optional. A function to handle search input changes. Receives the search term as an argument.
 */
export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface Filter {
  key: string;
  label: string;
  options?: { label: string; value: string }[];
  singleSelect?: boolean; // If true, only one option can be selected at a time
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// Generic type for route-specific search params
export interface BaseSearchParams {
  page?: string;
  pageSize?: string;
  [key: string]: string | undefined;
}

interface DynamicTableProps {
  columns: Column[];
  data: any[];
  filters?: Filter[];
  onFilter?: (key: string, value: string) => void;
  className?: string;
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  routeSearch: Record<string, string | undefined>;
  searchKey?: string; // Optional key to namespace search params for the specific table
  isLoading?: boolean; // Optional loading state
  onSearch?: (searchTerm: string) => void; // Optional search handler
}

export function DynamicTable({
  columns,
  data,
  filters = [],
  onFilter,
  className,
  pagination,
  onPageChange,
  onPageSizeChange,
  routeSearch,
  searchKey = "",
  isLoading = false,
  onSearch,
}: DynamicTableProps) {
  const navigate = useNavigate();
  const [filterSearches, setFilterSearches] = React.useState<
    Record<string, string>
  >({});
  const [tempFilters, setTempFilters] = React.useState<
    Record<string, string[]>
  >({});
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Get initial search term from URL if it exists
  React.useEffect(() => {
    const urlSearchTerm = routeSearch[getSearchKey("search")];
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, []);

  // Helper to get search param key with optional namespace
  const getSearchKey = (key: string) =>
    searchKey ? `${searchKey}_${key}` : key;

  // Handle search input with debounce
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      updateUrlParams({ search: value || null });
      onSearch?.(value);
    }, 1000);
  };

  // Clear timeout on component unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Get active filters from URL
  const getActiveFilters = (filterKey: string) => {
    const value = routeSearch[getSearchKey(`filter_${filterKey}`)];
    return value ? value.split(",") : [];
  };

  // Initialize temp filters with URL values when popover opens
  const handlePopoverOpen = (filterKey: string) => {
    setTempFilters((prev) => ({
      ...prev,
      [filterKey]: getActiveFilters(filterKey),
    }));
  };

  // Handle temporary filter changes
  const handleTempFilter = (key: string, value: string, checked: boolean) => {
    const filter = filters.find((f) => f.key === key);
    setTempFilters((prev) => ({
      ...prev,
      [key]: checked
        ? filter?.singleSelect
          ? [value] // For single select, replace the entire array with just the new value
          : [...(prev[key] || []), value]
        : (prev[key] || []).filter((v) => v !== value),
    }));
  };

  // Apply temporary filters
  const handleApplyFilter = (key: string) => {
    const filter = filters.find((f) => f.key === key);
    const newValues = tempFilters[key] || [];
    // For single select, ensure we only have one value
    const finalValues = filter?.singleSelect
      ? newValues.slice(0, 1)
      : newValues;
    updateUrlParams({
      [`filter_${key}`]: finalValues.length > 0 ? finalValues.join(",") : null,
    });
    onFilter?.(key, finalValues.join(","));
  };

  // Reset temporary filters
  const handleResetFilter = (key: string) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: [],
    }));
    setFilterSearches((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  // Update URL params when state changes
  const updateUrlParams = React.useCallback(
    (updates: Record<string, string | number | null>) => {
      try {
        const currentParams = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, value]) => {
          const paramKey = getSearchKey(key);
          if (value === null || value === "") {
            currentParams.delete(paramKey);
          } else {
            currentParams.set(paramKey, String(value));
          }
        });
        navigate({
          search: true,
          replace: true,
        });
      } catch (error) {
        console.error("Error updating URL params:", error);
      }
    },
    [navigate, searchKey]
  );

  const handlePageChange = (newPage: number) => {
    if (newPage !== pagination?.currentPage) {
      onPageChange?.(newPage);
      updateUrlParams({ page: newPage });
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newSize = parseInt(e.target.value);
      if (isNaN(newSize) || newSize <= 0) return;

      onPageSizeChange?.(newSize);
      updateUrlParams({
        pageSize: newSize,
        page: 1,
      });

      setTimeout(() => e.target?.blur(), 0);
    } catch (error) {
      console.error("Error handling page size change:", error);
    }
  };

  const handlePageSizeButtonClick = (size: number) => {
    onPageSizeChange?.(size);
    updateUrlParams({
      pageSize: size,
      page: 1,
    });
  };

  const pageSizeOptions = [10, 20, 50, 100];

  // Get unique values for a column from the data
  const getUniqueColumnValues = (columnKey: string) => {
    const values = new Set<string>();
    data.forEach((row) => {
      if (row[columnKey] !== undefined && row[columnKey] !== null) {
        values.add(String(row[columnKey]));
      }
    });
    return Array.from(values).sort();
  };

  // Filter options based on search input
  const getFilteredOptions = (filter: Filter, searchTerm: string) => {
    const columnValues = getUniqueColumnValues(filter.key);
    const predefinedOptions =
      filter.options || columnValues.map((value) => ({ label: value, value }));
    return searchTerm
      ? predefinedOptions.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : predefinedOptions;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchInput}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <Popover
                key={filter.key}
                onOpenChange={(open) => open && handlePopoverOpen(filter.key)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1",
                      getActiveFilters(filter.key).length > 0 &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {filter.label}
                    {getActiveFilters(filter.key).length > 0 && (
                      <span className="ml-1 rounded-full bg-white text-primary px-1.5 text-xs">
                        {getActiveFilters(filter.key).length}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <div className="p-2 space-y-2">
                    <div className="flex items-center space-x-2 px-2 pb-2 border-b">
                      <Search className="w-4 h-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search options..."
                        value={filterSearches[filter.key] || ""}
                        onChange={(e) =>
                          setFilterSearches((prev) => ({
                            ...prev,
                            [filter.key]: e.target.value,
                          }))
                        }
                        className="h-8 w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto px-2">
                      {getFilteredOptions(
                        filter,
                        filterSearches[filter.key] || ""
                      ).map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`${filter.key}-${option.value}`}
                            checked={
                              tempFilters[filter.key]?.includes(option.value) ||
                              false
                            }
                            onCheckedChange={(checked) =>
                              handleTempFilter(
                                filter.key,
                                option.value,
                                !!checked
                              )
                            }
                          />
                          <label
                            htmlFor={`${filter.key}-${option.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 px-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetFilter(filter.key)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApplyFilter(filter.key)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded border">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size={40} />
          </div>
        ) : (
          <Table className={cn("w-full", className)}>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.key}`}>
                      {row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination && !isLoading && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Page size selector - both dropdown and buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select
                className="p-1 border rounded bg-white text-sm cursor-pointer"
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                aria-label="Select rows per page"
                data-testid="page-size-select"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Alternative page size buttons */}
            <div className="hidden sm:flex gap-1 ml-1">
              {pageSizeOptions.map((size) => (
                <button
                  key={`page-size-btn-${size}`}
                  type="button"
                  onClick={() => handlePageSizeButtonClick(size)}
                  className={`px-2 py-1 text-xs rounded ${
                    pagination.pageSize === size
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  aria-pressed={pagination.pageSize === size}
                >
                  {size}
                </button>
              ))}
            </div>

            <span className="text-sm text-gray-600 ml-2">
              {`${Math.min(
                (pagination.currentPage - 1) * pagination.pageSize + 1,
                pagination.totalItems
              )}-${Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems
              )} of ${pagination.totalItems}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              aria-label="Go to previous page"
              type="button"
            >
              Previous
            </button>

            {/* Page number buttons - show appropriate range of buttons */}
            {(() => {
              // Always show first page, last page, current page, and 1 page on each side of current page
              const currentPage = pagination.currentPage;
              const totalPages = pagination.totalPages;
              const pageNumbers = new Set<number>();

              // Always include page 1
              pageNumbers.add(1);

              // Add current page and one on each side
              for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
              ) {
                pageNumbers.add(i);
              }

              // Always include last page if we have more than 1 page
              if (totalPages > 1) {
                pageNumbers.add(totalPages);
              }

              // Convert to sorted array
              const sortedPageNumbers = Array.from(pageNumbers).sort(
                (a, b) => a - b
              );

              // Render buttons with ellipses
              return sortedPageNumbers.map((pageNum, index) => {
                const prevPage = sortedPageNumbers[index - 1];
                // Add ellipsis if there's a gap
                const showEllipsis = prevPage && pageNum - prevPage > 1;

                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsis && <span className="mx-1">...</span>}
                    <button
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input h-10 w-10",
                        pagination.currentPage === pageNum
                          ? "bg-accent text-accent-foreground"
                          : "bg-background hover:bg-accent hover:text-accent-foreground"
                      )}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={
                        pagination.currentPage === pageNum ? "page" : undefined
                      }
                      type="button"
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                );
              });
            })()}

            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Go to next page"
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
