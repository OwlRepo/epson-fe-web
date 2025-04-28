import CardSection from '@/components/layouts/CardSection'
import CardHeaderLeft from '@/components/ui/card-header-left'
import CardHeaderRight from '@/components/ui/card-header-right'
import { DepartmentCard } from '@/components/ui/department-card'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useEmployeeData } from '@/hooks'
import { EpsonFlame } from '@/assets/svgs'

export const Route = createFileRoute(
  '/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = useParams({ from: '/_authenticated/attendance-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId/' });
  const { data, isLoading, error, isConnected } = useEmployeeData();

  return (
    <CardSection headerLeft={<CardHeaderLeft title={<div className="flex items-center space-x-2"><EpsonFlame /><b className="text-[20px] text-primary">Live Data</b></div>} />}>

      <pre>data: {JSON.stringify(data, null, 2)}</pre>

    </CardSection>
  )
}
