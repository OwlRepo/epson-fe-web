import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import { Check, ChevronsUpDown, Command } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import CapturePhoto from "./CapturePhoto";
import RFIDSection from "./RFIDSection";

interface BasicInformationFormProps {
  onCheckIn?: (data: any) => void;
  form: ReturnType<typeof useForm>;
}

const BasicInfromationForm = ({
  form,
  onCheckIn,
}: BasicInformationFormProps) => {
  //   const form = useForm();
  const { register, handleSubmit, formState, setValue, watch } = form;

  return (
    <div className="grid grid-cols-4 gap-2 grid-rows-[auto_1fr] h-full">
      <CapturePhoto />

      <div className="bg-white col-span-3 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
        <p className="font-bold flex gap-2 text-[#1a2b4b]">Basic Information</p>
        <p className="text-sm text-slate-500">
          Registration and Check-in Details
        </p>

        {/* form */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="grid gap-2">
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
          </div>

          <div className="grid grid-rows-3 gap-2">
            <div className="space-y-1">
              <label
                htmlFor="host-person"
                className="text-sm font-medium text-gray-700"
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

            <div className="space-y-1 row-span-2">
              <label
                htmlFor="purpose"
                className="text-sm font-medium text-gray-700"
              >
                Purpose
              </label>
              <Textarea
                id="purpose"
                placeholder="value"
                {...register("purpose")}
              />
            </div>
          </div>
        </div>
        <div className="border-t w-full my-2 border-[#1a2b4b]"></div>

        {/* rfid section */}
        <RFIDSection register={register} />
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
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
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
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
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
          className="w-full h-[44px] justify-between"
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
          <CommandInput placeholder="Search person..." className="w-full" />
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
