import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";

import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { useSocket } from "@/hooks";
import { Badge } from "../ui/badge";

export interface EvacueeInfoDialogProps extends DialogProps {
  evacuee?: any;
}

type FormValues = {
  status: "Safe" | "Injured";
  remarks: string;
};

const EvacueeInfoDialog = ({
  onOpenChange,
  open,
  evacuee,
}: EvacueeInfoDialogProps) => {
  const { emitData } = useSocket({
    room: "epc_eva_updates",
    dataType: "live",
  });

  console.log("Evacuee Info Dialog", evacuee);

  const { control, register, handleSubmit, reset, watch, formState } =
    useForm<FormValues>({
      defaultValues: {
        status: evacuee?.raw_status === "Safe" ? "Safe" : "Injured",
        remarks: evacuee?.remarks || "",
      },
    });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);

    emitData(
      "epc_eva_updates",
      JSON.stringify([evacuee?.epc, data.status, data.remarks, new Date(), 0])
    );

    onOpenChange?.(false);
  };

  useEffect(() => {
    reset({
      status: evacuee?.raw_status === "Safe" ? "Safe" : "Injured",
      remarks: evacuee?.remarks || "",
    });
  }, [evacuee, reset]);

  const currentStatus = watch("status");
  const isHome = evacuee?.raw_status === "Home";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Evacuee Information
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <p className="text-sm">{`Card ID: ${evacuee?.epc}`}</p>
          <div className="flex-col items-center gap-4 mt-4">
            <h1 className="text-3xl font-bold text-[#980000]">
              {evacuee?.name}
            </h1>
            <div className="flex gap-2 py-2">
              <p>Status: </p>
              <Badge
                className={cn(
                  `rounded-full border`,
                  evacuee.raw_status === "Missing" &&
                    "border-red-200 border  bg-red-50 text-red-500",
                  evacuee.raw_status === "Safe" &&
                    "border-green-200 border  bg-green-50 text-green-500",
                  evacuee.raw_status === "Injured" &&
                    "border-yellow-200 border  bg-yellow-50 text-yellow-500",
                  evacuee.raw_status === "Home" &&
                    "border-blue-200 border  bg-blue-50 text-blue-500"
                )}
                variant="default"
              >
                {evacuee.raw_status || "Unknown"}
              </Badge>
            </div>
          </div>
          <p className="text-sm">{evacuee?.section}</p>
          {!isHome && (
            <>
              <div>
                <p className="text-lg font-semibold mt-4 text-[#980000]">
                  Status:
                </p>
                <p className="text-sm">
                  Kindly confirm the status of the evacuee
                </p>
              </div>

              {/* Switch now toggles between Safe and Injured */}

              <div className="flex items-center mt-4 gap-4">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Switch
                      checked={field.value === "Safe"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "Safe" : "Injured")
                      }
                      className={cn(
                        "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      )}
                    />
                  )}
                />
                <p className="text-sm">
                  {currentStatus === "Safe"
                    ? "Evacuee is Safe"
                    : "Evacuee is Injured"}
                </p>
              </div>
            </>
          )}

          {/* Remarks */}
          <div className="space-y-1 col-span-2 flex-1 mt-4">
            <label
              htmlFor="remarks"
              className="text-sm font-normal text-gray-700"
            >
              Remarks
            </label>
            <Textarea disabled={isHome} id="remarks" {...register("remarks")} />
          </div>

          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={!formState.isDirty || isHome}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EvacueeInfoDialog;
