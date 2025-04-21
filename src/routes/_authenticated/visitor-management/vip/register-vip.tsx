import BasicInfromationForm from "@/components/BasicInformationForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/vip/register-vip"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <BasicInfromationForm
      type="register-vip"
      onCheckIn={(data) => {
        console.log(data);
      }}
    />
  );
}
