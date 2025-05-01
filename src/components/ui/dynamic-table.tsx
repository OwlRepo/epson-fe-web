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
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { ChevronDown, Search, Filter, CalendarIcon, Clock } from "lucide-react";
import { Input } from "./input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { Calendar } from "./calendar";
import dayjs from "dayjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import useTableSelectionStore from "@/store/tableSelectionStore";

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
 * - enableRowSelection: Optional. A boolean to enable row selection feature with checkboxes.
 * - tableId: Optional. A unique ID for the table when multiple selection tables are used.
 * - rowIdField: Optional. The field to use as the row ID for selection. Default: 'id'.
 * - onRowSelectionChange: Optional. Callback when row selection changes.
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
  isDateTimePicker?: boolean; // If true, this filter will be a date-time picker
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
  routeSearch?: Record<string, string | undefined>;
  onRowClick?: (row: any) => void; // Optional row click handler
  isLiveData?: boolean; // Optional prop to indicate if the data is live
  searchKey?: string; // Optional key to namespace search params for the specific table
  isLoading?: boolean; // Optional loading state
  onSearch?: (searchTerm: string) => void; // Optional search handler
  // Multi-select features
  enableRowSelection?: boolean; // Enable row selection with checkboxes
  tableId?: string; // Unique ID for the table when multiple selection tables are used
  rowIdField?: string; // Field to use as row ID for selection
  onRowSelectionChange?: (selectedRows: Record<string, any>) => void; // Callback when selection changes
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
  isLiveData = false,
  onSearch,
  onRowClick,
  // Multi-select props
  enableRowSelection = false,
  tableId = "default",
  rowIdField = "id",
  onRowSelectionChange,
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

  // State for the time picker
  const [timeDialogOpen, setTimeDialogOpen] = React.useState<boolean>(false);
  const [currentFilterKey, setCurrentFilterKey] = React.useState<string>("");
  const [selectedTime, setSelectedTime] = React.useState<{
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }>({
    hour: 12,
    minute: 0,
    period: "AM",
  });

  // Get selection state from store
  const {
    isSelected,
    selectRow,
    deselectRow,
    clearSelection,
    selectAll,
    getSelectedRows,
    getSelectedCount
  } = useTableSelectionStore();

  // Get initial search term from URL if it exists
  React.useEffect(() => {
    const urlSearchTerm = routeSearch?.[getSearchKey("search")];
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, []);

  // Initialize filters from URL parameters when component mounts
  React.useEffect(() => {
    if (!routeSearch) return;

    // Initialize all filters from URL
    const tempFilterValues: Record<string, string[]> = {};

    filters.forEach((filter) => {
      // Check for both filter_key and the key name directly (in case of different formats)
      const filterKey = `filter_${filter.key}`;
      let filterValue = routeSearch[filterKey];

      // Also check for different case variants (filter_name, filter_Name)
      if (!filterValue) {
        const possibleKeys = Object.keys(routeSearch).filter(key =>
          key.toLowerCase() === filterKey.toLowerCase() ||
          key.toLowerCase() === filter.key.toLowerCase()
        );

        if (possibleKeys.length > 0) {
          filterValue = routeSearch[possibleKeys[0]];
        }
      }

      if (filterValue) {
        const values = filterValue.split(',');
        tempFilterValues[filter.key] = values;

        // If this is a dateTime filter, parse the time information
        if (filter.isDateTimePicker && values[0]?.includes('T')) {
          const timeStr = values[0].split('T')[1];
          if (timeStr) {
            const [hoursStr, minutesStr] = timeStr.split(':');
            const hours = parseInt(hoursStr);
            const minutes = parseInt(minutesStr);

            // Set time picker values
            setSelectedTime({
              hour: hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours),
              minute: minutes,
              period: hours >= 12 ? "PM" : "AM"
            });

            setCurrentFilterKey(filter.key);
          }
        }
      }
    });

    // Set temp filters
    if (Object.keys(tempFilterValues).length > 0) {
      setTempFilters(tempFilterValues);
    }
  }, []);

  // Callback when selection changes
  React.useEffect(() => {
    if (onRowSelectionChange && enableRowSelection) {
      const selectedRows = getSelectedRows(tableId);
      onRowSelectionChange(selectedRows);
    }
  }, [tableId, onRowSelectionChange, enableRowSelection]); // Fixed dependencies

  // Initialize temp filters with URL values when filter sheet opens
  const handleSheetOpenChange = (isOpen: boolean) => {
    if (isOpen && routeSearch) {
      const tempFilterValues: Record<string, string[]> = {};

      filters.forEach((filter) => {
        // Check for both filter_key and the key name directly (in case of different formats)
        const filterKey = `filter_${filter.key}`;
        let filterValue = routeSearch[filterKey];

        // Also check for different case variants (filter_name, filter_Name)
        if (!filterValue) {
          const possibleKeys = Object.keys(routeSearch).filter(key =>
            key.toLowerCase() === filterKey.toLowerCase() ||
            key.toLowerCase() === filter.key.toLowerCase()
          );

          if (possibleKeys.length > 0) {
            filterValue = routeSearch[possibleKeys[0]];
          }
        }

        if (filterValue) {
          const values = filterValue.split(',');
          tempFilterValues[filter.key] = values;

          // If this is a dateTime filter, parse the time information
          if (filter.isDateTimePicker && values[0]?.includes('T')) {
            const timeStr = values[0].split('T')[1];
            if (timeStr) {
              const [hoursStr, minutesStr] = timeStr.split(':');
              const hours = parseInt(hoursStr);
              const minutes = parseInt(minutesStr);

              // Set time picker values
              setSelectedTime({
                hour: hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours),
                minute: minutes,
                period: hours >= 12 ? "PM" : "AM"
              });

              setCurrentFilterKey(filter.key);
            }
          }
        }
      });

      // Set temp filters
      if (Object.keys(tempFilterValues).length > 0) {
        setTempFilters(tempFilterValues);
      }
    }
  };

  // Helper to get search param key with optional namespace
  const getSearchKey = (key: string) =>
    searchKey ? `${searchKey}_${key}` : key;

  // Handle row selection
  const handleRowSelectionChange = (row: any, checked: boolean) => {
    const rowId = String(row[rowIdField]);
    if (checked) {
      selectRow(tableId, rowId, row);
    } else {
      deselectRow(tableId, rowId);
    }
  };

  // Handle select all rows
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Convert data array to object with rowId as keys
      const rowsMap = data.reduce((acc, row) => {
        const rowId = String(row[rowIdField]);
        acc[rowId] = row;
        return acc;
      }, {} as Record<string, any>);

      selectAll(tableId, rowsMap);
    } else {
      clearSelection(tableId);
    }
  };

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
    const value = routeSearch?.[getSearchKey(`filter_${filterKey}`)];
    return value ? value.split(",") : [];
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

    // Reset time picker data if this is a datetime filter
    const filter = filters.find(f => f.key === key);
    if (filter?.isDateTimePicker) {
      setSelectedTime({
        hour: 12,
        minute: 0,
        period: "AM"
      });
    }
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
    // Don't show options for date picker filters
    if (filter.isDateTimePicker) {
      return [];
    }

    const columnValues = getUniqueColumnValues(filter.key);
    const predefinedOptions =
      filter.options || columnValues.map((value) => ({ label: value, value }));
    return searchTerm
      ? predefinedOptions.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : predefinedOptions;
  };

  // Check if all rows in the current page are selected
  const areAllRowsSelected = data.length > 0 &&
    data.every(row => isSelected(tableId, String(row[rowIdField])));

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between">
          {routeSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchInput}
                className="w-full pl-9 bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.12)] focus-visible:shadow-[0_0_0_1px_rgba(0,0,0,0.12)] border-0 rounded-md"
              />
            </div>
          )}
          {
            filters.length > 0 && <Sheet onOpenChange={handleSheetOpenChange}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {Object.keys(filters).reduce(
                    (count, key) =>
                      count + (getActiveFilters(key).length > 0 ? 1 : 0),
                    0
                  ) > 0 && (
                      <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 text-xs">
                        {Object.keys(filters).reduce(
                          (count, key) =>
                            count + (getActiveFilters(key).length > 0 ? 1 : 0),
                          0
                        )}
                      </span>
                    )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine results using the filters below.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                  {filters.map((filter) => (
                    <Collapsible
                      key={filter.key}
                      className="overflow-hidden rounded-lg border border-[#e5e7eb] data-[state=open]:border-0"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-accent data-[state=open]:bg-[#1e40af] data-[state=open]:text-white transition-colors duration-200 group">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{filter.label}</span>
                          {getActiveFilters(filter.key).length > 0 && (
                            <span
                              className={cn(
                                "rounded-full bg-primary text-primary-foreground px-1.5 text-xs data-[state=open]:bg-[#1e40af] data-[state=open]:text-white"
                              )}
                            >
                              {getActiveFilters(filter.key).length}
                            </span>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="p-4 pt-5 bg-white border-x border-b rounded-b-lg">
                          <div className="space-y-4">
                            {!filter.isDateTimePicker && (
                              <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="text"
                                  placeholder="Search..."
                                  value={filterSearches[filter.key] || ""}
                                  onChange={(e) =>
                                    setFilterSearches((prev) => ({
                                      ...prev,
                                      [filter.key]: e.target.value,
                                    }))
                                  }
                                  className="w-full pl-9 bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.08)] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.12)] focus-visible:shadow-[0_0_0_1px_rgba(0,0,0,0.12)] border-0 rounded-md"
                                />
                              </div>
                            )}
                            <div className="space-y-3 max-h-[200px] overflow-y-auto">
                              {filter.isDateTimePicker ? (
                                <div className="py-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {tempFilters[filter.key]?.[0]
                                          ? dayjs(tempFilters[filter.key][0].split('T')[0]).format("MMM D, YYYY")
                                          : "Pick a date"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-50">
                                      <div className="relative z-50 bg-background pointer-events-auto">
                                        <Calendar
                                          mode="single"
                                          selected={tempFilters[filter.key]?.[0] ? new Date(tempFilters[filter.key][0].split('T')[0]) : undefined}
                                          onSelect={(date) => {
                                            if (date) {
                                              // Prevent event propagation
                                              event?.stopPropagation();
                                              event?.preventDefault();

                                              // Format to YYYY-MM-DD with timezone handling
                                              const year = date.getFullYear();
                                              const month = String(date.getMonth() + 1).padStart(2, '0');
                                              const day = String(date.getDate()).padStart(2, '0');
                                              const dateStr = `${year}-${month}-${day}`;

                                              // Store the date in temp filters
                                              setTempFilters((prev) => ({
                                                ...prev,
                                                [filter.key]: [dateStr]
                                              }));

                                              // Close the popover and open time dialog
                                              const popoverCloseEvent = new Event('mousedown', {
                                                bubbles: true,
                                                cancelable: true
                                              });
                                              document.body.dispatchEvent(popoverCloseEvent);

                                              // Set current filter key and open time dialog after a short delay
                                              setCurrentFilterKey(filter.key);
                                              setTimeout(() => {
                                                setTimeDialogOpen(true);
                                              }, 300);
                                            } else {
                                              setTempFilters((prev) => ({
                                                ...prev,
                                                [filter.key]: []
                                              }));
                                            }
                                          }}
                                          initialFocus
                                          className="pointer-events-auto"
                                        />
                                      </div>
                                    </PopoverContent>
                                  </Popover>

                                  {/* Show selected time if available */}
                                  {tempFilters[filter.key]?.[0] && tempFilters[filter.key][0].includes('T') && (
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal mt-2"
                                      onClick={() => {
                                        setCurrentFilterKey(filter.key);
                                        setTimeDialogOpen(true);
                                      }}
                                    >
                                      <Clock className="mr-2 h-4 w-4" />
                                      {tempFilters[filter.key][0].split('T')[1]
                                        ? dayjs(`2000-01-01T${tempFilters[filter.key][0].split('T')[1]}`).format("hh:mm A")
                                        : "Select time"}
                                    </Button>
                                  )}
                                </div>
                              ) : (
                                getFilteredOptions(
                                  filter,
                                  filterSearches[filter.key] || ""
                                ).length > 0 ? (
                                  getFilteredOptions(
                                    filter,
                                    filterSearches[filter.key] || ""
                                  ).map((option) => (
                                    <div
                                      key={option.value}
                                      className="flex items-center space-x-3"
                                    >
                                      <Checkbox
                                        id={`${filter.key}-${option.value}`}
                                        checked={
                                          tempFilters[filter.key]?.includes(
                                            option.value
                                          ) || false
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
                                  ))
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                      No options found
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Try adjusting your search terms
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}

                  <div className="flex items-center justify-between pt-4 border-t mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        filters.forEach((filter) =>
                          handleResetFilter(filter.key)
                        );
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => {
                        filters.forEach((filter) =>
                          handleApplyFilter(filter.key)
                        );
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          }
        </div>

        {/* Selection count banner */}
        {enableRowSelection && getSelectedCount(tableId) > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-md p-2 px-4 flex justify-between items-center">
            <span className="text-sm font-medium">
              {getSelectedCount(tableId)} {getSelectedCount(tableId) === 1 ? 'item' : 'items'} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearSelection(tableId)}
            >
              Clear Selection
            </Button>
          </div>
        )}
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
                {enableRowSelection && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={areAllRowsSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? data.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  onClick={(e) => {
                    // Don't trigger row click when checkbox is clicked
                    if ((e.target as HTMLElement).closest('[data-checkbox]')) {
                      return;
                    }
                    onRowClick?.(row);
                  }}
                >
                  {enableRowSelection && (
                    <TableCell className="w-[50px]">
                      <div data-checkbox>
                        <Checkbox
                          checked={isSelected(tableId, String(row[rowIdField]))}
                          onCheckedChange={(checked) => handleRowSelectionChange(row, !!checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.key}`}>
                      {row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={enableRowSelection ? columns.length + 1 : columns.length} className="text-center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
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
                  className={`px-2 py-1 text-xs rounded ${pagination.pageSize === size
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  aria-pressed={pagination.pageSize === size}
                >
                  {size}
                </button>
              ))}
            </div>

            {!isLiveData && (
              <span className="text-sm text-gray-600 ml-2">
                {`${Math.min(
                  (pagination.currentPage - 1) * pagination.pageSize + 1,
                  pagination.totalItems
                )}-${Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalItems
                )} of ${pagination.totalItems}`}
              </span>
            )}
          </div>

          {/* Pagination navigation - only show when not live data */}
          {!isLiveData && <div className="flex items-center gap-2">
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
          </div>}
        </div>
      )}

      {/* Time picker dialog */}
      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent className="w-72 rounded-lg p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock /> Set Time
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center gap-4 shadow-md p-4 px-8 rounded-md">
            <div className="text-center">
              <button
                onClick={() => setSelectedTime(prev => ({
                  ...prev,
                  hour: prev.hour === 12 ? 1 : prev.hour + 1
                }))}
                className="text-lg font-semibold"
              >
                <ChevronDown className="rotate-180" />
              </button>
              <div>{selectedTime.hour.toString().padStart(2, "0")}</div>
              <button
                onClick={() => setSelectedTime(prev => ({
                  ...prev,
                  hour: prev.hour === 1 ? 12 : prev.hour - 1
                }))}
                className="text-lg font-semibold"
              >
                <ChevronDown />
              </button>
            </div>
            <div>:</div>
            <div className="text-center">
              <button
                onClick={() => setSelectedTime(prev => ({
                  ...prev,
                  minute: prev.minute === 59 ? 0 : prev.minute + 1
                }))}
                className="text-lg font-semibold"
              >
                <ChevronDown className="rotate-180" />
              </button>
              <div>{selectedTime.minute.toString().padStart(2, "0")}</div>
              <button
                onClick={() => setSelectedTime(prev => ({
                  ...prev,
                  minute: prev.minute === 0 ? 59 : prev.minute - 1
                }))}
                className="text-lg font-semibold"
              >
                <ChevronDown />
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => setSelectedTime(prev => ({
                  ...prev,
                  period: prev.period === "AM" ? "PM" : "AM"
                }))}
                className="text-lg font-semibold"
              >
                <ChevronDown className="rotate-180" />
              </button>
              <div>{selectedTime.period}</div>
              <button
                onClick={() => setSelectedTime(prev => ({
                  ...prev,
                  period: prev.period === "AM" ? "PM" : "AM"
                }))}
                className="text-lg font-semibold"
              >
                <ChevronDown />
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                // Format time as HH:MM:SS
                const hour12 = selectedTime.hour;
                const hour24 = selectedTime.period === "AM"
                  ? (hour12 === 12 ? 0 : hour12)
                  : (hour12 === 12 ? 12 : hour12 + 12);

                const timeStr = `${hour24.toString().padStart(2, "0")}:${selectedTime.minute.toString().padStart(2, "0")}:00`;

                // Combine with the date that was already selected
                if (tempFilters[currentFilterKey]?.[0]) {
                  const dateStr = tempFilters[currentFilterKey][0].split('T')[0];
                  const dateTimeStr = `${dateStr}T${timeStr}`;

                  setTempFilters(prev => ({
                    ...prev,
                    [currentFilterKey]: [dateTimeStr]
                  }));
                }

                setTimeDialogOpen(false);
              }}
              className="w-full"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
