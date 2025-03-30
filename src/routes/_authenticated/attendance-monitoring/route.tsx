import { AttendanceMonitoringLayout } from "@/components/layouts/attendance-monitoring-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/attendance-monitoring")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AttendanceMonitoringLayout
      title="Dashboard"
      subtitle="Dashboard • Department"
      backLink="/_authenticated/attendance_monitoring"
      backText="Attendance Monitoring"
      userProfile={{
        name: "Ethan Blackwood",
        role: "HR Manager",
      }}
      defaultCollapsed={false}
    >
      <Outlet />
    </AttendanceMonitoringLayout>
  );
}
