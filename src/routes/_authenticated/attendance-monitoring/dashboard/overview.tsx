import { ClockedInIcon, ClockedOutIcon, EpsonFlame, InPremisesIcon } from "@/assets/svgs";
import CardSection from "@/components/layouts/CardSection";
import AttendanceCountCard from "@/components/ui/attendance-count-card";
import CardHeaderLeft from "@/components/ui/card-header-left";
import { LiveDataTable } from "@/components/ui/live-data-table";
import { faker } from "@faker-js/faker";
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
  // Add handler for page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageSize: String(newPageSize),
      }),
      replace: true,
    });
  };


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
        <LiveDataTable
          pageSize={Number(search.pageSize) || 10}
          onPageSizeChange={handlePageSizeChange}
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
          ]}
          data={Array.from({ length: 100 }, () => ({
            id: faker.string.numeric(6),
            department: faker.commerce.department(),
            name: faker.person.fullName(),
            clocked_in: faker.date.recent().toLocaleTimeString(),
            clocked_out: faker.date.recent().toLocaleTimeString(),
            dateTime: faker.date.recent().toISOString(),
          }))
            .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()) // Sort by latest first
            .slice(0, Number(search.pageSize) || 10) // Take only the latest entries based on pageSize
            .filter((item) => {
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
          tableId='divisions-departments-sections-table'
        />
      </CardSection>
    </div>
  );
}
