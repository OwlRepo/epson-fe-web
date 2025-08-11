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
}

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { open, onOpenChange, onConfirm, Title, Description } = props;

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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{Title}</AlertDialogTitle>
          <AlertDialogDescription>{Description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
