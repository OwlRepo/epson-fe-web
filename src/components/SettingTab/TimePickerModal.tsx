import type { DialogProps } from "@radix-ui/react-dialog";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { Button } from "../ui/button";
import Spinner from "../ui/spinner";

interface TimePickerModalProps extends DialogProps {
  value: string;
  isLoading: boolean;
  onDone?: (value: string) => void;
  onClose?: () => void;
}

const TimePickerModal = ({
  isLoading = false,
  ...props
}: TimePickerModalProps) => {
  const [hr, mm, AA] = props.value.split(/[: ]/);

  const [hour, setHour] = useState(parseInt(hr) ?? 12);
  const [minute, setMinute] = useState(parseInt(mm) ?? 0);
  const [period, setPeriod] = useState(AA);

  const incrementHour = () => setHour((prev) => (prev === 12 ? 1 : prev + 1));
  const decrementHour = () => setHour((prev) => (prev === 1 ? 12 : prev - 1));
  const incrementMinute = () =>
    setMinute((prev) => (prev === 59 ? 0 : prev + 1));
  const decrementMinute = () =>
    setMinute((prev) => (prev === 0 ? 59 : prev - 1));
  const togglePeriod = () => setPeriod((prev) => (prev === "AM" ? "PM" : "AM"));
  return (
    <Dialog {...props}>
      <DialogContent className="w-72 rounded-lg p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock /> Set Time
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center gap-4 shadow-md p-4 px-8 rounded-md">
          <div className="text-center">
            <button onClick={incrementHour} className="text-lg font-semibold">
              <ChevronUp />
            </button>
            <div>{hour.toString().padStart(2, "0")}</div>
            <button onClick={decrementHour} className="text-lg font-semibold">
              <ChevronDown />
            </button>
          </div>
          <div>:</div>
          <div className="text-center">
            <button onClick={incrementMinute} className="text-lg font-semibold">
              <ChevronUp />
            </button>
            <div>{minute.toString().padStart(2, "0")}</div>
            <button onClick={decrementMinute} className="text-lg font-semibold">
              <ChevronDown />
            </button>
          </div>
          <div className="text-center">
            <button onClick={togglePeriod} className="text-lg font-semibold">
              <ChevronUp />
            </button>
            <div>{period}</div>
            <button onClick={togglePeriod} className="text-lg font-semibold">
              <ChevronDown />
            </button>
          </div>
        </div>
        <DialogFooter>
          {!isLoading && (
            <Button
              onClick={() =>
                props.onDone?.(
                  `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`
                )
              }
              className="w-full"
            >
              Done
            </Button>
          )}
          {isLoading && (
            <Button disabled className="w-full">
              <Spinner size={15} color="white" containerClassName="w-6" />
              Saving
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimePickerModal;
