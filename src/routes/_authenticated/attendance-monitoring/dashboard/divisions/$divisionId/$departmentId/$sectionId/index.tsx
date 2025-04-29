import CardSection from '@/components/layouts/CardSection'
import CardHeaderLeft from '@/components/ui/card-header-left'
import CardHeaderRight from '@/components/ui/card-header-right'
import { DepartmentCard } from '@/components/ui/department-card'
import { createFileRoute, Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useEmployeeData } from '@/hooks'
import { EpsonFlame } from '@/assets/svgs'
import Spinner from '@/components/ui/spinner'
import { LiveDataTable } from '@/components/ui/live-data-table'

export const Route = createFileRoute(
  '/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, error, isConnected } = useEmployeeData();


  const navigate = useNavigate({
    from: '/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId'
  });

  const search = useSearch({
    from: '/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/'
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
  return (
    <CardSection headerLeft={<CardHeaderLeft title={<div className="flex items-center space-x-2"><EpsonFlame /><b className="text-[20px] text-primary">Live Data</b></div>} />}>

      {
        isConnected && !isLoading ? <div className='flex'>
          <LiveDataTable
            pageSize={Number(search.pageSize) || 10}
            onPageSizeChange={handlePageSizeChange}
            columns={[
              {
                key: 'employee_id',
                label: 'ID',
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
                key: 'employee_id',
                label: 'ID',
                options: [
                  { label: 'All', value: '' },
                  ...data.map((item) => ({
                    label: item.employee_id,
                    value: item.employee_id,
                  })),
                ]
              },
              {
                key: 'department',
                label: 'Department',
                options: [
                  ...data.map((item) => ({
                    label: item.department,
                    value: item.department,
                  })),
                ],
              },
              {
                key: 'name',
                label: 'Name',
                options: [
                  ...data.map((item) => ({
                    label: item.full_name,
                    value: item.full_name,
                  })),
                ],
              },
              {
                key: "dateTime",
                label: "Date & Time",
                isDateTimePicker: true,
              }
            ]}
            data={data.map(employeeData => {
              const { employee_id, department, in: clockedIn, out, full_name } = employeeData;
              return {
                employee_id: employee_id,
                department: department,
                name: full_name,
                clocked_in: clockedIn,
                clocked_out: out,
              };
            }).filter((item) => {
              const matchesDepartment =
                !search.filter_department || item.department === search.filter_department;
              const matchesId =
                !search.filter_employee_id || item.employee_id === search.filter_employee_id;
              const matchesName =
                !search.filter_name || item.name === search.filter_name;

              return matchesDepartment && matchesId && matchesName;
            })}
            onFilter={handleFilter}
            onSearch={handleSearch}
            routeSearch={search}
            isLoading={false}
            tableId='divisions-departments-sections-table'
          />
        </div> : <div className='flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10'><Spinner /><p>Loading...</p></div>
      }

    </CardSection>
  )
}
