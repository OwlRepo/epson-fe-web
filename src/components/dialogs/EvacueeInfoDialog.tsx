import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";

import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";

export interface EvacueeInfoDialogProps extends DialogProps {
  evacuee?: any;
}
const EvacueeInfoDialog = ({
  onOpenChange,
  open,
  evacuee,
}: EvacueeInfoDialogProps) => {
  const { control, register, formState, reset } = useForm();

  useEffect(() => {
    return () => {
      // Cleanup if necessary
      reset();
    };
  }, []);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Evacuee Information
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm">{`Card ID: ${evacuee?.epc}`}</p>
          <div className="flex items-center gap-4 mt-4">
            <h1 className="text-3xl font-bold text-[#980000]">
              {evacuee?.name}
            </h1>
            {evacuee?.eva_status || "Unknown"}
          </div>
          <p className="text-sm">{evacuee?.section}</p>

          <div>
            <p className="text-lg font-semibold mt-4 text-[#980000]">Status:</p>
            <p className="text-sm">Kindly confirm the status of the evacuee</p>
          </div>

          {/* Controlled Switch */}
          <div className="flex items-center mt-4 gap-4">
            <Controller
              control={control}
              name="isSafe"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={cn(
                    "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                  )}
                />
              )}
            />
            <p className="text-sm">Evacuee is Safe</p>
          </div>

          {/* Remarks */}
          <div className="space-y-1 col-span-2 flex-1 mt-4">
            <label
              htmlFor="remarks"
              className="text-sm font-normal text-gray-700"
            >
              Remarks
            </label>
            <Textarea id="remarks" {...register("remarks")} />
          </div>

          <div className="flex justify-end mt-4">
            <Button disabled={!formState.isDirty}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EvacueeInfoDialog;
