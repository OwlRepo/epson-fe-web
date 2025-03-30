import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/dashboard/entry-exit"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello "/_authenticated/attendance-monitoring/dashboard/entry-exit"!
    </div>
  );
}
