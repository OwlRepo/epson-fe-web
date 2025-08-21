import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  Title?: string;
  Description?: string;
  isEVS?: boolean;
}

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { open, onOpenChange, onConfirm, Title, Description, isEVS } = props;

  const handleOpenChange = (openState: boolean) => {
    onOpenChange(openState);

    if (!openState) {
      // dialog is closing — clean stuck pointer-events manually if needed
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 200);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {open && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{Title}</AlertDialogTitle>
            <AlertDialogDescription>{Description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => onOpenChange(false)}
              className={
                isEVS
                  ? "border-[#980000] text-[#980000] hover:text-[#980000]"
                  : undefined
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className={
                isEVS ? "bg-[#980000] hover:bg-[##980000]/10" : undefined
              }
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
