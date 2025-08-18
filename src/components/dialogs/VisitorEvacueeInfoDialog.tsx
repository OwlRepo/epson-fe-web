import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import TextInput from "../inputs/TextInput";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useSocket } from "@/hooks";

export interface VisitorEvacueeInfoDialogProps extends DialogProps {
  evacuee?: any;
}
const VisitorEvacueeInfoDialog = ({
  onOpenChange,
  open,
  evacuee,
}: VisitorEvacueeInfoDialogProps) => {
  const {
    emitData,
    data: live_data,
    isLoading,
  } = useSocket<any>({
    room: "get_user",
    dataType: "live",
  });

  const form = useForm({
    defaultValues: {
      ContactInfo: live_data?.[0]?.ContactInformation || "",
      Company: live_data?.[0]?.Company || "",
      GuestType: live_data?.[0]?.GuestType || "",
      HostPerson: live_data?.[0]?.HostPerson || "",
      status: evacuee?.raw_status === "Safe" ? "Safe" : "Injured",
      remarks: evacuee?.remarks || "",
    },
  });
  const { register, formState, reset, watch, control, handleSubmit } = form;

  console.log("Visitor Evacuee Info Dialog", live_data);
  useEffect(() => {
    console.log("emit");

    emitData("get_user", evacuee?.employee_id);
  }, [open, isLoading]);

  const currentStatus = watch("status");

  const onSubmit = (data: any) => {
    console.log("Form submitted:", data, live_data);

    emitData(
      "epc_eva_updates",
      JSON.stringify([live_data?.UHF, data.status, data.remarks, new Date(), 0])
    );

    onOpenChange?.(false);
  };

  useEffect(() => {
    if (live_data) {
      console.log("live_Data received:", live_data);
      reset({
        ContactInfo: live_data?.ContactInformation || "",
        Company: live_data?.Company || "",
        GuestType: live_data?.GuestTypeName || "UNKNOWN",
        HostPerson: live_data?.HostPerson || "",
        status: live_data?.Status === "Safe" ? "Safe" : "Injured",
        remarks: live_data?.Remarks || "",
      });
    }
  }, [live_data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Evacuee Information
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <p className="text-sm">Card ID: 000000481</p>
            <div className="flex items-center gap-4 mt-4">
              <h1 className="text-3xl font-bold text-[#980000]">
                {live_data?.Name}
              </h1>
              <Badge
                className={cn(
                  `rounded-full border`,
                  live_data?.Status === "Missing" &&
                    "border-red-200 border  bg-red-50 text-red-500",
                  live_data?.Status === "Safe" &&
                    "border-green-200 border  bg-green-50 text-green-500",
                  live_data?.Status === "Injured" &&
                    "border-yellow-200 border  bg-yellow-50 text-yellow-500",
                  live_data?.Status === "Home" &&
                    "border-blue-200 border  bg-blue-50 text-blue-500"
                )}
                variant="default"
              >
                {live_data?.Status || "Unknown"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <TextInput
                label="Contact Information"
                id="contact-info"
                name="ContactInfo"
                register={register}
                errors={formState?.errors}
                readOnly={true}
              />
              <TextInput
                label="Company/Organization"
                id="company"
                name="Company"
                register={register}
                errors={formState?.errors}
                readOnly={true}
              />
              <TextInput
                label="Guest Type"
                id="guest-type"
                name="GuestType"
                register={register}
                errors={formState?.errors}
                readOnly={true}
              />
              <TextInput
                label="Host Person"
                id="host-person"
                name="HostPerson"
                register={register}
                errors={formState?.errors}
                readOnly={true}
              />

              <div>
                <div>
                  <p className="text-lg font-semibold mt-4 text-[#980000]">
                    Status:
                  </p>
                  <p className="text-sm">
                    Kindly confirm the status of the evacuee
                  </p>
                </div>
                <div className="flex mt-4 gap-4">
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
              </div>

              <div className="space-y-1 mt-4">
                <label
                  htmlFor="purpose"
                  className="text-sm font-normal text-gray-700"
                >
                  Remarks
                </label>
                <Textarea id="remarks" {...register("remarks")} />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button disabled={!formState.isDirty} type="submit">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorEvacueeInfoDialog;
