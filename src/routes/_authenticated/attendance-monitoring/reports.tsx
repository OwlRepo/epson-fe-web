import CardSection from '@/components/layouts/CardSection'
import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
// Import necessary components and hooks
import { useEffect, useMemo } from "react";
import { DynamicTable } from "@/components/ui/dynamic-table";
import useTableSelectionStore from "@/store/tableSelectionStore";
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { faker } from '@faker-js/faker';




export const Route = createFileRoute(
    '/_authenticated/attendance-monitoring/reports',
)({
    component: RouteComponent,
})


// Component setup
function ReportsDataTable() {
    const params = useParams({ from: '/_authenticated/attendance-monitoring/reports' });
    const navigate = useNavigate({
        from: '/attendance-monitoring/reports'
    });

    const { data, isLoading } = useQuery({
        queryKey: ['reports', params],
        queryFn: async () => ([])
    })
    const search = useSearch({
        from: "/_authenticated/attendance-monitoring/reports",
    });

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
        { key: "department", label: "Department" },
        { key: "clocked_in", label: "Clocked In" },
        { key: "clocked_out", label: "Clocked Out" },
    ];

    const filters = [
        {
            key: 'id',
            label: 'ID',
            options: [
                { label: 'All', value: '' },
                ...Array.from({ length: 10 }, () => ({
                    label: faker.string.numeric(6),
                    value: faker.string.numeric(6),
                })),
            ]
        },
        {
            key: 'department',
            label: 'Department',
            options: [
                { label: 'All', value: '' },
                { label: 'HR', value: 'HR' },
                { label: 'Engineering', value: 'Engineering' },
                { label: 'Sales', value: 'Sales' },
            ],
        },
        {
            key: 'name',
            label: 'Name',
            options: [
                { label: 'All', value: '' },
                { label: 'John Doe', value: 'John Doe' },
                { label: 'Jane Smith', value: 'Jane Smith' },
            ],
        },
        {
            key: "dateTime",
            label: "Date & Time",
            isDateTimePicker: true,
        }
    ]

    // Handle selection changes
    const handleRowSelectionChange = (selected: any) => {
        console.log("Selected rows:", Object.values(selected));
        // Perform actions with selected rows
    };

    // Handle row click if needed
    const handleRowClick = (row: any) => {
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
                data={data ? data : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onSearch={handleSearch}
                routeSearch={search}
                exportTableData={{
                    exportOptions: [
                        {
                            "label": "Export Page",
                            onClick: () => {
                                console.log("Export Page clicked");
                            }
                        },
                        {
                            "label": "Export Selected Data",
                            onClick: () => {
                                console.log("Export Selected Data clicked");
                            }
                        },
                    ]
                }}

                // Multi-select configuration
                enableRowSelection={true}
                tableId={tableId}
                rowIdField="id"
                onRowSelectionChange={handleRowSelectionChange}
                filters={filters}

                // Other optional props
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onFilter={handleFilter}
                pagination={{
                    currentPage: 1,
                    pageSize: 10,
                    totalPages: 5,
                    totalItems: 50
                }}
            />
        </div>
    );
}

function RouteComponent() {
    return <CardSection>
        <ReportsDataTable />
    </CardSection>
}
