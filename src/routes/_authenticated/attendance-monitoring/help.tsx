import { createFileRoute } from "@tanstack/react-router";
import { SystemInfoSection } from "@/components/HelpSection/SystemInfoSection";
import { ContactDetailsSection } from "@/components/HelpSection/ContactDetailsSection";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/help"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <ContactDetailsSection />
        </div>
        <div>
          <SystemInfoSection />
        </div>
      </div>
    </div>
  );
}
