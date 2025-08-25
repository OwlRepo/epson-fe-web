import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";

export const AutoComplete = ({
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
  name: any;
  id: string;
  setValue: any;
  watch: any;
  register: any;
  readOnly?: boolean;
  required?: boolean;
  label: string;
  errors: any;
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
          <span className="truncate block max-w-[calc(100%-24px)] text-left">
            {value
              ? list?.find((framework) => framework.value === value)?.label
              : "Select..."}
           </span>
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
                        framework.value === value ? "" : framework.value,
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        }
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
