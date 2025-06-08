import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce"; // or define inline
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import type { useForm } from "react-hook-form";
import type { VisitorData } from ".";

type Option = {
  label: string;
  value: string;
};

type AutoCompleteProps = {
  name: keyof VisitorData;
  id: string;
  label: string;
  readOnly?: boolean;
  required?: boolean;
  setValue: ReturnType<typeof useForm<VisitorData>>["setValue"];
  watch: ReturnType<typeof useForm<VisitorData>>["watch"];
  register: ReturnType<typeof useForm<VisitorData>>["register"];
  errors: ReturnType<typeof useForm<VisitorData>>["formState"]["errors"];
  queryHook: (search: string) => {
    data: Option[] | undefined;
    isLoading: boolean;
  };
};

export const CustomAutoComplete = ({
  name,
  id,
  setValue,
  watch,
  register,
  readOnly = false,
  required = true,
  label,
  errors,
  queryHook,
}: AutoCompleteProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [debouncedInput] = useDebounce(input, 300);

  const { data = [], isLoading } = queryHook(debouncedInput);
  const value = watch(name, "");

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-normal text-gray-700">
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
              value ? "" : "text-gray-500"
            )}
            disabled={readOnly}
          >
            {value
              ? data.find((item) => item.value === value)?.label
              : "Select..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command>
            <CommandInput
              placeholder="Search..."
              value={input}
              onValueChange={setInput}
              className="w-full"
            />
            <CommandList>
              {isLoading ? (
                <div className="p-2 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : data.length === 0 ? (
                <CommandEmpty>No result found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {data?.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={(val) => {
                        setValue(name, val === value ? "" : val);
                        setOpen(false);
                      }}
                    >
                      {item.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
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
