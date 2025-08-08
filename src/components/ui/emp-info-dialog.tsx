import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { UserX } from "lucide-react"; // Import UserX icon
import { useEffect, useRef, useState } from "react";

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
import {
  getEMLength,
  getIsSerialConnection,
  getMIFARELength,
  getUHFLength,
} from "@/utils/env";
import type { EmployeeData } from "@/routes/_authenticated/attendance-monitoring/employees";
import { useMutateEmployee } from "@/hooks/mutation/useMutateEmployee";
import usePortStore from "@/store/usePortStore";
import { useSocket } from "@/hooks";
import { LinkCardInput } from "../inputs/LinkCardInput";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./breadcrumb";

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

type CardType = "UHF" | "MIFARE" | "EM" | null;

//env configs
const UHFLength = getUHFLength();
const MIFARELength = getMIFARELength();
const EMLength = getEMLength();
const isSerialConnection = Boolean(getIsSerialConnection());

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
  const [isLinking, setIsLinking] = useState<CardType>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const { port, setPort } = usePortStore((store) => store);

  const { mutate, isError, error, isSuccess } = useMutateEmployee();
  const { emitData } = useSocket({ room: "updates" });

  const uhfRef = useRef<HTMLInputElement>(null);
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
      setIsLinking("UHF");
      const data = await readRFIDData(newPort);

      if (UHFLength === data?.epc?.length) {
        setDeviceUHFValue(data?.epc ?? "");
        mutate({
          employeeNo: employee?.EmployeeNo,
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
    }
  };

  const handleUnlinkCard = (type: CardType) => {
    setIsUnlinking(true);
    setIsLinking(type);
    mutate({
      employeeNo: employee?.EmployeeNo,
      payload: { [type as keyof CardType]: "" },
    });
  };

  useEffect(() => {
    if (isError) {
      toast.error("Oops! Saving error!", {
        description:
          (error as any)?.response?.data?.message ??
          "An unknown error occurred",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });

      switch (isLinking) {
        case "UHF":
          setDeviceUHFValue("");
          break;
        case "EM":
          setDeviceEMValue("");
          break;
        case "MIFARE":
          setDeviceMIFAREValue("");
          break;
      }
      setIsLinking(null);
      setIsUnlinking(false);
    }
    if (isSuccess) {
      if (isUnlinking) {
        toast.success("RFID Card Unlinked Successfully!", {
          description: "Your RFID card has been unlinked. You're all set!",
          style: successStyle,
        });
      } else {
        toast.success("RFID Card Linked Successfully!", {
          description: "Your RFID card has been linked. You're all set!",
          style: successStyle,
        });
      }

      emitData("users");
      switch (isLinking) {
        case "UHF":
          setDeviceUHFValue("");
          break;
        case "EM":
          setDeviceEMValue("");
          break;
        case "MIFARE":
          setDeviceMIFAREValue("");
          break;
      }
      setIsLinking(null);
      setIsUnlinking(false);
    }
  }, [isError, isSuccess]);

  useEffect(() => {
    if (!isOpen) return;

    let buffer = "";
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const resetLinkingState = () => {
      // setIsLinking(null);
      buffer = "";
    };

    const triggerMutation = (type: Exclude<CardType, null>, value: string) => {
      if (!employee?.EmployeeID) return;
      mutate({
        employeeNo: employee.EEmployeeNo,
        payload: { [type as string]: value },
      });
    };

    const handleLastKeyPress = () => {
      let showedError = false;

      switch (isLinking) {
        case "UHF": {
          if (buffer.length === UHFLength) {
            setDeviceUHFValue(buffer);
            triggerMutation("UHF", buffer);
          } else {
            showedError = true;
          }
          break;
        }

        case "EM": {
          if (buffer.length === EMLength) {
            setDeviceEMValue(buffer);
            triggerMutation("EM", buffer);
          } else {
            showedError = true;
          }
          break;
        }
        case "MIFARE": {
          if (buffer.length === MIFARELength) {
            setDeviceMIFAREValue(buffer);
            triggerMutation("MIFARE", buffer);
          } else {
            showedError = true;
          }
          break;
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
      if (!isLinking) return;

      if (timeout) clearTimeout(timeout);

      if (e.key.length > 1 && e.key !== "Enter") return;

      if (e.key === "Enter") {
        handleLastKeyPress();
        resetLinkingState();
        buffer = "";
      } else {
        buffer += e.key;
        timeout = setTimeout(() => {
          handleLastKeyPress();
          resetLinkingState();
          buffer = "";
        }, 500);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLinking, UHFLength, EMLength, MIFARELength, employee]);

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
                  Employee No: {employee?.EmployeeNo}
                </p>
                <h2 className="text-2xl font-bold text-primary mt-1">
                  {`${employee.FirstName} ${employee.LastName}`}
                </h2>
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      {employee?.DivisionName || "UNKNOWN"}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {employee?.DepartmentName || "UNKNOWN"}
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {employee?.SectionName || "UNKOWN"}
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-6" />

            <div className="mt-8">
              <h3 className="text-md font-semibold text-primary mb-3">
                Assigned RFID Card
              </h3>
              <div className="flex flex-col gap-4">
                {isSerialConnection && (
                  <LinkCardInput
                    label="UHF Card"
                    value={employee.UHF || deviceUHFValue}
                    isLinking={isUHFLinking}
                    isDeviceConnected={!!port}
                    onLinkCard={handleLinkCard}
                    onUnlinkCard={() => handleUnlinkCard("UHF")}
                    onStopReading={() => setIsUHFLinking(false)}
                  />
                )}
                {!isSerialConnection && (
                  <LinkCardInput
                    ref={uhfRef}
                    label="UHF"
                    value={employee.UHF || deviceUHFValue}
                    onLinkCard={() => {
                      setIsLinking("UHF");
                      uhfRef.current?.focus();
                    }}
                    onUnlinkCard={() => handleUnlinkCard("UHF")}
                    isLinking={isLinking === "UHF"}
                    onStopReading={() => setIsLinking(null)}
                  />
                )}

                <LinkCardInput
                  ref={mifareRef}
                  label="MIFARE Card"
                  value={employee.MIFARE || deviceMIFAREValue}
                  onLinkCard={() => {
                    setIsLinking("MIFARE");
                    mifareRef.current?.focus();
                  }}
                  isLinking={isLinking === "MIFARE"}
                  onUnlinkCard={() => handleUnlinkCard("MIFARE")}
                  onStopReading={() => setIsLinking(null)}
                />
                <LinkCardInput
                  ref={emRef}
                  label="EM Card"
                  value={employee.EM || deviceEMValue}
                  onLinkCard={() => {
                    setIsLinking("EM");
                    emRef.current?.focus();
                  }}
                  onUnlinkCard={() => handleUnlinkCard("EM")}
                  isLinking={isLinking === "EM"}
                  onStopReading={() => setIsLinking(null)}
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
