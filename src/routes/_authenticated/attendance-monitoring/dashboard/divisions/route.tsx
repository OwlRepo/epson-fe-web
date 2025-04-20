import CardSection from '@/components/layouts/CardSection'
import CardHeaderLeft from '@/components/ui/card-header-left'
import CardHeaderRight from '@/components/ui/card-header-right'
import { DepartmentCard } from '@/components/ui/department-card'
import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { faker } from '@faker-js/faker'
import { EpsonFlame } from '@/assets/svgs'
import { LiveDataTable } from '@/components/ui/live-data-table'

export const Route = createFileRoute(
  '/_authenticated/attendance-monitoring/dashboard/divisions',
)({
  component: RouteComponent,
})

const divisions = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  title: faker.commerce.department(),
  clockedIn: Math.floor(Math.random() * 100),
  clockedOut: Math.floor(Math.random() * 100),
}))
const departments = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  title: faker.commerce.department(),
  clockedIn: Math.floor(Math.random() * 100),
  clockedOut: Math.floor(Math.random() * 100),
}))
const sections = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  title: faker.commerce.department(),
  clockedIn: Math.floor(Math.random() * 100),
  clockedOut: Math.floor(Math.random() * 100),
}))

function RouteComponent() {
  const queryParams = useSearch({ from: '/_authenticated/attendance-monitoring/dashboard/divisions' })

  const navigate = useNavigate({
    from: '/attendance-monitoring/dashboard/divisions'
  });

  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/dashboard/divisions",
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

  const { divisionId, departmentId, sectionId } = queryParams


  // Get current selections from the lists
  const currentDivision = divisionId ? divisions.find(d => d.id.toString() === divisionId) : null
  const currentDepartment = departmentId ? departments.find(d => d.id.toString() === departmentId) : null
  const currentSection = sectionId ? sections.find(s => s.id.toString() === sectionId) : null

  return (
    <CardSection headerLeft={<CardHeaderLeft />} headerRight={<CardHeaderRight />}>
      {sectionId ? (
        <div className="flex items-center space-x-2 my-5">
          <EpsonFlame /><b className="text-[20px] text-primary">Live Data</b>
        </div>
      ) : <h2 className="text-2xl font-bold my-5">{
        !currentDepartment && currentDivision ? "Departments" : !currentDivision ? "Divisions" : ""
      }{
          currentDivision && currentDepartment && "Sections"
        }</h2>}
      {currentDivision && (
        <div className="flex flex-col gap-2 my-5">
          <div className="text-sm text-gray-600">
            <Link
              to='/attendance-monitoring/dashboard/divisions'
              search={{ divisionId }}
              className="hover:text-primary"
            >
              {currentDivision?.title}
            </Link>
            {currentDepartment && (
              <>
                <span className="mx-2">›</span>
                <Link
                  to='/attendance-monitoring/dashboard/divisions'
                  search={{ divisionId, departmentId }}
                  className="hover:text-primary"
                >
                  {currentDepartment.title}
                </Link>
              </>
            )}
            {currentSection && (
              <>
                <span className="mx-2">›</span>
                <span className="text-primary">{currentSection.title}</span>
              </>
            )}
          </div>
        </div>
      )}
      {!sectionId && <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
        {!divisionId && divisions.map((division) => (
          <Link
            to='/attendance-monitoring/dashboard/divisions'
            key={division.id}
            search={{ ...queryParams, divisionId: division.id.toString() }}
          >
            <DepartmentCard
              title={division.title}
              clockedIn={division.clockedIn}
              clockedOut={division.clockedOut}
              className='hover:cursor-pointer hover:bg-primary/30 transition-all duration-200 ease-in-out hover:shadow-lg'
            />
          </Link>
        ))}

        {divisionId && !departmentId && departments.map((department) => (
          <Link
            to='/attendance-monitoring/dashboard/divisions'
            key={department.id}
            search={{ ...queryParams, departmentId: department.id.toString() }}
          >
            <DepartmentCard
              title={department.title}
              clockedIn={department.clockedIn}
              clockedOut={department.clockedOut}
              className='hover:cursor-pointer hover:bg-primary/30 transition-all duration-200 ease-in-out hover:shadow-lg'
            />
          </Link>
        ))}

        {divisionId && departmentId && !sectionId && sections.map((section) => (
          <Link
            to='/attendance-monitoring/dashboard/divisions'
            key={section.id}
            search={{ ...queryParams, sectionId: section.id.toString() }}
          >
            <DepartmentCard
              title={section.title}
              clockedIn={section.clockedIn}
              clockedOut={section.clockedOut}
              className='hover:cursor-pointer hover:bg-primary/30 transition-all duration-200 ease-in-out hover:shadow-lg'
            />
          </Link>
        ))}
      </div>}

      {sectionId && (
        <div className='flex'>
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
                  ...Array.from({ length: 10 }, (_, i) => ({
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
              clocked_in: faker.date.past().toLocaleTimeString(),
              clocked_out: faker.date.future().toLocaleTimeString(),
              dateTime: faker.date.recent().toISOString().slice(0, 10),
            })).filter((item) => {
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
        </div>
      )}
    </CardSection>
  )
}
