import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DatePickerWithRange } from "../ui/date-range-picker";
import CapturePhoto from "./CapturePhoto";
import usePortStore from "@/store/usePortStore";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { readRFIDData } from "@/utils/rfidReaderCommand";
import { getUHFLength } from "@/utils/env";
import { addDays } from "date-fns";
import { useGetHostPerson } from "@/hooks/query/useGeHostPersonList";

import { useGetGuestTypeList } from "@/hooks/query/useGetGuestTypeList";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { Calendar } from "../ui/calendar";
import { DialogContent, DialogHeader } from "../ui/dialog";
import { AutoComplete } from "../inputs/AutoComplete";
import TextInput from "../inputs/TextInput";
import { AsyncAutoComplete } from "../inputs/AsyncAutoComplete";
import { LinkCardInput } from "../inputs/LinkCardInput";
import { visitationDateChecker } from "@/utils/visitationDateChecker";
import { faker } from "@faker-js/faker";
import { ConfirmationDialog } from "../dialogs/ConfirmationDialog";

interface BasicInformationFormProps {
  onUnlinkSubmit?: () => void;
  onSubmitData?: (data: any) => void;
  onUpdate?: (data: any) => void;
  type?: "check-in" | "register-vip";
  isReadOnly?: boolean;
  isDialog?: boolean;
  initialData?: VisitorData;
  isPending?: boolean;
  isSuccess?: boolean;
}

// const mockVisitorData: VisitorData = [
//   {
//     ID: "V123456789",
//     Name: "John Doe",
//     HostPerson: "Jane Smith",
//     ContactInformation: "+1-555-123-4567",
//     Company: "Acme Corp",
//     Purpose: "Business Meeting",
//     Picture: "https://example.com/photos/johndoe.jpg",
//     UHF: "UHF-ABCD1234",
//     Date: new Date(),
//     DateFrom: "2025-08-08T09:00:00Z",
//     DateTo: "2025-08-08T17:00:00Z",
//     Room: "Conference Room B",
//     PlateNo: "XYZ-1234",
//     Beverage: "Coffee",
//     GuestType: {
//       id: "guest-type-001",
//       name: "Business Visitor",
//     },
//     Status: "checked-in",
//     CardSurrendered: true,
//     type: "check-in",
//   },
// ];

export interface VisitorData {
  ID?: string;
  Name: string;
  HostPerson: string;
  ContactInformation?: string;
  Company: string;
  Purpose: string;
  Picture: string;
  UHF: string;
  Date: any;
  DateFrom: string;
  DateTo: string;
  Room: string;
  PlateNo: string;
  Beverage?: string;
  GuestType?: {
    id: string;
    name: string;
  };
  CardStatus?: string;
  Status?: string;
  CardSurrendered?: boolean;
  type?:
    | "check-in"
    | "extend-visit"
    | "check-out"
    | "link-new-card"
    | "save-new-photo"
    | "update-data"
    | undefined;
}

//env configs
const companyNamePlaceholder = faker.company.name();
const UHFLength = getUHFLength();

