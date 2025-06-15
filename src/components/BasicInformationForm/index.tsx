import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Popover } from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { DatePickerWithRange } from "../ui/date-range-picker";
import CapturePhoto from "./CapturePhoto";
import usePortStore from "@/store/usePortStore";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { readRFIDData } from "@/utils/rfidReaderCommand";
import { getValidUserID } from "@/utils/env";
import { LinkCardInput } from "../ui/emp-info-dialog";
import { addDays, isBefore, startOfDay } from "date-fns";
import { useGetHostPerson } from "@/hooks/query/useGeHostPersonList";
import { CustomAutoComplete } from "./CustomAutoComplete";
import { useGetGuestTypeList } from "@/hooks/query/useGetGuestTypeList";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { Calendar } from "../ui/calendar";
import { DialogContent, DialogHeader } from "../ui/dialog";

interface BasicInformationFormProps {
  onSubmitData?: (data: any) => void;
  onUpdate?: (data: any) => void;
  type?: "check-in" | "register-vip";
  isReadOnly?: boolean;
  initialData?: VisitorData;
}

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
  CardSurrendered?: boolean;
  type?:
    | "check-in"
    | "extend-visit"
    | "check-out"
    | "link-new-card"
    | "save-new-photo"
    | undefined;
}

const validUserID = getValidUserID();
const daysBeforeExpiration = 3; // days before expiration to show warning

