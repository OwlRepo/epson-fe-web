import { EvacuationMonitoringLayout } from "@/components/layouts/EvacuationMonitoringLayout";
import { withModuleAccess } from "@/utils/guardRoute";
import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/evacuation-monitoring")({
  component: RouteComponent,
  beforeLoad: withModuleAccess(["EVS"], {
    fallbackError: new Error("You do not have access to this module."),
  }),
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
