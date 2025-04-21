import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/vip/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/visitor-management/vip/overview"!</div>;
}
