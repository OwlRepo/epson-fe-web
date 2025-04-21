import BasicInfromationForm from "@/components/BasicInformationForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/dashboard/check-in-visitor"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <BasicInfromationForm
      type="check-in"
      onCheckIn={(data) => {
        console.log(data);
      }}
    />
  );
}
