import { EvacuationMonitoringLayout } from "@/components/layouts/EvacuationMonitoringLayout";
import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/evacuation-monitoring")({
  component: RouteComponent,
  loader: async () => {
    // TODO: Get user profile from API
    return {
      userProfile: {
        name: "Ethan Blackwood",
        role: "HR Manager",
      },
    };
  },
});

function RouteComponent() {
  const { userProfile } = useLoaderData({
    from: "/_authenticated/evacuation-monitoring",
  });
  return (
    <EvacuationMonitoringLayout
      userProfile={userProfile}
      defaultCollapsed={false}
    >
      <Outlet />
    </EvacuationMonitoringLayout>
  );
}
