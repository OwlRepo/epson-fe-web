import SettingTab from "@/components/SettingTab";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/settings"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <SettingTab />;
}
