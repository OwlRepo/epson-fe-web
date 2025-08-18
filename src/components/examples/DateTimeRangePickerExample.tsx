import { DynamicTable, type Column, type Filter } from "../ui/dynamic-table";

// Sample data for demonstration
const sampleData = [
  {
    id: 1,
    name: "John Doe",
    event: "Meeting",
    createdAt: "2024-01-15T10:30:00",
    status: "Active"
  },
  {
    id: 2,
    name: "Jane Smith", 
    event: "Conference",
    createdAt: "2024-01-16T14:45:00",
    status: "Completed"
  },
  {
    id: 3,
    name: "Bob Johnson",
    event: "Workshop",
    createdAt: "2024-01-17T09:15:00", 
    status: "Pending"
  }
];

const columns: Column[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "event", label: "Event" },
  { key: "createdAt", label: "Created At", render: (row) => new Date(row.createdAt).toLocaleString() },
  { key: "status", label: "Status" }
];

const filters: Filter[] = [
  {
    key: "createdAt",
    label: "Created Date & Time Range",
    isDateTimeRangePicker: true, // This enables the new date-time range picker
  },
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "Active" },
      { label: "Completed", value: "Completed" },
      { label: "Pending", value: "Pending" }
    ]
  }
];

export default function DateTimeRangePickerExample() {
  const handleFilter = (key: string, value: string) => {
    console.log(`Filter applied - ${key}: ${value}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Date-Time Range Picker Filter Example</h2>
      <p className="text-gray-600 mb-6">
        This example demonstrates the new <code className="bg-gray-100 px-2 py-1 rounded">isDateTimeRangePicker</code> filter option.
        Use the "Created Date & Time Range" filter to select a range of dates with specific times.
      </p>
      
      <DynamicTable
        columns={columns}
        data={sampleData}
        filters={filters}
        onFilter={handleFilter}
        routeSearch={{}} // Empty object for demo purposes
      />
    </div>
  );
}
