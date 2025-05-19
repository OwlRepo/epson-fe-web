import { AttendanceMonitoringLayout } from "@/components/layouts/AttendanceMonitoringLayout";
import { createFileRoute, Outlet, redirect, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/attendance-monitoring")({
  component: DashboardPage,
  beforeLoad: ({ location }) => {
    // Redirect from /attendance-monitoring or /attendance-monitoring/dashboard to /attendance-monitoring/dashboard/overview
    if (location.pathname === '/attendance-monitoring' || location.pathname === '/attendance-monitoring/dashboard') {
      throw redirect({
        to: '/attendance-monitoring/dashboard/overview',
        replace: true
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
