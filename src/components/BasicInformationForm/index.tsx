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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DatePickerWithRange } from "../ui/date-range-picker";
import CapturePhoto from "./CapturePhoto";

interface BasicInformationFormProps {
  onCheckIn?: (data: any) => void;

  type?: "check-in" | "register-vip";
}

const BasicInfromationForm = ({
  onCheckIn,
  type = "check-in",
}: BasicInformationFormProps) => {
  const form = useForm();
  const { register, handleSubmit, formState, setValue, watch } = form;

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
          <div className="flex flex-col gap-4">
            <BasicInfoTextInput
              label={"Full Name"}
              id="full-name"
              name={"fullName"}
              placeholder="value"
              register={register}
              errors={formState.errors}
            />

            <BasicInfoTextInput
              label={"Contact Information"}
              id="contact-information"
              name={"contactInformation"}
              placeholder="value"
              register={register}
              errors={formState.errors}
            />

            <BasicInfoTextInput
              label={"Company/Organization"}
              id="company"
              name={"company"}
              placeholder="value"
              register={register}
              errors={formState.errors}
            />

            {type === "register-vip" && (
              <div className="space-y-1">
                <label
                  htmlFor="host-person"
                  className="text-sm font-normal text-gray-700"
                >
                  Schedule Of Visit
                </label>
                <DatePickerWithRange
                  className="w-full h-[44px]"
                  id="date"
                  onSelect={(date) => setValue("date", date)}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <label
                htmlFor="host-person"
                className="text-sm font-normal text-gray-700"
              >
                Host Person
              </label>
              <AutoComplete
                name={"hostPerson"}
                id="host-person"
                setValue={setValue}
                watch={watch}
                register={register}
              />
            </div>

            <div className="space-y-1 row-span-2 flex-1">
              <label
                htmlFor="purpose"
                className="text-sm font-normal text-gray-700"
              >
                Purpose
              </label>
              <Textarea
                id="purpose"
                className="h-5/6"
                placeholder="value"
                {...register("purpose")}
              />
            </div>
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
            <label
              htmlFor="rfid"
              className="text-sm  font-normal text-gray-700"
            >
              Rfid Card
            </label>
            <div className="flex gap-4">
              <Input
                disabled
                type="text"
                id="rfid"
                placeholder="value"
                className="h-[44px] disabled:bg-slate-200"
                {...register("rfid")}
              />
              <Button className="h-[44px]">Activate RFID Reader</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-4 flex gap-2 justify-end">
        <Button className="bg-red-600 hover:bg-red-400">Clear</Button>
        <Button
          onClick={handleSubmit((data) => onCheckIn?.(data))}
          className="disabled:bg-slate-400"
        >
          Check In
        </Button>
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
}

const BasicInfoTextInput = ({
  label,
  id,
  name,
  placeholder,
  register,
  errors,
}: BasicInfoTextInputProps) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm  font-normal text-gray-700">
        {label}
      </label>
      <Input
        type="text"
        id={id}
        placeholder={placeholder}
        className="h-[44px]"
        {...register(name)}
      />
      {errors[name] && (
        <p className="text-sm text-red-500">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

const frameworks = [
  {
    value: "john.doe",
    label: "John Doe",
  },
  {
    value: "jane.smith",
    label: "Jane Smith",
  },
  {
    value: "michael.johnson",
    label: "Michael Johnson",
  },
  {
    value: "emily.davis",
    label: "Emily Davis",
  },
  {
    value: "william.brown",
    label: "William Brown",
  },
];

const AutoComplete = ({
  name,
  id,
  setValue,
  watch,
  register,
}: {
  name: string;
  id: string;
  setValue: ReturnType<typeof useForm>["setValue"];
  watch: ReturnType<typeof useForm>["watch"];
  register: ReturnType<typeof useForm>["register"];
}) => {
  const [open, setOpen] = useState(false);
  const value = watch(name, "");
  return (
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
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : "Select person..."}
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
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setValue(name, currentValue === value ? "" : currentValue);
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
      <input type="hidden" id={id} {...register(name)} />
    </Popover>
  );
};
