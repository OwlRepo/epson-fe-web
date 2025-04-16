import { ClockedInIcon, ClockedOutIcon, EpsonFlame, InPremisesIcon } from "@/assets/svgs";
import CardSection from "@/components/layouts/CardSection";
import AttendanceCountCard from "@/components/ui/attendance-count-card";
import CardHeaderLeft from "@/components/ui/card-header-left";
import { DynamicTable } from "@/components/ui/dynamic-table";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({
    from: '/attendance-monitoring/dashboard/overview'
  });
  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/dashboard/overview",
  });

  // Handle filter changes
  const handleFilter = (key: string, value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [`filter_${key}`]: value || undefined,
      }),
      replace: true,
    });
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchTerm,
      }),
      replace: true,
    });
  };

  return (
    <div className="space-y-8">
      <CardSection headerLeft={<CardHeaderLeft />} >
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <AttendanceCountCard count={1500} icon={<InPremisesIcon />} subtitle="Inside premises" />
          <AttendanceCountCard count={0} icon={<ClockedInIcon />} subtitle="Clocked in" variant="success" />
          <AttendanceCountCard count={0} icon={<ClockedOutIcon />} subtitle="Clocked out" variant="error" />
        </div>
      </CardSection>
      <CardSection headerLeft={<CardHeaderLeft title={<div className="flex items-center space-x-2"><EpsonFlame /><b className="text-[20px] text-primary">Live Data</b></div>} subtitle="" />} >
        <DynamicTable
          isLiveData
          columns={[
            {
              key: 'id',
              label: 'ID',
              sortable: true,
            },
            {
              key: 'department',
              label: 'DEPARTMENT',
            },
            {
              key: 'name',
              label: 'NAME',
            },
            {
              key: 'clocked_in',
              label: 'CLOCKED IN',
            },
            {
              key: 'clocked_out',
              label: 'CLOCKED OUT',
            }
          ]}
          filters={[
            {
              key: 'id',
              label: 'ID',
              options: [
                { label: 'All', value: '' },
                { label: '123456', value: '123456' },
                { label: '654321', value: '654321' },
                { label: '789012', value: '789012' },
                { label: '345678', value: '345678' },
                { label: '901234', value: '901234' },
                { label: '567890', value: '567890' },
                { label: '234567', value: '234567' },
                { label: '890123', value: '890123' },
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
          ]}
          data={[
            {
              id: '123456',
              department: 'HR',
              name: 'John Doe',
              clocked_in: '08:00 AM',
              clocked_out: '05:00 PM',
              dateTime: '2025-04-16'
            },
            {
              id: '654321',
              department: 'Engineering',
              name: 'Jane Smith',
              clocked_in: '09:00 AM',
              clocked_out: '06:00 PM',
              dateTime: '2025-04-17'
            },
            {
              id: '789012',
              department: 'Sales',
              name: 'Bob Johnson',
              clocked_in: '08:30 AM',
              clocked_out: '05:30 PM',
              dateTime: '2025-04-17'
            }
          ].filter((item) => {
            const matchesDepartment =
              !search.filter_department || item.department === search.filter_department;
            const matchesDateTime =
              !search.filter_dateTime || item.dateTime === search.filter_dateTime;
            const matchesId =
              !search.filter_id || item.id === search.filter_id;
            const matchesName =
              !search.filter_name || item.name === search.filter_name;
            const matchesSearch =
              !search.search ||
              item.name.toLowerCase().includes(search.search.toLowerCase()) ||
              item.department.toLowerCase().includes(search.search.toLowerCase()) ||
              item.id.toLowerCase().includes(search.search.toLowerCase());

            return matchesDepartment && matchesDateTime && matchesId && matchesName && matchesSearch;
          })}
          onFilter={handleFilter}
          onSearch={handleSearch}
          routeSearch={search}
          isLoading={false}
        />
      </CardSection>
    </div>
  );
}
