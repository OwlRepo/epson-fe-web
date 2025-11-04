import * as React from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CalendarIcon, Clock, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface TimePickerState {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

interface DateTimePickerProps {
  value?: string;
  onChange: (dateTime: string) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  className,
  disabled,
}: DateTimePickerProps) {
  const DATE_TIME_FORMAT = "YYYY-MM-DD hh:mm:ss A";
  const [timeDialogOpen, setTimeDialogOpen] = React.useState<boolean>(false);
  const [selectedTime, setSelectedTime] = React.useState<TimePickerState>({
    hour: 12,
    minute: 0,
    period: "AM",
  });

  const parseTimeFromDateTime = (dateTime?: string): TimePickerState => {
    const parsed = dateTime ? dayjs(dateTime, DATE_TIME_FORMAT, true) : null;
    if (!parsed || !parsed.isValid()) {
      return { hour: 12, minute: 0, period: "AM" };
    }
    const hours = parsed.hour();
    const minutes = parsed.minute();
    return {
      hour: hours > 12 ? hours - 12 : hours === 0 ? 12 : hours,
      minute: minutes,
      period: hours >= 12 ? "PM" : "AM",
    };
  };

  const formatDateForDisplay = (dateTime?: string) => {
    if (!dateTime) return "";
    const parsed = dayjs(dateTime, DATE_TIME_FORMAT, true);
    if (!parsed.isValid()) return "";
    return parsed.format("MMM D, YYYY");
  };

  const formatTimeForDisplay = (dateTime?: string) => {
    if (!dateTime) return "";
    const parsed = dayjs(dateTime, DATE_TIME_FORMAT, true);
    if (!parsed.isValid()) return "";
    return parsed.format("hh:mm A");
  };

  const ensureDatePart = (input?: string): string => {
    // Default to today if no valid date part exists
    const parsed = input ? dayjs(input, DATE_TIME_FORMAT, true) : null;
    return parsed && parsed.isValid()
      ? parsed.format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
  };

  const ensureTimePart = (input?: string): string => {
    // Default to 12:00:00 AM if no valid time part exists
    const parsed = input ? dayjs(input, DATE_TIME_FORMAT, true) : null;
    return parsed && parsed.isValid()
      ? parsed.format("hh:mm:ss A")
      : "12:00:00 AM";
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const timeStr = ensureTimePart(value); // includes seconds and AM/PM
    const combined = dayjs(`${dateStr} ${timeStr}`, "YYYY-MM-DD hh:mm:ss A");
    onChange(combined.format(DATE_TIME_FORMAT));
  };

  const openTimePicker = () => {
    setSelectedTime(parseTimeFromDateTime(value));
    setTimeDialogOpen(true);
  };

  const handleTimeSelect = () => {
    const timeStr = `${selectedTime.hour
      .toString()
      .padStart(2, "0")}:${selectedTime.minute
      .toString()
      .padStart(2, "0")}:00 ${selectedTime.period}`;

    const dateStr = ensureDatePart(value);
    const combined = dayjs(`${dateStr} ${timeStr}`, "YYYY-MM-DD hh:mm:ss A");
    onChange(combined.format(DATE_TIME_FORMAT));
    setTimeDialogOpen(false);
  };

  return (
    <div className={`py-2 space-y-2 ${className}`}>
      <div className="space-y-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? formatDateForDisplay(value) : "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50">
            <div className="relative z-50 bg-background pointer-events-auto">
              <Calendar
                mode="single"
                selected={
                  value && dayjs(value, DATE_TIME_FORMAT, true).isValid()
                    ? new Date(
                        dayjs(value, DATE_TIME_FORMAT).format("YYYY-MM-DD")
                      )
                    : undefined
                }
                onSelect={handleDateSelect}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={openTimePicker}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTimeForDisplay(value) : "Select time"}
        </Button>
      </div>

      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent className="w-72 rounded-lg p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock /> Set Time
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center gap-4 shadow-md p-4 px-8 rounded-md">
            <div className="text-center">
              <button
                onClick={() =>
                  setSelectedTime((prev) => ({
                    ...prev,
                    hour: prev.hour === 12 ? 1 : prev.hour + 1,
                  }))
                }
                className="text-lg font-semibold"
              >
                <ChevronDown className="rotate-180" />
              </button>
              <div>{selectedTime.hour.toString().padStart(2, "0")}</div>
              <button
                onClick={() =>
                  setSelectedTime((prev) => ({
                    ...prev,
                    hour: prev.hour === 1 ? 12 : prev.hour - 1,
                  }))
                }
                className="text-lg font-semibold"
              >
                <ChevronDown />
              </button>
            </div>
            <div>:</div>
            <div className="text-center">
              <button
                onClick={() =>
                  setSelectedTime((prev) => ({
                    ...prev,
                    minute: prev.minute === 59 ? 0 : prev.minute + 1,
                  }))
                }
                className="text-lg font-semibold"
              >
                <ChevronDown className="rotate-180" />
              </button>
              <div>{selectedTime.minute.toString().padStart(2, "0")}</div>
              <button
                onClick={() =>
                  setSelectedTime((prev) => ({
                    ...prev,
                    minute: prev.minute === 0 ? 59 : prev.minute - 1,
                  }))
                }
                className="text-lg font-semibold"
              >
                <ChevronDown />
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() =>
                  setSelectedTime((prev) => ({
                    ...prev,
                    period: prev.period === "AM" ? "PM" : "AM",
                  }))
                }
                className="text-lg font-semibold"
              >
                <ChevronDown className="rotate-180" />
              </button>
              <div>{selectedTime.period}</div>
              <button
                onClick={() =>
                  setSelectedTime((prev) => ({
                    ...prev,
                    period: prev.period === "AM" ? "PM" : "AM",
                  }))
                }
                className="text-lg font-semibold"
              >
                <ChevronDown />
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleTimeSelect} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
