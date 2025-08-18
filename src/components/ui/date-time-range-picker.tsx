import * as React from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import dayjs from "dayjs";

interface TimePickerState {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

interface DateTimeRangePickerProps {
  fromDateTime?: string;
  toDateTime?: string;
  onFromDateTimeChange: (dateTime: string) => void;
  onToDateTimeChange: (dateTime: string) => void;
  className?: string;
}

export function DateTimeRangePicker({
  fromDateTime,
  toDateTime,
  onFromDateTimeChange,
  onToDateTimeChange,
  className,
}: DateTimeRangePickerProps) {
  const [timeDialogOpen, setTimeDialogOpen] = React.useState<boolean>(false);
  const [currentTimeType, setCurrentTimeType] = React.useState<"from" | "to">("from");
  const [selectedTime, setSelectedTime] = React.useState<TimePickerState>({
    hour: 12,
    minute: 0,
    period: "AM",
  });

  // Parse time from datetime string
  const parseTimeFromDateTime = (dateTime: string): TimePickerState => {
    if (!dateTime || !dateTime.includes("T")) {
      return { hour: 12, minute: 0, period: "AM" };
    }

    const timeStr = dateTime.split("T")[1];
    const [hoursStr, minutesStr] = timeStr.split(":");
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    return {
      hour: hours > 12 ? hours - 12 : hours === 0 ? 12 : hours,
      minute: minutes,
      period: hours >= 12 ? "PM" : "AM",
    };
  };

  // Format date for display
  const formatDateForDisplay = (dateTime: string) => {
    if (!dateTime) return "";
    const dateStr = dateTime.split("T")[0];
    return dayjs(dateStr).format("MMM D, YYYY");
  };

  // Format time for display
  const formatTimeForDisplay = (dateTime: string) => {
    if (!dateTime || !dateTime.includes("T")) return "";
    const timeStr = dateTime.split("T")[1];
    return dayjs(`2000-01-01T${timeStr}`).format("hh:mm A");
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined, type: "from" | "to") => {
    if (!date) {
      if (type === "from") {
        onFromDateTimeChange("");
      } else {
        onToDateTimeChange("");
      }
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Get existing time or use default
    const existingDateTime = type === "from" ? fromDateTime : toDateTime;
    let timeStr = "12:00:00";
    
    if (existingDateTime && existingDateTime.includes("T")) {
      timeStr = existingDateTime.split("T")[1];
    }

    const dateTimeStr = `${dateStr}T${timeStr}`;
    
    if (type === "from") {
      onFromDateTimeChange(dateTimeStr);
    } else {
      onToDateTimeChange(dateTimeStr);
    }
  };

  // Handle time picker open
  const handleTimePickerOpen = (type: "from" | "to") => {
    const dateTime = type === "from" ? fromDateTime : toDateTime;
    
    if (dateTime && dateTime.includes("T")) {
      const timeState = parseTimeFromDateTime(dateTime);
      setSelectedTime(timeState);
    } else {
      setSelectedTime({ hour: 12, minute: 0, period: "AM" });
    }
    
    setCurrentTimeType(type);
    setTimeDialogOpen(true);
  };

  // Handle time selection
  const handleTimeSelect = () => {
    const hour12 = selectedTime.hour;
    const hour24 =
      selectedTime.period === "AM"
        ? hour12 === 12
          ? 0
          : hour12
        : hour12 === 12
          ? 12
          : hour12 + 12;

    const timeStr = `${hour24.toString().padStart(2, "0")}:${selectedTime.minute.toString().padStart(2, "0")}:00`;
    
    const currentDateTime = currentTimeType === "from" ? fromDateTime : toDateTime;
    
    if (currentDateTime) {
      const dateStr = currentDateTime.split("T")[0];
      const dateTimeStr = `${dateStr}T${timeStr}`;
      
      if (currentTimeType === "from") {
        onFromDateTimeChange(dateTimeStr);
      } else {
        onToDateTimeChange(dateTimeStr);
      }
    }

    setTimeDialogOpen(false);
  };

  return (
    <div className={`py-2 space-y-3 ${className}`}>
      {/* From Date & Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          From Date & Time
        </label>
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDateTime
                  ? formatDateForDisplay(fromDateTime)
                  : "Pick from date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50">
              <div className="relative z-50 bg-background pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={
                    fromDateTime
                      ? new Date(fromDateTime.split("T")[0])
                      : undefined
                  }
                  onSelect={(date) => handleDateSelect(date, "from")}
                  initialFocus
                  className="pointer-events-auto"
                />
              </div>
            </PopoverContent>
          </Popover>

          {fromDateTime && (
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => handleTimePickerOpen("from")}
            >
              <Clock className="mr-2 h-4 w-4" />
              {fromDateTime.includes("T")
                ? formatTimeForDisplay(fromDateTime)
                : "Select time"}
            </Button>
          )}
        </div>
      </div>

      {/* To Date & Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          To Date & Time
        </label>
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDateTime
                  ? formatDateForDisplay(toDateTime)
                  : "Pick to date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50">
              <div className="relative z-50 bg-background pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={
                    toDateTime
                      ? new Date(toDateTime.split("T")[0])
                      : undefined
                  }
                  onSelect={(date) => handleDateSelect(date, "to")}
                  initialFocus
                  disabled={(date) => {
                    // Disable dates before the "from" date
                    if (fromDateTime) {
                      return date < new Date(fromDateTime.split("T")[0]);
                    }
                    return false;
                  }}
                  className="pointer-events-auto"
                />
              </div>
            </PopoverContent>
          </Popover>

          {toDateTime && (
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => handleTimePickerOpen("to")}
            >
              <Clock className="mr-2 h-4 w-4" />
              {toDateTime.includes("T")
                ? formatTimeForDisplay(toDateTime)
                : "Select time"}
            </Button>
          )}
        </div>
      </div>

      {/* Time picker dialog */}
      <Dialog open={timeDialogOpen} onOpenChange={setTimeDialogOpen}>
        <DialogContent className="w-72 rounded-lg p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock /> Set Time for {currentTimeType === "from" ? "From" : "To"} Date
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
