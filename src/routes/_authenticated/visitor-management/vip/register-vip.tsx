import BasicInfromationForm from "@/components/BasicInformationForm";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/vip/register-vip"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm();
  return (
    <BasicInfromationForm
      type="register-vip"
      form={form}
      onCheckIn={(data) => {
        console.log(data);
      }}
    />
  );
}
