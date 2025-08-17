import { EvacuationMonitoringLayout } from "@/components/layouts/EvacuationMonitoringLayout";
import { withModuleAccess } from "@/utils/guardRoute";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/evacuation-monitoring")({
  component: DashboardPage,
  beforeLoad: ({ location }) => {
    const accessCheck = withModuleAccess(["EVS"], {
      fallbackError: new Error("You do not have access to this module."),
    });

    accessCheck(); // Run the access guard
    if (
      location.pathname === "/evacuation-monitoring" ||
      location.pathname === "/evacuation-monitoring/dashboard"
    ) {
      throw redirect({
        to: "/evacuation-monitoring/dashboard/overview",
        replace: true,
      });
    }
  },
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

function DashboardPage() {
  const { userProfile } = useLoaderData({
    from: "/_authenticated/evacuation-monitoring",
  });
  const location = useLocation();
  return location.pathname.includes("validate-token") ? (
    <Outlet />
  ) : (
    <EvacuationMonitoringLayout
      userProfile={userProfile}
      defaultCollapsed={false}
    >
      <Outlet />
    </EvacuationMonitoringLayout>
  );
}
