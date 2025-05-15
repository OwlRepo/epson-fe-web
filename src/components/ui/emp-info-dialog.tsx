import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, UserX } from "lucide-react"; // Import UserX icon
import { useEffect, useState } from "react";

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
import { getUHFDeviceID, getUHFProductID, getValidUserID } from "@/utils/env";
import type { EmployeeData } from "@/routes/_authenticated/attendance-monitoring/employees";
import { useMutateEmployee } from "@/hooks/mutation/useMutateEmployee";
import usePortStore from "@/store/usePortStore";

//device filters
const filters = [
  {
    usbVendorId: getUHFDeviceID(), // replace with your device's VID
    usbProductId: getUHFProductID(), // replace with your device's PID
  },
];

// Define the props for the component
interface EmpInfoDialogProps {
  employee: EmployeeData | null;
  isOpen: boolean;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
}

const validUserID = getValidUserID();

export default function EmpInfoDialog({
  employee,
  isOpen,
  isLoading,
  onOpenChange,
}: EmpInfoDialogProps) {
  const { infoStyle, errorStyle } = useToastStyleTheme();
  const [isLinkingCard] = useState(false);
  const [deviceUHFValue, setDeviceUHFValue] = useState("");
  const [isUHFLinking, setIsUHFLinking] = useState(false);
  const { port, setPort } = usePortStore((store) => store);

  const { mutate, isError, isPending } = useMutateEmployee();

  const hanldePortOpen = async () => {
    try {
      const port = await navigator.serial.requestPort({ filters });
      await port.open({ baudRate: 115200 });
      setPort(port);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLinkCard = async () => {
    if (!port) return;
    toast.info("Almost here - Tap your card", {
      description: "Please tap your card on the reader.",
      className: "bg-primary-50 border-primary-200 text-black",
      style: infoStyle,
    });
    try {
      setIsUHFLinking(true);
      const data = await readRFIDData(port);

      if (validUserID.includes(data?.userID ?? "")) {
        setDeviceUHFValue(data?.epc ?? "");
        mutate({
          employeeNo: employee?.EmployeeID,
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
    console.log("isError", isError);
    if (isError) {
      toast.error("Oops! Card saving error!", {
        description: "Please try again.",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
      setDeviceUHFValue("");
    }
  }, [isError]);

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
                  onClickConnect={hanldePortOpen}
                />
                <LinkCardInput
                  label="MIFARE Card"
                  value={""}
                  isLinking={isLinkingCard}
                />
                <LinkCardInput
                  label="EM Card"
                  value={""}
                  isLinking={isLinkingCard}
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
  value: string;
  isLinking: boolean;
  isDeviceConnected?: boolean;
  label: string;
  onLinkCard?: () => void;
  onClickConnect?: () => void;
}

const LinkCardInput = ({
  label,
  value,
  isLinking,
  isDeviceConnected = true,
  onClickConnect,
  onLinkCard,
}: LinkCardInputProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-grow">
        <label htmlFor="rfidCard" className="text-xs text-gray-500 mb-1 block">
          {label}
        </label>
        <Input
          id="rfidCard"
          type="text"
          value={value}
          readOnly
          className="bg-gray-100 border-gray-300 rounded"
        />
      </div>
      {value && !isLinking && (
        <Button
          disabled
          className="bg-green-500 text-white px-4 py-2 rounded text-sm font-semibold self-end w-32"
        >
          <CheckCircle className="h-4 w-4 mr-1 inline-block" />
          Card Linked
        </Button>
      )}
      {!value && !isLinking && isDeviceConnected && (
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
      {!isDeviceConnected && !value && (
        <Button
          onClick={onClickConnect}
          className=" text-white px-4 py-2 rounded text-sm font-semibold self-end w-32"
        >
          Connect Device
        </Button>
      )}
    </div>
  );
};
