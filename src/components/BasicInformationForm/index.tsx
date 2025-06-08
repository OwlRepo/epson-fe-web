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
import { addDays } from "date-fns";
import { useGetHostPerson } from "@/hooks/query/useGeHostPersonList";
import { CustomAutoComplete } from "./CustomAutoComplete";
import { useGetGuestTypeList } from "@/hooks/query/useGetGuestTypeList";

interface BasicInformationFormProps {
  onSubmitData?: (data: any) => void;
  onUpdate?: (data: any) => void;
  type?: "check-in" | "register-vip";
  isDialog?: boolean;
}

const validUserID = getValidUserID();

const BasicInfromationForm = ({
  onSubmitData,
  type = "check-in",
  isDialog = false,
}: BasicInformationFormProps) => {
  const form = useForm();
  const { register, handleSubmit, formState, setValue, watch, control, reset } =
    form;

  const { infoStyle, errorStyle } = useToastStyleTheme();
  const [isLinking, setIsLinking] = useState(false);
  const { port, setPort } = usePortStore((store) => store);

  const { data } = useGetGuestTypeList();

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

  useEffect(() => {
    setValue("date", { from: new Date(), to: addDays(new Date(), 30) }); // Reset UHF value on mount
  }, []);

  const linkCard = async (newPort: any) => {
    if (!newPort) return;
    toast.info("Almost here - Tap your card", {
      description: "Please tap your card on the reader.",
      style: infoStyle,
    });
    try {
      console.log("card is linking");
      setIsLinking(true);
      const data = await readRFIDData(newPort);

      if (validUserID.includes(data?.userID ?? "")) {
        setValue("UHF", data?.epc ?? "");
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

  return (
    <div className="grid grid-cols-4 gap-2 grid-rows-[auto_1fr] h-full">
      <CapturePhoto onCapture={(data) => setValue("image", data)} />

      <div className="bg-white col-span-3 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
        <p className="font-bold flex gap-2 text-[#1a2b4b]">Basic Information</p>
        <p className="text-sm text-slate-500">
          Registration and Check-in Details
        </p>

        {/* form */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <BasicInfoTextInput
            label={"Full Name"}
            id="full-name"
            name={"fullName"}
            placeholder="value"
            register={register}
            errors={formState.errors}
            readOnly={isDialog}
          />

          <CustomAutoComplete
            label="Host Person"
            name={"hostPerson"}
            id="host-person"
            setValue={setValue}
            watch={watch}
            register={register}
            readOnly={isDialog}
            errors={formState?.errors}
            queryHook={useGetHostPerson}
          />

          <BasicInfoTextInput
            label={"Contact Information"}
            id="contact-information"
            name={"contactInformation"}
            placeholder="value"
            register={register}
            errors={formState.errors}
            required={false}
            readOnly={isDialog}
          />

          <BasicInfoTextInput
            label={"Company/Organization"}
            id="company"
            name={"company"}
            placeholder="value"
            register={register}
            errors={formState.errors}
            readOnly={isDialog}
          />

          {type === "register-vip" && (
            <AutoComplete
              label="Employee Type"
              name={"employeeType"}
              id="employee-type"
              setValue={setValue}
              watch={watch}
              register={register}
              readOnly={isDialog}
              errors={formState?.errors}
              list={data}
            />
          )}

          <div className="space-y-1">
            <label
              htmlFor="host-person"
              className="text-sm font-normal text-gray-700"
            >
              Schedule Of Visit
            </label>
            <Controller
              name="date"
              control={control}
              rules={{
                required: { value: true, message: "Date range is required" },
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
                    className="w-full h-[44px]"
                    readOnly={isDialog}
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <BasicInfoTextInput
            label={"Plate Number"}
            id="plate-number"
            name={"plateNumber"}
            placeholder="value"
            register={register}
            errors={formState.errors}
            readOnly={isDialog}
          />

          <BasicInfoTextInput
            label={"Room Reservation"}
            id="room-reservation"
            name={"roomReservation"}
            placeholder="value"
            register={register}
            errors={formState.errors}
            required={false}
            readOnly={isDialog}
          />

          <BasicInfoTextInput
            label={"Beverage Request"}
            id="beverage-request"
            name={"beverageRequest"}
            placeholder="value"
            register={register}
            errors={formState.errors}
            required={false}
            readOnly={isDialog}
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
              placeholder="value"
              {...register("purpose")}
              readOnly={isDialog}
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
        {isDialog && (
          <>
            <Button className="bg-red-600 hover:bg-red-400">Check Out</Button>
            <Button className="disabled:bg-slate-400">Extend Visit</Button>
          </>
        )}
        {!isDialog && (
          <>
            <Button onClick={reset} className="bg-red-600 hover:bg-red-400">
              Clear Data
            </Button>
            <Button
              onClick={handleSubmit((data) => onSubmitData?.(data))}
              className="disabled:bg-slate-400"
            >
              Check In
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BasicInfromationForm;

interface BasicInfoTextInputProps {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
  register: ReturnType<typeof useForm>["register"];
  errors: ReturnType<typeof useForm>["formState"]["errors"];
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
  name: string;
  id: string;
  setValue: ReturnType<typeof useForm>["setValue"];
  watch: ReturnType<typeof useForm>["watch"];
  register: ReturnType<typeof useForm>["register"];
  readOnly?: boolean;
  required?: boolean;
  label: string;
  errors: ReturnType<typeof useForm>["formState"]["errors"];
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
              ? list.find((framework) => framework.value === value)?.label
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
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(
                        name,
                        currentValue === value ? "" : currentValue
                      );
                      setOpen(false);
                    }}
                  >
                    {framework.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === framework.value ? "opacity-100" : "opacity-0"
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
