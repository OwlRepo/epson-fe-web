import { VisitorManagementLayout } from "@/components/layouts/VisitorManagementLayout";
import { withModuleAccess } from "@/utils/guardRoute";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/visitor-management")({
  component: RouteComponent,
  beforeLoad: withModuleAccess(["VMS"], {
    fallbackError: new Error("You do not have access to this module."),
  }),
  loader: async () => {
    if (
      location.pathname === "/visitor-management" ||
      location.pathname === "/visitor-management/dashboard"
    ) {
      throw redirect({
        to: "/visitor-management/dashboard/overview",
        replace: true,
      });
    }
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
    from: "/_authenticated/visitor-management",
  });
  return (
    <VisitorManagementLayout userProfile={userProfile} defaultCollapsed={false}>
      <Outlet />
    </VisitorManagementLayout>
  );
}
