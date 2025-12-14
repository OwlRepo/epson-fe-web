"use client";

import { addDays, format, isSameDay } from "date-fns";
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
  from: Date | string; // Start date of the range (can be Date or ISO string)
  to?: Date | string; // Optional end date of the range (can be Date or ISO string)
}
interface DatePickerWithRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  onSelect?: (date: DateRange | undefined) => void;
  value?: Range | undefined;
  readOnly?: boolean;
  isWarning?: boolean;
  isError?: boolean;
}

// Helper to convert string or Date to Date object
const toDate = (d: Date | string | undefined): Date | undefined => {
  if (!d) return undefined;
  if (d instanceof Date) return d;
  return new Date(d);
};

// Helper to normalize a range to DateRange with actual Date objects
const normalizeRange = (range: Range | undefined): DateRange | undefined => {
  if (!range) return undefined;
  return {
    from: toDate(range.from),
    to: toDate(range.to),
  };
};

// Helper function to compare two dates (handles strings and Date objects)
const areDatesEqual = (
  a: Date | string | undefined,
  b: Date | string | undefined
): boolean => {
  const dateA = toDate(a);
  const dateB = toDate(b);
  if (!dateA && !dateB) return true;
  if (!dateA || !dateB) return false;
  return isSameDay(dateA, dateB);
};

export function DatePickerWithRange({
  className,
  onSelect,
  value,
  readOnly,
  isError = false,
  isWarning = false,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);

  // Normalize value to DateRange with actual Date objects
  const normalizedValue = React.useMemo(() => normalizeRange(value), [value]);

  const [date, setDate] = React.useState<DateRange | undefined>(() => ({
    from: toDate(value?.from) || new Date(),
    to: toDate(value?.to) || addDays(new Date(), 20),
  }));

  const handleSelect = (selectedDate: DateRange | undefined) => {
    // Check if the date actually changed to prevent infinite loops
    const fromChanged = !areDatesEqual(date?.from, selectedDate?.from);
    const toChanged = !areDatesEqual(date?.to, selectedDate?.to);

    // No actual change, skip entirely
    if (!fromChanged && !toChanged) {
      return;
    }

    // Update internal state
    setDate(selectedDate);

    // Only notify parent when there's a meaningful change
    if (onSelect) {
      onSelect(selectedDate);
    }

    // Close popover only when range is complete
    if (selectedDate?.from && selectedDate?.to) {
      setOpen(false);
    }
  };

  // Track previous value to detect actual external changes
  const prevValueRef = React.useRef(value);

  // Sync with external value changes
  React.useEffect(() => {
    const prevValue = prevValueRef.current;
    const fromChanged = !areDatesEqual(prevValue?.from, value?.from);
    const toChanged = !areDatesEqual(prevValue?.to, value?.to);

    if (fromChanged || toChanged) {
      setDate(normalizedValue);
    }
    prevValueRef.current = value;
  }, [normalizedValue, value]);

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
