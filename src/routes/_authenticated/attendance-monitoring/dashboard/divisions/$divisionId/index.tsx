import CardSection from '@/components/layouts/CardSection'
import CardHeaderLeft from '@/components/ui/card-header-left'
import CardHeaderRight from '@/components/ui/card-header-right'
import { DepartmentCard } from '@/components/ui/department-card'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useDepartmentData } from '@/hooks'
import Spinner from '@/components/ui/spinner'

export const Route = createFileRoute(
  '/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/' });
  const { data, isLoading, isConnected } = useDepartmentData();

  return (
    <CardSection headerLeft={<CardHeaderLeft />} headerRight={<CardHeaderRight />}>
      <h2 className='text-2xl font-bold my-5'>Departments</h2>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
        {
          isConnected && !isLoading ? data.filter(d => d.name).map((department) => (
            <Link to={`/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId`} params={{ ...params, departmentId: department.name }} key={department.name}>
              <DepartmentCard
                title={department.name}
                clockedIn={department.in}
                clockedOut={department.out}
              />
            </Link>))
            : <div className='flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10'><Spinner /><p>Loading...</p></div>
        }
      </div>

    </CardSection>
  )
}
