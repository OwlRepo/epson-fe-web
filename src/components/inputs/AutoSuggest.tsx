import { useState, useEffect } from "react";
import { Controller, type FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Command, CommandList, CommandItem } from "@/components/ui/command";

type Option = { label: string; value: string };

interface AutoSuggestProps {
  control: any;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  options: Option[];
  label?: string;
  errors: FieldErrors;
}

export function AutoSuggest({
  control,
  name,
  options,
  required = true,
  readOnly = false,
  label,
  errors,
}: AutoSuggestProps) {
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required:
          required === true
            ? `${label || "This field"} is required`
            : required || false,
      }}
      render={({ field }) => {
        useEffect(() => {
          if (field.value) setQuery(field.value);
          else setQuery("");
        }, [field.value]);

        // Filter options safely by label
        const filtered = options.filter((o) =>
          o?.label?.toLowerCase().includes(query.toLowerCase())
        );

        return (
          <div className="space-y-1 w-full">
            <div className="flex justify-between">
              {label && (
                <label
                  htmlFor={name}
                  className="text-sm font-normal text-gray-700"
                >
                  {label}
                </label>
              )}
              {!required && !readOnly && (
                <span className="text-sm font-normal text-gray-500">
                  Optional
                </span>
              )}
            </div>

            <div className="relative w-full">
              <Input
                id={name}
                value={query}
                readOnly={readOnly}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  field.onChange(val); // ✅ save typed value even if not selected
                  setShowList(val.length > 0);
                }}
                onFocus={() => query && setShowList(true)}
                onBlur={() => setTimeout(() => setShowList(false), 100)} // delay to allow click
                className={`w-full h-[44px] `}
              />

              {showList && query && filtered.length > 0 && (
                <Command className="absolute z-10 h-auto w-full mt-1 border rounded-md shadow-md bg-white">
                  <CommandList>
                    {filtered.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        onSelect={() => {
                          // keep typed query as value
                          field.onChange(query);
                          setShowList(false);
                        }}
                      >
                        {opt.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              )}
            </div>

            {errors[name] && (
              <p className="text-sm text-red-500 w-full">
                {errors[name]?.message as string}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
