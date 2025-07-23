import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  "/_authenticated/device-management/dashboard/overview"
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/device-management/dashboard/overview"!</div>;
}
