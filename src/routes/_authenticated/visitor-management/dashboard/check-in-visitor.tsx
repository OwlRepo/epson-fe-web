import BasicInfromationForm from "@/components/BasicInformationForm";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/dashboard/check-in-visitor"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm();

  const onCheckIn = (data: any) => {
    console.log("Form Data: ", data);
  };
  return <BasicInfromationForm form={form} onCheckIn={onCheckIn} />;
}
