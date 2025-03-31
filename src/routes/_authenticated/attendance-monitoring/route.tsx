import { AttendanceMonitoringLayout } from "@/components/layouts/AttendanceMonitoringLayout";
import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/attendance-monitoring")({
  component: DashboardPage,
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
    from: "/_authenticated/attendance-monitoring",
  });
  return (
    <AttendanceMonitoringLayout
      userProfile={userProfile}
      defaultCollapsed={false}
    >
      <Outlet />
    </AttendanceMonitoringLayout>
  );
}
