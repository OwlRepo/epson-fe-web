import { DynamicTable } from "@/components/ui/dynamic-table";
import type {
  Column,
  Filter,
  PaginationConfig,
  ExportTableData,
} from "@/components/ui/dynamic-table";

interface SocketDynamicTableProps {
  columns: Column[];
  data: any[];
  filters?: Filter[];
  onFilter?: (key: string, value: string) => void;
  className?: string;
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  routeSearch?: Record<string, string | undefined>;
  onRowClick?: (row: any) => void;
  isLoading?: boolean;
  onSearch?: (searchTerm: string) => void;
  searchTerm?: string;
  onClearSearch?: () => void;
  enableRowSelection?: boolean;
  tableId?: string;
  rowIdField?: string;
  onRowSelectionChange?: (selectedRows: Record<string, any>) => void;
  exportTableData?: ExportTableData;
  onClearTable?: () => void;
  clearButtonLabel?: string;
  onLoadMore?: () => Promise<void>;
  isLoadingMore?: boolean;
  totalCount?: number;
}

export function SocketDynamicTable(props: SocketDynamicTableProps) {
  return (
    <DynamicTable
      {...props}
      isLiveData={true}
      showPaginationForLive={true}
      // When passing external search term (socket scenarios), DynamicTable will respect it
    />
  );
}

export default SocketDynamicTable;
