import { DialogTitle, type DialogProps } from "@radix-ui/react-dialog";
import type { VisitorData } from "../BasicInformationForm";
import { useCheckoutVisitor } from "@/hooks/mutation/useCheckoutVisitor";
import { Dialog, DialogContent, DialogHeader } from "./dialog";
import BasicInfromationForm from "../BasicInformationForm";
import { useUpdateReservedGuest } from "@/hooks/mutation/useUpdateReservedGuest";
import Spinner from "./spinner";
import { format } from "date-fns";
import { useEffect } from "react";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { useSocket } from "@/hooks";

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
          DateFrom: payload.Date.from,
          DateTo: payload.Date.to,
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
            initialData={
              visitor && {
                ...visitor,
                Date: {
                  from: visitor.DateFrom,
                  to: visitor.DateTo,
                },
              }
            }
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
