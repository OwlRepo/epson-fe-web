import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export interface EvacueeInfoDialogProps extends DialogProps {
  evacuee?: any;
}
const EvacueeInfoDialog = ({ onOpenChange, open }: EvacueeInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Evacuee Information
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm">Card ID: 000000481</p>
          <div className="flex items-center gap-4 mt-4">
            <h1 className="text-3xl font-bold text-[#980000]">Etan Blake</h1>{" "}
            <Badge className="rounded-full bg-green-500" variant="default">
              SAFE
            </Badge>
          </div>
          <p className="text-sm">Research & Development</p>

          <div>
            <p className="text-lg font-semibold mt-4 text-[#980000]">Status:</p>
            <p className="text-sm">Kindly confirm the status of the evacuee</p>
          </div>

          <div className="flex items-center mt-4 gap-4">
            <Switch
              className={cn(
                "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              )}
            />
            <p className="text-sm"> Evacuee is Safe</p>
          </div>

          <div className="space-y-1 col-span-2 flex-1 mt-4">
            <label
              htmlFor="purpose"
              className="text-sm font-normal text-gray-700"
            >
              Remarks
            </label>
            <Textarea id="Remarks" />
          </div>

          <div className="flex justify-end mt-4">
            <Button>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvacueeInfoDialog;
