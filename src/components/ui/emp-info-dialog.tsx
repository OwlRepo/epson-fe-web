import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, UserX } from "lucide-react"; // Import UserX icon
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ForwardedRef,
} from "react";

// Extend the Navigator type to include the serial property
declare global {
  interface Navigator {
    serial: any;
  }
}
import Spinner from "./spinner";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { readRFIDData } from "@/utils/rfidReaderCommand";
import { getEMLength, getMIFARELength, getUHFLength } from "@/utils/env";
import type { EmployeeData } from "@/routes/_authenticated/attendance-monitoring/employees";
import { useMutateEmployee } from "@/hooks/mutation/useMutateEmployee";
import usePortStore from "@/store/usePortStore";
import { useSocket } from "@/hooks";

//device filters
// const filters = [
//   {
//     usbVendorId: getUHFDeviceID(), // replace with your device's VID
//     usbProductId: getUHFProductID(), // replace with your device's PID
//   },
// ];

// Define the props for the component
interface EmpInfoDialogProps {
  employee: EmployeeData | null;
  isOpen: boolean;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
}


const UHFLength = getUHFLength();
const MIFARELength = getMIFARELength();
const EMLength = getEMLength();

export default function EmpInfoDialog({
  employee,
  isOpen,
  isLoading,
  onOpenChange,
}: EmpInfoDialogProps) {
  const { infoStyle, errorStyle, successStyle } = useToastStyleTheme();

  const [deviceUHFValue, setDeviceUHFValue] = useState("");
  const [deviceMIFAREValue, setDeviceMIFAREValue] = useState("");
  const [deviceEMValue, setDeviceEMValue] = useState("");
  const [isUHFLinking, setIsUHFLinking] = useState(false);
  const [isMIFARELinking, setIsMIFARELinking] = useState(false);
  const [isEMLinking, setIsEMLinking] = useState(false);
  const { port, setPort } = usePortStore((store) => store);

  const { mutate, isError, error, isSuccess, isPending } = useMutateEmployee();
  const { emitData } = useSocket({ room: "updates" });

  const mifareRef = useRef<HTMLInputElement>(null);
  const emRef = useRef<HTMLInputElement>(null);

  const handleLinkCard = async () => {
    try {
      let portToUse = port;

      if (!portToUse) {
        const newPort = await navigator.serial.requestPort();
        await newPort.open({ baudRate: 57600 });
        setPort(newPort);
        portToUse = newPort;
      }

      await linkCard(portToUse);
    } catch (error) {
      console.error("Failed to link card:", error);
    }
  };

  const linkCard = async (newPort: any) => {
    if (!newPort) return;
    toast.info("Almost here - Tap your card", {
      description: "Please tap your card on the reader.",
      style: infoStyle,
    });
    try {
      console.log("card is linking");
      setIsUHFLinking(true);
      const data = await readRFIDData(newPort);

      if (UHFLength === data?.epc?.length) {
        setDeviceUHFValue(data?.epc ?? "");
        mutate({
          employeeID: employee?.EmployeeID,
          payload: { UHF: data?.epc },
        });
      } else {
        toast.error("Oops! Card is not valid", {
          description: "Please make sure your card is valid and try again.",
          className: "bg-red-50 border-red-200 text-black",
          style: errorStyle,
        });
      }
    } catch (error) {
      console.error("Error reading RFID data:", error);
    } finally {
      setIsUHFLinking(false);
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error("Oops! Card saving error!", {
        description:
          (error as any)?.response?.data?.message ??
          "An unknown error occurred",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
      setDeviceUHFValue("");
    }
    if (isSuccess) {
      toast.success("RFID Card Linked Successfully!", {
        description: "Your RFID card has been linked. You're all set!",
        style: successStyle,
      });
      emitData("users");
    }
  }, [isError, isSuccess]);

  useEffect(() => {
  if (!isOpen) return;

  let buffer = "";
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const resetLinkingState = () => {
    setIsMIFARELinking(false);
    setIsEMLinking(false);
    buffer = "";
  };

  const triggerMutation = (type: "MIFARE" | "EM", value: string) => {
    if (!employee?.EmployeeID) return;
    mutate({
      employeeID: employee.EmployeeID,
      payload: type === "MIFARE" ? { MIFARE: value } : { EM: value },
    });
  };

  const handleEnterPress = () => {
  let showedError = false;

  if (isEMLinking) {
    if (buffer.length === EMLength) {
      setDeviceEMValue(buffer);
      triggerMutation("EM", buffer);
    } else {
      showedError = true;
    }
  }

  if (isMIFARELinking) {
    if (buffer.length === MIFARELength) {
      setDeviceMIFAREValue(buffer);
      triggerMutation("MIFARE", buffer);
    } else {
      showedError = true;
    }
  }

  if (showedError) {
    toast.error("Oops! Card is not valid", {
      description: "Please make sure your card is valid and try again.",
      className: "bg-red-50 border-red-200 text-black",
      style: errorStyle,
    });
  }

  resetLinkingState();
};


  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isMIFARELinking && !isEMLinking) return;

    if (timeout) clearTimeout(timeout);

    if (e.key === "Enter") {
      handleEnterPress();
    } else {
      buffer += e.key;

      timeout = setTimeout(() => {
        if (isMIFARELinking) setDeviceMIFAREValue(buffer);
        resetLinkingState();
      }, 500);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
    if (timeout) clearTimeout(timeout);
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [isOpen, isMIFARELinking, isEMLinking, EMLength, MIFARELength, employee]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Employee Information
          </DialogTitle>
        </DialogHeader>
        {isLoading && <Spinner />}
        {!employee && !isLoading && (
          // Fallback UI when no employee data is provided
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <UserX className="h-12 w-12 mb-4" />
            <p>No employee information found.</p>
          </div>
        )}
        {employee && !isLoading && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <p className="text-sm text-gray-500">
                  ID: {employee.EmployeeID}
                </p>
                <h2 className="text-2xl font-bold text-primary mt-1">
                  {`${employee.FirstName} ${employee.LastName}`}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {employee.DepartmentName}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-6" />

            <div className="mt-8">
              <h3 className="text-md font-semibold text-primary mb-3">
                Assigned RFID Card
              </h3>
              <div className="flex flex-col gap-4">
                <LinkCardInput
                  label="UHF Card"
                  value={employee.UHF || deviceUHFValue}
                  isLinking={isUHFLinking || isPending}
                  isDeviceConnected={!!port}
                  onLinkCard={handleLinkCard}
                />
                <LinkCardInput
                  ref={mifareRef}
                  label="MIFARE Card"
                  value={employee.MIFARE || deviceMIFAREValue}
                  onLinkCard={() => {
                    setIsMIFARELinking(true);
                    mifareRef.current?.focus();
                  }}
                  isLinking={isMIFARELinking}
                />
                <LinkCardInput
                  ref={emRef}
                  label="EM Card"
                  value={employee.EM || deviceEMValue}
                  isLinking={isEMLinking}
                  onLinkCard={() => {
                    setIsEMLinking(true);
                    emRef.current?.focus();
                  }}
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface LinkCardInputProps {
  value?: string;
  isLinking: boolean;
  isDeviceConnected?: boolean;
  label?: string;
  onLinkCard?: () => void;
  onClickConnect?: () => void;
}

export const LinkCardInput = forwardRef(
  ({ label, value, isLinking, onLinkCard }: LinkCardInputProps, ref) => {
    return (
      <div className="flex items-center gap-4 w-full">
        <div className="flex-grow w-full">
          <label
            htmlFor="rfidCard"
            className="text-xs text-gray-500 mb-1 block"
          >
            {label} {value && !isLinking && "Linked"}
          </label>
          <Input
            ref={ref as ForwardedRef<HTMLInputElement>}
            id="rfidCard"
            type="text"
            value={value}
            readOnly
            className="bg-gray-100 border-gray-300 rounded w-full"
          />
        </div>
        {value && !isLinking && (
          <Button
            onClick={onLinkCard}
            className="bg-green-500 text-white px-4 py-2 rounded text-sm font-semibold self-end w-32"
          >
            <CheckCircle className="h-4 w-4 mr-1 inline-block" />
            Replace
          </Button>
        )}
        {!value && !isLinking && (
          <Button
            onClick={onLinkCard}
            className=" text-white px-4 py-2 rounded text-sm font-semibold self-end w-32"
          >
            Link a Card
          </Button>
        )}
        {isLinking && (
          <Button className=" text-white px-4 py-2 rounded text-sm font-semibold self-end w-32">
            <Spinner size={15} color="white" />
            Reading
          </Button>
        )}
      </div>
    );
  }
);