const BasicInfromationForm = forwardRef(
  (
    {
      isDialog,
      onUnlinkSubmit,
      initialData,
      onSubmitData,
      type = "check-in",
      isReadOnly = false,
      isPending = false,
    }: BasicInformationFormProps,
    ref
  ) => {
    const form = useForm<VisitorData>();
    const {
      register,
      handleSubmit,
      formState,
      setValue,
      watch,
      control,
      reset,
      trigger,
      setError,
    } = form;

    const { infoStyle, errorStyle, successStyle } = useToastStyleTheme();
    const [isLinking, setIsLinking] = useState(false);
    const { port, setPort } = usePortStore((store) => store);
    const [openExtendDialog, setOpenExtendDialog] = useState(false);

    const { data } = useGetGuestTypeList();

    useEffect(() => {
      reset({
        Date: {
          from: new Date(),
          to: addDays(new Date(), 5),
        },
        Purpose: initialData?.Purpose ?? "",
        ...initialData,
      });
      trigger(["Date"]);
    }, [initialData, reset]);

    // expose reset method to parent
    useImperativeHandle(ref, () => ({
      resetForm: () => {
        console.log("reset form");
        reset(
          {
            Date: {
              from: new Date(),
              to: addDays(new Date(), 5),
            },
            ...initialData,
          },
          {}
        );
      },
    }));

    const handleLinkCard = async () => {
      try {
        let portToUse = port;

        if (!portToUse) {
          const newPort = await navigator.serial.requestPort();
          await newPort.open({ baudRate: 57600 });
          setPort(newPort);
          portToUse = newPort;
        }

        await linkCard(portToUse);
      } catch (error) {
        console.error("Failed to link card:", error);
      }
    };

    const linkCard = async (newPort: any) => {
      if (!newPort) return;
      toast.info("Almost here - Tap your card", {
        description: "Please tap your card on the reader.",
        style: infoStyle,
      });
      try {
        setIsLinking(true);
        const data = await readRFIDData(newPort);

        if (UHFLength === data?.epc?.length) {
          if (isReadOnly) {
            linkNewCard(data?.epc ?? "");
          } else {
            setValue("UHF", data?.epc ?? "", {
              shouldValidate: true,
              shouldDirty: true,
            });

            toast.success("RFID card was read successfully.", {
              description: "Please tap your card on the reader.",
              style: successStyle,
            });
          }
        } else {
          toast.error("Oops! Card is not valid", {
            description: "Please make sure your card is valid and try again.",
            className: "bg-red-50 border-red-200 text-black",
            style: errorStyle,
          });
        }
      } catch (error) {
        console.error("Error reading RFID data:", error);
      } finally {
        setIsLinking(false);
      }
    };

    const linkNewCard = (epc?: string) => {
      onSubmitData?.({
        UHF: epc ?? "",
        type: "link-new-card",
      });
    };

    //date range validation
    const dateRange = watch("Date") || {};

    const { expireSoon, isExpired } = visitationDateChecker(dateRange.to);

    useEffect(() => {
      const isVIP = type === "register-vip";
      if (expireSoon && isVIP) {
        setError("Date", {
          type: "manual",
          message: "Just a reminder — access will expire soon.",
        });
      }

      if (isExpired && isVIP) {
        setError("Date", {
          type: "manual",
          message: "Looks like this VIP’s access has expired.",
        });
      }
    }, [expireSoon, isExpired, type, dateRange]);

    //handle capture photo
    const handleCapturePhoto = (data: string) => {
      if (isReadOnly) {
        onSubmitData?.({
          Picture: data,
          type: "save-new-photo",
        });
      } else {
        setValue("Picture", data);
      }
    };

    //confirmation dialog for surrendering card
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

    const handleCardSurrender = () => {
      handleSubmit((data) => onSubmitData?.({ ...data, type: "check-out" }))();
      setOpenConfirmationDialog(false);
    };

    return (
      <>
        <div className="grid grid-cols-4 gap-2 grid-rows-[auto_1fr] h-full">
          <CapturePhoto
            onCapture={handleCapturePhoto}
            value={watch("Picture")}
          />

          <div className="bg-white col-span-3 p-4 rounded-lg shadow-md overflow-auto flex flex-col">
            <p className="font-bold flex gap-2 text-[#1a2b4b]">
              Basic Information
            </p>
            <p className="text-sm text-slate-500">
              Registration and Check-in Details
            </p>

            {/* form */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <TextInput
                label={"Full Name"}
                id="name"
                name={"Name"}
                placeholder="ex. John Doe"
                register={register}
                errors={formState.errors}
                readOnly={isReadOnly}
              />

              <AsyncAutoComplete
                label="Host Person"
                name={"HostPerson"}
                id="host-person"
                setValue={setValue}
                watch={watch}
                register={register}
                readOnly={isReadOnly}
                errors={formState?.errors}
                queryHook={useGetHostPerson}
              />

              <TextInput
                label={"Contact Information"}
                id="contact-information"
                name={"ContactInformation"}
                placeholder="ex. 09999999999"
                register={register}
                errors={formState.errors}
                required={false}
                readOnly={isReadOnly}
              />

              <TextInput
                label={"Company/Organization"}
                id="company"
                name={"Company"}
                placeholder={`ex. ${companyNamePlaceholder}`}
                register={register}
                errors={formState.errors}
                readOnly={isReadOnly}
              />

              {type === "register-vip" && (
                <>
                  <AutoComplete
                    label="Employee Type"
                    name={"GuestType"}
                    id="employee-type"
                    setValue={setValue}
                    watch={watch}
                    register={register}
                    readOnly={isReadOnly}
                    errors={formState?.errors}
                    list={data}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="host-person"
                      className={cn("text-sm font-normal text-gray-700", {
                        "text-[#A8A830]": formState.errors.Date?.message
                          ?.toString()
                          .includes("soon"),
                        "text-red-500": formState.errors.Date?.message
                          ?.toString()
                          .includes("expired"),
                      })}
                    >
                      Schedule Of Visit
                    </label>
                    <Controller
                      name="Date"
                      control={control}
                      rules={{
                        required: {
                          value: true,
                          message: "Date range is required",
                        },
                        validate: (value) =>
                          value?.from && value?.to
                            ? true
                            : "Both start and end dates are required",
                      }}
                      render={({ field, fieldState }) => (
                        <div>
                          <DatePickerWithRange
                            value={field.value}
                            onSelect={field.onChange}
                            className="w-full h-[44px] border-red-600"
                            readOnly={isDialog}
                            isError={fieldState.error?.message?.includes(
                              "expired"
                            )}
                            isWarning={fieldState.error?.message?.includes(
                              "soon"
                            )}
                          />
                          {fieldState.error &&
                            fieldState.error.message?.includes("soon") && (
                              <p className="text-sm text-[#A8A830] flex items-center gap-1">
                                {fieldState.error.message}
                              </p>
                            )}
                          {fieldState.error &&
                            fieldState.error.message?.includes("expired") && (
                              <p className="text-sm text-red-500">
                                {fieldState.error.message}
                              </p>
                            )}
                        </div>
                      )}
                    />
                  </div>
                </>
              )}

              <TextInput
                label={"Plate Number"}
                id="plate-number"
                name={"PlateNo"}
                placeholder="ex. ABC-1234"
                register={register}
                errors={formState.errors}
                readOnly={isReadOnly}
                required={false}
              />

              <TextInput
                label={"Room Reservation"}
                id="room-reservation"
                name={"Room"}
                placeholder="ex. Room 101"
                register={register}
                errors={formState.errors}
                required={false}
                readOnly={isReadOnly}
              />

              <TextInput
                label={"Beverage Request"}
                id="beverage-request"
                name={"Beverage"}
                placeholder="ex. Coffee, Tea"
                register={register}
                errors={formState.errors}
                required={false}
                readOnly={isReadOnly}
              />

              <div className="space-y-1 col-span-2 flex-1">
                <label
                  htmlFor="purpose"
                  className="text-sm font-normal text-gray-700"
                >
                  Purpose
                </label>
                <Textarea
                  className={
                    isReadOnly ? "cursor-not-allowed text-gray-500" : ""
                  }
                  id="purpose"
                  placeholder="ex. Business Meeting, Conference"
                  {...register("Purpose")}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            <div className="border-t w-full my-2 border-[#1a2b4b]"></div>

            {/* rfid section */}
            <div>
              <p className="font-bold flex gap-2 text-[#1a2b4b]">
                Assign RFID Card
              </p>
              <p className="text-sm text-slate-500">
                Link an RFID card as a visitor pass.
              </p>

              <div className="space-y-1">
                <div className="flex gap-4 mb-4">
                  <LinkCardInput
                    isLinking={isLinking}
                    onLinkCard={handleLinkCard}
                    onUnlinkCard={() => {
                      setValue("UHF", "", {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      onUnlinkSubmit?.();
                    }}
                    onStopReading={() => setIsLinking(false)}
                    value={watch("UHF") || ""}
                    errors={formState.errors}
                    {...register("UHF", {
                      required:
                        type === "check-in" ? "UHF is required" : undefined,
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4 flex gap-4 justify-end mt-4">
            {isDialog && (
              <>
                <Button
                  className="bg-red-600 hover:bg-red-400"
                  onClick={() => setOpenConfirmationDialog(true)}
                >
                  Card Surrender
                </Button>
                <Button
                  className="disabled:bg-slate-400"
                  onClick={() => setOpenExtendDialog(true)}
                >
                  Extend Visit
                </Button>

                <Button
                  disabled={!formState.isDirty}
                  className="disabled:bg-slate-400"
                  onClick={handleSubmit((data) =>
                    onSubmitData?.({ ...data, type: "update-data" })
                  )}
                >
                  Save Changes
                </Button>
              </>
            )}
            {!isDialog && (
              <>
                <Button
                  onClick={() => reset()}
                  className="bg-red-600 hover:bg-red-400"
                >
                  Clear Data
                </Button>
                <Button
                  disabled={!formState.isValid || isPending}
                  onClick={handleSubmit((data) => {
                    onSubmitData?.({ ...data, type: "check-in" });
                  })}
                  className="disabled:bg-slate-400"
                >
                  {type === "check-in" ? "Check In" : "Register"}
                </Button>
              </>
            )}
          </div>
        </div>
        <Dialog open={openExtendDialog} onOpenChange={setOpenExtendDialog}>
          <DialogContent className="w-auto">
            <DialogHeader className="flex flex-row justify-between items-center mb-6">
              <DialogTitle className="text-xl font-semibold text-gray-800">
                Extend To
              </DialogTitle>
            </DialogHeader>
            <div className="bg-white p-4 rounded-lg shadow-lg border">
              <Calendar
                mode="single"
                selected={new Date(dateRange.to)}
                className="w-full"
                defaultMonth={new Date(dateRange.to) ?? new Date()}
                onSelect={(val: any) => {
                  setValue(
                    "Date",
                    { ...dateRange, to: val },
                    { shouldValidate: true, shouldDirty: true }
                  );
                }}
              />
            </div>
            <Button onClick={() => setOpenExtendDialog(false)}>
              Extend Visit
            </Button>
          </DialogContent>
        </Dialog>
        <ConfirmationDialog
          onConfirm={handleCardSurrender}
          onOpenChange={setOpenConfirmationDialog}
          open={openConfirmationDialog}
          Title="Card Surrender"
          Description="Are you sure you want to surrender this card? This action cannot be undone."
        />
      </>
    );
  }
);

export default BasicInfromationForm;
