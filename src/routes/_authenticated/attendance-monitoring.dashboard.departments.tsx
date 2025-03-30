import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/attendance-monitoring/dashboard/departments',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_authenticated/attendance-monitoring/dashboard/departments"!
    </div>
  )
}
