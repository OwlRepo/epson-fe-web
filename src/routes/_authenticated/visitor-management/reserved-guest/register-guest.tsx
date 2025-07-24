import BasicInfromationForm from "@/components/BasicInformationForm";
import { useSocket } from "@/hooks";
import { useMutateReservedGuest } from "@/hooks/mutation/useMutateReservedGuest";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/reserved-guest/register-guest"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    mutate: checkInReservedGuest,
    isError,
    error,
    isSuccess,
    isPending,
  } = useMutateReservedGuest();
  const { emitData } = useSocket({ room: "updates" });

  const { errorStyle, successStyle } = useToastStyleTheme();
  const formRef = useRef<{ resetForm: () => void }>(null);

  const handleReset = () => {
    formRef.current?.resetForm();
  };

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
      handleReset();
      emitData("users");
    }
  }, [isError, isSuccess]);

  return (
    <BasicInfromationForm
      ref={formRef}
      type="register-vip"
      isPending={isPending}
      onSubmitData={(data) => {
        checkInReservedGuest(data);
      }}
    />
  );
}
