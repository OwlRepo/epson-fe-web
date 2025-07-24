import BasicInfromationForm from "@/components/BasicInformationForm";
import { useSocket } from "@/hooks";
import { useMutateDayPassVisitor } from "@/hooks/mutation/useMutateDayPassVisitor";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/dashboard/check-in-visitor"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    mutate: checkInVisitor,
    isError,
    isSuccess,
    error,
  } = useMutateDayPassVisitor();

  const { emitData } = useSocket({ room: "updates" });

  const { errorStyle, successStyle } = useToastStyleTheme();

  useEffect(() => {
    if (isError) {
      toast.error("Visitor Check-In Unsuccessful", {
        description:
          (error as any)?.response?.data?.message ??
          "Something Went Wrong – Please Try Again ",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
    }
    if (isSuccess) {
      toast.success("Visitor Check-In Successful", {
        description: "The guest has checked in successfully.",
        style: successStyle,
      });
      emitData("users");
    }
  }, [isError, isSuccess]);

  return (
    <BasicInfromationForm
      type="check-in"
      onSubmitData={(data) => {
        checkInVisitor(data);
      }}
    />
  );
}
