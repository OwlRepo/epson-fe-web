import CardSection from '@/components/layouts/CardSection'
import CardHeaderLeft from '@/components/ui/card-header-left'
import CardHeaderRight from '@/components/ui/card-header-right'
import { DepartmentCard } from '@/components/ui/department-card'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEntryExitPointsData } from '@/hooks'
import Spinner from '@/components/ui/spinner'
export const Route = createFileRoute(
    "/_authenticated/attendance-monitoring/dashboard/entry-exit/"
)({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, isLoading, isConnected, countData: totalLogs } = useEntryExitPointsData({
        room: 'VIEW_CONTROLLER',
        dataType: 'summary'
    });

    return (
        <CardSection headerLeft={<CardHeaderLeft />} headerRight={<CardHeaderRight clockedOut={totalLogs?.out} clockedIn={totalLogs?.in} />}>
            <h2 className='text-2xl font-bold my-5'>Entry & Exit Points</h2>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                {
                    isConnected && !isLoading ? data.filter(d => d.DeviceName).map((point) => (
                        <Link to={`/attendance-monitoring/dashboard/entry-exit/$deviceId`} params={{ deviceId: point.DeviceId.toString() }} key={point.DeviceId.toString()}>
                            <DepartmentCard
                                title={point.DeviceName}
                                clockedIn={point.DeviceLabel === 'Clocked In' ? point.DeviceCount : undefined}
                                clockedOut={point.DeviceLabel === 'Clocked Out' ? point.DeviceCount : undefined}
                            />
                        </Link>))
                        : <div className='flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10'><Spinner /><p>Loading...</p></div>
                }
            </div>

        </CardSection>
    )
}