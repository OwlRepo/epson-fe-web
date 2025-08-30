import type { DialogProps } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import TextInput from "../inputs/TextInput";
import { Controller, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import DeviceLogsDialog from "./DeviceLogsDialog";

export interface Device {
  id: string;
  name: string;
  description: string;
  status: string; // "Active" | "Inactive"
  floor: string;
  area: string;
  xaxis: string;
  yaxis: string;
  controllertype: string;
  archive: number;
}

export interface DeviceInfoDialogProps extends DialogProps {
  deviceInfo?: Device;
  deviceIds?: string[];
  deviceList?: any[];
  emitData: (event: string, data: any) => void;
}

const inOut = [
  { label: "In", value: "In" },
  { label: "Out", value: "Out" },
];

const homeSafe = [
  { label: "Home", value: "Home" },
  { label: "Safe", value: "Safe" },
];

const DeviceInfoDialog = ({
  open,
  onOpenChange,
  deviceInfo,
  deviceIds,
  deviceList,
  emitData,
}: DeviceInfoDialogProps) => {
  const [openLogs, setOpenLogs] = useState(false);
  const { control, register, reset, setValue, handleSubmit, formState, watch } =
    useForm<Device>({
      defaultValues: {
        id: deviceInfo?.id ?? "",
        name: deviceInfo?.name ?? "",
        description: deviceInfo?.description ?? "",
        status: deviceInfo?.status ?? "Inactive",
        floor: deviceInfo?.floor ?? "",
        area: deviceInfo?.area ?? "",
        xaxis: deviceInfo?.xaxis ?? "",
        yaxis: deviceInfo?.yaxis ?? "",
        controllertype: deviceInfo?.controllertype ?? "",
        archive: deviceInfo?.archive ?? 0,
      },
    });

  useEffect(() => {
    if (deviceInfo) {
      reset({
        id: deviceInfo.id ?? "",
        name: deviceInfo.name ?? "",
        description: deviceInfo.description ?? "",
        status: deviceInfo.status ?? "Inactive",
        floor: deviceInfo.floor ?? "",
        area: deviceInfo.area ?? "",
        xaxis: deviceInfo.xaxis ?? "",
        yaxis: deviceInfo.yaxis ?? "",
        controllertype: deviceInfo.controllertype ?? "",
        archive: deviceInfo.archive ?? 0,
      });
    }
  }, [deviceInfo, reset]);

  const id = watch("id");
  const controllertype = watch("controllertype");

  useEffect(() => {
    if (id) {
      const deviceDetails = deviceList?.filter((item) => item?.id === id)[0];
      console.log(deviceDetails);
      setValue(
        "controllertype",
        deviceDetails?.controllertype ?? "ELID Controller"
      );
      setValue("status", deviceDetails?.status);
    }
  }, [id]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] p-8 bg-white rounded-lg shadow-xl">
          <DialogHeader className="flex flex-row justify-between items-center mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              {deviceInfo ? "Device Info" : "Register Device"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4">
            {/* LEFT SIDE */}
            <div className="w-full flex flex-col gap-4">
              {/* Device ID */}
              <div className="space-y-1 w-full">
                <label
                  htmlFor="id"
                  className="text-sm font-normal text-gray-700"
                >
                  Device ID
                </label>
                <Controller
                  name="id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={Boolean(deviceInfo)}
                    >
                      <SelectTrigger className="w-full h-[44px]">
                        <SelectValue placeholder="Select a Device ID">
                          {id} {/* force only the ID in trigger */}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Device IDs</SelectLabel>
                          {deviceIds?.map((item: any, i) => (
                            <SelectItem value={item?.id} key={i}>
                              {/* Dropdown display */}
                              <div className="flex justify-between w-full">
                                <p>{item?.id}</p>
                                <p>{item?.controllertype}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <TextInput
                readOnly={Boolean(deviceInfo)}
                label="Device Type"
                id="controllertype"
                name="controllertype"
                register={register}
                errors={formState.errors}
              />

              <TextInput
                label="Device Name"
                id="name"
                name="name"
                register={register}
                errors={formState.errors}
              />

              {/* Controller Type */}
              <div className="space-y-1 w-full">
                <label
                  htmlFor="controllertype"
                  className="text-sm font-normal text-gray-700"
                >
                  Controller Type
                </label>

                <Controller
                  name="controllertype"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field?.value ?? ""}
                    >
                      <SelectTrigger className="w-full h-[44px]">
                        <SelectValue placeholder="Select Controller Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {deviceInfo?.controllertype === "EVS" ||
                          controllertype === "EVS" ||
                          controllertype === "Chainway" ||
                          deviceInfo?.controllertype === "Chainway"
                            ? homeSafe.map((item, i) => (
                                <SelectItem value={item.value} key={i}>
                                  {item.label}
                                </SelectItem>
                              ))
                            : inOut.map((item, i) => (
                                <SelectItem value={item.value} key={i}>
                                  {item.label}
                                </SelectItem>
                              ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full">
              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="text-sm font-normal text-gray-700"
                >
                  Status
                </label>
                <div className="flex mt-4 gap-4 items-center">
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Switch
                        checked={field.value === "Active"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? "Active" : "In Active")
                        }
                        className={cn(
                          "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                        )}
                      />
                    )}
                  />
                  <p className="text-sm">Active Device</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 mt-4">
                <label
                  htmlFor="description"
                  className="text-sm font-normal text-gray-700"
                >
                  Description
                </label>
                <Textarea id="description" {...register("description")} />
              </div>
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          {deviceInfo ? (
            <div className="flex justify-between mt-6">
              <Button
                onClick={() => setOpenLogs(true)}
                variant="outline"
                className="border-primary text-primary hover:text-primary"
              >
                View Device Logs
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:text-primary"
                >
                  Re-locate
                </Button>
                <Button
                  disabled={!formState.isDirty}
                  onClick={handleSubmit((data) =>
                    emitData("device_update", data)
                  )}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end mt-6">
              <div className="flex gap-2">
                <Button disabled={!formState.isDirty}>Register</Button>
                <Button
                  disabled={!formState.isDirty}
                  onClick={handleSubmit((data) =>
                    emitData("device_update", data)
                  )}
                >
                  Register and Set Location
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <DeviceLogsDialog open={openLogs} onOpenChange={setOpenLogs} />
    </>
  );
};

export default DeviceInfoDialog;
