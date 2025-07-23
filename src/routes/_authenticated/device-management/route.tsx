import { DeviceManagementLayout } from "@/components/layouts/DeviceManagementLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/device-management")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DeviceManagementLayout>
      <Outlet />
    </DeviceManagementLayout>
  );
}
