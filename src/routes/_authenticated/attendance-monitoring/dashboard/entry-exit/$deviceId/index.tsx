import CardSection from '@/components/layouts/CardSection'
import CardHeaderLeft from '@/components/ui/card-header-left'
import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useEntryExitPointsData } from '@/hooks'
import { EpsonFlame } from '@/assets/svgs'
import Spinner from '@/components/ui/spinner'
import { LiveDataTable } from '@/components/ui/live-data-table'
import CardHeaderRight from '@/components/ui/card-header-right'
import useEntryExitStore from '@/store/useEntryExitStore'

export const Route = createFileRoute(
  '/_authenticated/attendance-monitoring/dashboard/entry-exit/$deviceId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({
    from: '/_authenticated/attendance-monitoring/dashboard/entry-exit/$deviceId/'
  });
  const { data, isLoading, isConnected, countData: totalLogs } = useEntryExitPointsData({
    room: 'VIEW_CONTROLLER' + params.deviceId,
    dataType: 'live'
  });

  const navigate = useNavigate({
    from: '/attendance-monitoring/dashboard/entry-exit/$deviceId'
  });

  const search = useSearch({
    from: '/_authenticated/attendance-monitoring/dashboard/entry-exit/$deviceId/'
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

  const { currentSelectedDeviceType } = useEntryExitStore()

  return (
    <CardSection headerLeft={<CardHeaderLeft title={<div className="flex items-center space-x-2"><EpsonFlame /><b className="text-[20px] text-primary">Live Data</b></div>} />} headerRight={<CardHeaderRight clockedOut={currentSelectedDeviceType === 'Clocked Out' ? totalLogs?.out : undefined} clockedIn={currentSelectedDeviceType === 'Clocked In' ? totalLogs?.in : undefined} />}>
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
              currentSelectedDeviceType === 'Clocked In' ? {
                key: 'clocked_in',
                label: 'CLOCKED IN',
              } : {
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
              const { employee_id, department, clocked_in, clocked_out, full_name } = employeeData;
              return {
                employee_id: employee_id,
                department: department,
                name: full_name,
                clocked_in: clocked_in ?? '-',
                clocked_out: clocked_out ?? '-',
              };
            }).filter((item) => {
              const matchesDepartment =
                !search.filter_department || item.department === search.filter_department;
              const matchesId =
                !search.filter_employee_id || item.employee_id === search.filter_employee_id;
              const matchesName =
                !search.filter_name || item.name === search.filter_name;

              return matchesDepartment && matchesId && matchesName;
            }).reverse()}
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
