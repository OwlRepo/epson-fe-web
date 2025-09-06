"use client";

import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Range {
  from: Date; // Start date of the range
  to?: Date; // Optional end date of the range
}
interface DatePickerWithRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  onSelect?: (date: DateRange | undefined) => void;
  value?: Range | undefined;
  readOnly?: boolean;
  isWarning?: boolean;
  isError?: boolean;
}

export function DatePickerWithRange({
  className,
  onSelect,
  value,
  readOnly,
  isError = false,
  isWarning = false,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: value?.from || new Date(),
    to: value?.to || addDays(new Date(), 20),
  });

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    if (onSelect) {
      onSelect(selectedDate);
    }
    if (selectedDate?.from && selectedDate?.to) {
      setOpen(false);
    }
  };

  React.useEffect(() => {
    setDate(value);
  }, [value]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[full] h-[44px] justify-start text-left font-normal border-2",
              isError &&
                "disabled:border-red-500 text-red-500 disabled:opacity-100 disabled:pointer-events-auto disabled:font-bold ",
              isWarning &&
                "disabled:border-[#A8A830] text-[#A8A830] disabled:opacity-100 disabled:pointer-events-auto disabled:font-bold ",
              !date && "text-muted-foreground"
            )}
            disabled={readOnly}
          >
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
