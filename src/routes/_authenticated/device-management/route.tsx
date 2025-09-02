import { DeviceManagementLayout } from "@/components/layouts/DeviceManagementLayout";
import { withModuleAccess } from "@/utils/guardRoute";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/device-management")({
  component: RouteComponent,
  beforeLoad: ({ location }) => {
    withModuleAccess(["DMG"], {
      fallbackError: new Error("You do not have access to this module."),
    });

    if (
      location.pathname === "/device-management" ||
      location.pathname === "/device-management/dashboard"
    ) {
      throw redirect({
        to: "/device-management/dashboard/overview",
        replace: true,
      });
    }
  },
});

function RouteComponent() {
  return (
    <DeviceManagementLayout>
      <Outlet />
    </DeviceManagementLayout>
  );
}
