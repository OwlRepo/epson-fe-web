import { ClockedInIcon, ClockedOutIcon, InPremisesIcon } from "@/assets/svgs";
import CardSection from "@/components/layouts/CardSection";
import AttendanceCountCard from "@/components/ui/attendance-count-card";
import CardHeaderLeft from "@/components/ui/card-header-left";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {

  return (
    <div className="space-y-8">
      <CardSection headerLeft={<CardHeaderLeft />} >
        <div className="flex justify-between gap-4">
          <AttendanceCountCard count={1500} icon={<InPremisesIcon />} subtitle="Inside premises" />
          <AttendanceCountCard count={0} icon={<ClockedInIcon />} subtitle="Clocked in" variant="success" />
          <AttendanceCountCard count={0} icon={<ClockedOutIcon />} subtitle="Clocked out" variant="error" />
        </div>
      </CardSection>
    </div>
  );
}
