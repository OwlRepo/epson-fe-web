import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";

export interface DeviceLogsDialogProps extends DialogProps {
  deviceName?: string;
}

const DeviceLogsDialog = ({ open, onOpenChange }: DeviceLogsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Logs
          </DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceLogsDialog;
