import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/evacuation-monitoring/overview',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/evacuation-monitoring/overview"!</div>
}
