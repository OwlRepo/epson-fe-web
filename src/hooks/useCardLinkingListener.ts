import type { CardType } from "@/components/inputs/LinkCardInput";
import { useEffect } from "react";
import { toast } from "sonner";

interface UseCardLinkingListenerProps {
  isOpen?: boolean;
  isLinking: CardType | null;
  setIsLinking: (val: CardType | null) => void;
  UHFLength: number;
  EMLength: number;
  MIFARELength: number;
  employee: { EmployeeID: string } | null;
  setDeviceUHFValue: (val: string) => void;
  setDeviceEMValue: (val: string) => void;
  setDeviceMIFAREValue: (val: string) => void;
  mutate: (params: {
    employeeID: string;
    payload: Record<string, string>;
  }) => void;
  errorStyle?: React.CSSProperties;
}

export const useCardLinkingListener = ({
  isOpen = false,
  isLinking,
  setIsLinking,
  UHFLength,
  EMLength,
  MIFARELength,
  employee,
  setDeviceUHFValue,
  setDeviceEMValue,
  setDeviceMIFAREValue,
  mutate,
  errorStyle = {},
}: UseCardLinkingListenerProps) => {
  useEffect(() => {
    if (!isOpen) return;

    let buffer = "";
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const resetLinkingState = () => {
      setIsLinking(null);
      buffer = "";
    };

    const triggerMutation = (type: Exclude<CardType, null>, value: string) => {
      if (!employee?.EmployeeID) return;
      mutate({
        employeeID: employee.EmployeeID,
        payload: { [type as string]: value },
      });
    };

    const handleLastKeyPress = () => {
      let showedError = false;

      switch (isLinking) {
        case "UHF":
          if (buffer.length === UHFLength) {
            setDeviceUHFValue(buffer);
            triggerMutation("UHF", buffer);
          } else {
            showedError = true;
          }
          break;

        case "EM":
          if (buffer.length === EMLength) {
            setDeviceEMValue(buffer);
            triggerMutation("EM", buffer);
          } else {
            showedError = true;
          }
          break;

        case "MIFARE":
          if (buffer.length === MIFARELength) {
            setDeviceMIFAREValue(buffer);
            triggerMutation("MIFARE", buffer);
          } else {
            showedError = true;
          }
          break;
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
      } else {
        buffer += e.key;
        timeout = setTimeout(() => {
          handleLastKeyPress();
        }, 500);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isOpen,
    isLinking,
    UHFLength,
    EMLength,
    MIFARELength,
    employee,
    setDeviceUHFValue,
    setDeviceEMValue,
    setDeviceMIFAREValue,
    mutate,
    setIsLinking,
    errorStyle,
  ]);
};
