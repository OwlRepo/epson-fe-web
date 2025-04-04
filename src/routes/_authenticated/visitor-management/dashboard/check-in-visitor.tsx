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
import { createFileRoute } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Image } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/dashboard/check-in-visitor"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm();
  return (
    <div className="grid grid-cols-4 gap-2 grid-rows-[auto_1fr] h-full">
      <FormProvider {...form}>
        <div className="bg-white p-4 rounded-lg shadow-md self-start">
          <p className="font-bold flex gap-2 text-[#1a2b4b]">Capture Photo</p>
          <p className="text-sm text-slate-500">Snap a visitor's photo</p>
          <div className="flex justify-center items-center rounded-sm border-dashed h-44 border-[#0F416D] border-2 my-2">
            <Image className="text-[#0F416D]" />
          </div>
          <Button className="w-full">Activate Webcam</Button>
        </div>

        <div className="bg-white col-span-3 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
          <p className="font-bold flex gap-2 text-[#1a2b4b]">
            Basic Information
          </p>
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
              />

              <BasicInfoTextInput
                label={"Contact Information"}
                id="contact-information"
                name={"contactInformation"}
                placeholder="value"
              />

              <BasicInfoTextInput
                label={" Company/Organization"}
                id="company"
                name={"company"}
                placeholder="value"
              />
              <BasicInfoTextInput
                label={" Company/Organization"}
                id="company"
                name={"company"}
                placeholder="value"
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
                <AutoComplete name={"hostPerson"} id="host-person" />
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
                  // className="h-[82%]"
                />
              </div>
            </div>

            {/* divider */}
          </div>
          <div className="border-t w-full my-2  border-[#1a2b4b]"></div>

          {/* rfid section */}
          <div>
            <p className="font-bold flex gap-2 text-[#1a2b4b]">
              Assign RFID Card
            </p>
            <p className="text-sm text-slate-500">
              Link an RFID card as a visitor pass.
            </p>

            <div className="">
              <div className="space-y-1">
                <label
                  htmlFor="rfid"
                  className="text-sm font-medium text-gray-700"
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
                  />
                  <Button className="h-[44px]">Activate RFID Reader</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-4 flex  gap-2 justify-end">
          <Button className="bg-red-600 hover:bg-red-400">Clear</Button>
          <Button
            onClick={form.handleSubmit((data) => console.log(data))}
            className="disabled:bg-slate-400"
          >
            Check In
          </Button>
        </div>
      </FormProvider>
    </div>
  );
}

interface BasicInfoTextInputProps {
  label: string;
  id: string;
  name: string;
  placeholder?: string;
}

const BasicInfoTextInput = ({
  label,
  id,
  name,
  placeholder,
}: BasicInfoTextInputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

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

const AutoComplete = ({ name, id }: { name: string; id: string }) => {
  const [open, setOpen] = useState(false);
  const { register, setValue, watch } = useFormContext();
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