const BasicInfromationForm = ({
  initialData,
  onSubmitData,
  type = "check-in",
  isReadOnly = false,
}: BasicInformationFormProps) => {
  const form = useForm<VisitorData>();
  const {
    register,
    handleSubmit,
    formState,
    setValue,
    watch,
    control,
    reset,
    setError,
  } = form;

  const { infoStyle, errorStyle } = useToastStyleTheme();
  const [isLinking, setIsLinking] = useState(false);
  const { port, setPort } = usePortStore((store) => store);
  const [openExtendDialog, setOpenExtendDialog] = useState(false);

  const { data } = useGetGuestTypeList();

  useEffect(() => {
    setValue("Date", {
      from: new Date(),
      to: addDays(new Date(), 5),
    });
  }, []);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

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

      if (validUserID.includes(data?.userID ?? "")) {
        if (isReadOnly) {
          linkNewCard(data?.epc ?? "");
        } else {
          setValue("UHF", data?.epc ?? "");
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

  const expireSoon =
    dateRange.to &&
    new Date(dateRange.to).getTime() - new Date().getTime() <=
      daysBeforeExpiration * 24 * 60 * 60 * 1000;
  const isExpired =
    dateRange.to &&
    isBefore(startOfDay(new Date(dateRange.to)), startOfDay(new Date()));

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

  return (
    <>
      <div className="grid grid-cols-4 gap-2 grid-rows-[auto_1fr] h-full">
        <CapturePhoto onCapture={handleCapturePhoto} value={watch("Picture")} />

        <div className="bg-white col-span-3 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
          <p className="font-bold flex gap-2 text-[#1a2b4b]">
            Basic Information
          </p>
          <p className="text-sm text-slate-500">
            Registration and Check-in Details
          </p>

          {/* form */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <BasicInfoTextInput
              label={"Full Name"}
              id="name"
              name={"Name"}
              placeholder="ex. John Doe"
              register={register}
              errors={formState.errors}
              readOnly={isReadOnly}
            />

            <CustomAutoComplete
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

            <BasicInfoTextInput
              label={"Contact Information"}
              id="contact-information"
              name={"ContactInformation"}
              placeholder="ex. 09999999999"
              register={register}
              errors={formState.errors}
              required={false}
              readOnly={isReadOnly}
            />

            <BasicInfoTextInput
              label={"Company/Organization"}
              id="company"
              name={"Company"}
              placeholder="value"
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
                          readOnly={isReadOnly}
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

            <BasicInfoTextInput
              label={"Plate Number"}
              id="plate-number"
              name={"PlateNo"}
              placeholder="ex. ABC-1234"
              register={register}
              errors={formState.errors}
              readOnly={isReadOnly}
            />

            <BasicInfoTextInput
              label={"Room Reservation"}
              id="room-reservation"
              name={"Room"}
              placeholder="ex. Room 101"
              register={register}
              errors={formState.errors}
              required={false}
              readOnly={isReadOnly}
            />

            <BasicInfoTextInput
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
              <div className="flex gap-4">
                <LinkCardInput
                  isLinking={isLinking}
                  onLinkCard={handleLinkCard}
                  value={watch("UHF") || ""}
                  {...register("UHF")}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-4 flex gap-2 justify-end">
          {isReadOnly && (
            <>
              <Button
                className="bg-red-600 hover:bg-red-400"
                onClick={handleSubmit((data) =>
                  onSubmitData?.({ ...data, type: "check-out" })
                )}
              >
                Check Out
              </Button>
              <Button
                className="disabled:bg-slate-400"
                onClick={() => setOpenExtendDialog(true)}
              >
                Extend Visit
              </Button>
            </>
          )}
          {!isReadOnly && (
            <>
              <Button
                onClick={() => reset()}
                className="bg-red-600 hover:bg-red-400"
              >
                Clear Data
              </Button>
              <Button
                onClick={handleSubmit((data) => {
                  onSubmitData?.({ ...data, type: "check-in" });
                })}
                className="disabled:bg-slate-400"
              >
                Check In
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
                setValue("Date", { ...dateRange, to: val });
              }}
            />
          </div>
          <Button
            onClick={handleSubmit((data) =>
              onSubmitData?.({ ...data, type: "extend-visit" })
            )}
          >
            Extend Visit
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BasicInfromationForm;

interface BasicInfoTextInputProps {
  label: string;
  id: string;
  name: keyof VisitorData;
  placeholder?: string;
  register: ReturnType<typeof useForm<VisitorData>>["register"];
  errors: ReturnType<typeof useForm<VisitorData>>["formState"]["errors"];
  required?: boolean;
  readOnly?: boolean;
}

const BasicInfoTextInput = ({
  label,
  id,
  name,
  placeholder,
  register,
  errors,
  required = true,
  readOnly = false,
}: BasicInfoTextInputProps) => {
  return (
    <div className="space-y-1 w-full">
      <div className="flex justify-between">
        <label htmlFor={id} className="text-sm  font-normal text-gray-700">
          {label}
        </label>
        {!required && (
          <label htmlFor={id} className="text-sm  font-normal text-gray-700">
            Optional
          </label>
        )}
      </div>
      <Input
        type="text"
        id={id}
        placeholder={placeholder}
        className="h-[44px]"
        {...register(
          name,
          required ? { required: `${label} is required` } : {}
        )}
        readOnly={readOnly}
      />
      {errors[name] && (
        <p className="text-sm text-red-500 w-full">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

const AutoComplete = ({
  name,
  id,
  setValue,
  watch,
  register,
  readOnly = false,
  required = true,
  label,
  errors,
  list,
}: {
  name: keyof VisitorData;
  id: string;
  setValue: ReturnType<typeof useForm<VisitorData>>["setValue"];
  watch: ReturnType<typeof useForm<VisitorData>>["watch"];
  register: ReturnType<typeof useForm<VisitorData>>["register"];
  readOnly?: boolean;
  required?: boolean;
  label: string;
  errors: ReturnType<typeof useForm<VisitorData>>["formState"]["errors"];
  list: { value: string; label: string }[];
}) => {
  const [open, setOpen] = useState(false);
  const value = watch(name, "");
  return (
    <div className="space-y-1">
      <label
        htmlFor="host-person"
        className="text-sm font-normal text-gray-700"
      >
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-[44px] justify-between font-normal",
              value ? null : " text-gray-500"
            )}
            disabled={readOnly}
          >
            {value
              ? list?.find((framework) => framework.value === value)?.label
              : "Select..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command className="w-full">
            <CommandInput
              placeholder="Search person..."
              className="w-full text-slate-400"
            />
            <CommandList className="w-full">
              <CommandEmpty>No person found.</CommandEmpty>
              <CommandGroup>
                {list?.map((framework) => (
                  <CommandItem
                    key={framework.label}
                    value={framework.label}
                    onSelect={() => {
                      setValue(
                        name,
                        framework.value === value ? "" : framework.value
                      );
                      setOpen(false);
                    }}
                  >
                    {framework.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === framework.label ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        <input
          type="hidden"
          id={id}
          {...register(
            name,
            required ? { required: `${label || name} is required` } : {}
          )}
        />
      </Popover>
      {errors?.[name] && (
        <p className="text-sm text-red-500">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};
