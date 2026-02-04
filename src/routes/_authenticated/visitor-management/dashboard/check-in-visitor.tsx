import BasicInfromationForm from "@/components/BasicInformationForm";
import { useSocketEmit } from "@/hooks";
import { useMutateDayPassVisitor } from "@/hooks/mutation/useMutateDayPassVisitor";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { createFileRoute } from "@tanstack/react-router";
import { set } from "date-fns";
import { useEffect, useRef, useState } from "react";
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
    isPending,
  } = useMutateDayPassVisitor();

  const { emitWithAck } = useSocketEmit();

  const { errorStyle, successStyle } = useToastStyleTheme();

  const formRef = useRef<{ resetForm: () => void }>(null);

  const [isSocketSumitting, setIsSocketSubmitting] = useState(false);

  const [socketData, setSocketData] = useState({});

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

      try {
        setIsSocketSubmitting(true);
        emitWithAck("visitor_web", socketData, ({ ok }) => {
          if (ok) {
            setIsSocketSubmitting(false);
            // toast.success("Checkin Successfull", {
            //   style: successStyle,
            // });
          }
        });
      } catch (err) {
        console.error("Socket emission error:", err);
      } finally {
        setIsSocketSubmitting(false);
      }

      handleReset();
    }
  }, [isError, isSuccess]);

  return (
    <BasicInfromationForm
      ref={formRef}
      isPending={isPending || isSocketSumitting}
      type="check-in"
      onSubmitData={(data) => {
        checkInVisitor(data);
        setSocketData({
          data: data.UHF,
          device_id: 0,
          otd: true,
          date_receive: new Date(),
        });
      }}
    />
  );
}
