import { DeviceManagementLayout } from "@/components/layouts/DeviceManagementLayout";
import { withModuleAccess } from "@/utils/guardRoute";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/device-management")({
  component: RouteComponent,
  beforeLoad: withModuleAccess(["DMG"], {
    fallbackError: new Error("You do not have access to this module."),
  }),
});

function RouteComponent() {
  return (
    <DeviceManagementLayout>
      <Outlet />
    </DeviceManagementLayout>
  );
}
