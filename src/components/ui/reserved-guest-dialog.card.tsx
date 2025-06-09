import { DialogTitle, type DialogProps } from "@radix-ui/react-dialog";
import type { VisitorData } from "../BasicInformationForm";
import { useCheckoutVisitor } from "@/hooks/mutation/useCheckoutVisitor";
import { Dialog, DialogContent, DialogHeader } from "./dialog";
import BasicInfromationForm from "../BasicInformationForm";

interface ReservedGuestInfoDialogProps extends DialogProps {
  visitor?: VisitorData;
  isLoading?: boolean;
}

export const ReservedGuestInfoDialog = ({
  open,
  visitor,
  onOpenChange,
}: ReservedGuestInfoDialogProps) => {
  const { mutate: checkoutVisitor } = useCheckoutVisitor();

  const handleSubmit = (data: Partial<VisitorData>) => {
    switch (data.type) {
      case "link-new-card":
        // Handle VIP registration logic here
        console.log("link a new card:", data);
        break;
      case "extend-visit":
        // Handle extend logic here
        console.log("Check-In Data:", data);
        break;
      case "check-out":
        // Handle check-out logic here
        checkoutVisitor({ VisitorID: data.ID as string });
        break;
      case "save-new-photo":
        // Handle check-out logic here
        console.log("Check-Out Data:", data);
        break;
      default:
        console.error("Unknown form type");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Visitor Information
          </DialogTitle>
        </DialogHeader>
        <BasicInfromationForm
          isReadOnly
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
        />
      </DialogContent>
    </Dialog>
  );
};
