import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, UserX } from "lucide-react"; // Import UserX icon
import { useState } from "react";
import Spinner from "./spinner";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import type { EmployeeData } from "@/routes/_authenticated/attendance-monitoring/employees";

// Define the props for the component
interface EmpInfoDialogProps {
  employee: EmployeeData | null; // Allow null when no employee is selected
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmpInfoDialog({
  employee,
  isOpen,
  onOpenChange,
}: EmpInfoDialogProps) {
  const { errorStyle, infoStyle, successStyle } = useToastStyleTheme();
  const [isLinkingCard, setIsLinkingCard] = useState(false);
  const [port, setPort] = useState<any>(null);

  const hanldePortOpen = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setPort(port);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLinkCard = () => {
    setIsLinkingCard(true);
    // Simulate a delay for linking the card
    toast.info("Almost here - Tap your card", {
      description: "Please tap your card on the reader.",
      className: "bg-primary-50 border-primary-200 text-black",
      style: infoStyle,
    });
    setTimeout(() => {
      setIsLinkingCard(false);
      // Simulate an error if the card is not read successfully
      // This is where you would handle the error case, such as showing a toast notification

      toast.error("Oops! Couldn’t Read the RFID Card", {
        description: "Please make sure your device is connected and try again.",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
    }, 5000);
    setTimeout(() => {
      setIsLinkingCard(false);
      // Here you would typically handle the card linking logic like doing an API call to update the employee's information
      // and if the update is a success then you will need to refetch the employee data
      // For now, we will just simulate a success message

      toast.success("Card Linked Successfully", {
        description: "Card has been linked. You're all set!",
        className: "bg-green-50 border-green-200 text-black",
        style: successStyle,
      });
    }, 8000);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Employee Information
          </DialogTitle>
        </DialogHeader>
        {!employee ? (
          // Fallback UI when no employee data is provided
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <UserX className="h-12 w-12 mb-4" />
            <p>No employee information found.</p>
          </div>
        ) : (
          // Render employee details when data is available
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 flex justify-center items-start">
                <Avatar className="h-24 w-24 border rounded-xl">
                  <AvatarImage
                    className="rounded-xl"
                    src={employee.avatarUrl}
                    alt={employee.FullName}
                  />
                  <AvatarFallback className="rounded-xl">
                    {employee.FullName?.split(" ")
                      .map((n) => n[0])
                      .join("") || "N/A"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">
                  ID: {employee.EmployeeID}
                </p>
                <h2 className="text-2xl font-bold text-primary mt-1">
                  {employee.FullName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {employee.DepartmentName}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-6" />

            {/* <div className="mt-6">
              <h3 className="text-md font-semibold text-primary mb-3">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-blue-100 text-primary hover:bg-primary hover:text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div> */}

            <div className="mt-8">
              <h3 className="text-md font-semibold text-primary mb-3">
                Assigned RFID Card
              </h3>
              <div className="flex flex-col gap-4">
                <LinkCardInput
                  label="UHF Card"
                  value={employee.EPC || ""}
                  isLinking={isLinkingCard}
                  isDeviceConnected={!!port} // Replace with actual device connection status
                  onLinkCard={handleLinkCard}
                  onClickConnect={hanldePortOpen}
                />
                <LinkCardInput
                  label="MIFARE Card"
                  value={employee.EPC || ""}
                  isLinking={isLinkingCard}
                  onLinkCard={handleLinkCard}
                  onClickConnect={hanldePortOpen}
                />
                <LinkCardInput
                  label="EM Card"
                  value={employee.EPC || ""}
                  isLinking={isLinkingCard}
                  onLinkCard={handleLinkCard}
                  onClickConnect={hanldePortOpen}
                />
              </div>

              <div className="border-t border-gray-200 mt-10" />
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
  onLinkCard: () => void;
  onClickConnect: () => void;
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
          className="bg-green-500 text-white px-4 py-2 rounded text-sm font-semibold self-end w-12"
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
      {!isDeviceConnected && (
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
