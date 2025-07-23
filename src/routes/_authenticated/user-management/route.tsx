import { UserManagementLayout } from "@/components/layouts/UserManagementLayout";
import { withModuleAccess } from "@/utils/guardRoute";
import {
  createFileRoute,
  Outlet,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/user-management")({
  component: RouteComponent,
  beforeLoad: withModuleAccess(["UMG"], {
    fallbackError: new Error("You do not have access to this module."),
  }),
  loader: async () => {
    if (location.pathname === "/user-management") {
      throw redirect({
        to: "/user-management/list-of-users",
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
    from: "/_authenticated/user-management",
  });
  return (
    <UserManagementLayout userProfile={userProfile} defaultCollapsed={false}>
      <Outlet />
    </UserManagementLayout>
  );
}
