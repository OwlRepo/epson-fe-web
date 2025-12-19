import { DialogTitle, type DialogProps } from "@radix-ui/react-dialog";
import type { VisitorData } from "../BasicInformationForm";
import { useCheckoutVisitor } from "@/hooks/mutation/useCheckoutVisitor";
import { Dialog, DialogContent, DialogHeader } from "./dialog";
import BasicInfromationForm from "../BasicInformationForm";
import { useUpdateReservedGuest } from "@/hooks/mutation/useUpdateReservedGuest";
import Spinner from "./spinner";
import { format, set } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { useSocket, useSocketEmit } from "@/hooks";

interface ReservedGuestInfoDialogProps extends DialogProps {
  visitor?: VisitorData;
  isLoading?: boolean;
}

export const ReservedGuestInfoDialog = ({
  open,
  visitor,
  onOpenChange,
  isLoading = false,
}: ReservedGuestInfoDialogProps) => {
  const { mutate: checkoutVisitor } = useCheckoutVisitor();
  const {
    mutate: updateReservedGuest,
    isSuccess,
    isError,
    error,
  } = useUpdateReservedGuest();

  const { errorStyle, successStyle } = useToastStyleTheme();
  const { emitData } = useSocket({ room: "updates" });

  const { emit } = useSocketEmit();
  const [socketData, setSocketData] = useState({});

  const memoizedInitialData = useMemo(() => {
    if (!visitor) return undefined;
    return {
      ...visitor,
      Date: {
        from: visitor.DateFrom,
        to: visitor.DateTo,
      },
    };
  }, [visitor?.ID, visitor?.DateFrom, visitor?.DateTo]);

  const handleSubmit = (data: Partial<VisitorData>) => {
    switch (data.type) {
      case "link-new-card":
        // Handle VIP registration logic here
        console.log("link a new card:", data);
        updateReservedGuest({
          visitorID: visitor?.ID,
          payload: {
            UHF: data.UHF,
          },
        });
        break;
      case "extend-visit":
        // Handle extend logic here
        console.log("Check-In Data:", data);

        updateReservedGuest({
          visitorID: visitor?.ID,
          payload: {
            DateTo: format(data.Date.to, "yyyy-MM-dd"),
          },
        });
        break;
      case "check-out":
        // Handle check-out logic here
        checkoutVisitor({ VisitorID: visitor?.ID ?? "" });
        setSocketData({
          data: visitor?.UHF,
          device_id: 0,
        });
        break;
      case "save-new-photo":
        // Handle check-out logic here
        console.log("Check-Out Data:", data);
        updateReservedGuest({
          visitorID: visitor?.ID,
          payload: {
            Picture: data.Picture,
          },
        });
        break;
      case "update-data":
        const { type, CardSurrendered, ID, Status, ...payload } = data;

        const { Date, ...processedPayload } = {
          ...payload,
          DateTo: format(data.Date.to, "yyyy-MM-dd"),
          DateFrom: format(data.Date.from, "yyyy-MM-dd"),
          GuestType: payload?.GuestType?.toString(),
        } as any;

        updateReservedGuest({
          visitorID: visitor?.ID,
          payload: processedPayload as any,
        });
        break;
      default:
        console.error("Unknown form type");
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error("Oops! Saving error!", {
        description:
          (error as any)?.response?.data?.message ??
          "An unknown error occurred",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
    }
    if (isSuccess) {
      toast.success("Save Successfully!", {
        description: " You're all set!",
        style: successStyle,
      });

      emitData("users");
      emit("visitor_web", {
        ...socketData,
        date_receive: new Date(),
      });
      onOpenChange?.(false);
    }
  }, [isError, isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-[900px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Visitor Information
          </DialogTitle>
        </DialogHeader>
        {isLoading && <Spinner />}
        {!isLoading && (
          <BasicInfromationForm
            isDialog
            initialData={memoizedInitialData}
            type="register-vip"
            onSubmitData={handleSubmit}
            onUnlinkSubmit={() =>
              updateReservedGuest({
                visitorID: visitor?.ID,
                payload: {
                  UHF: "",
                },
              })
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
