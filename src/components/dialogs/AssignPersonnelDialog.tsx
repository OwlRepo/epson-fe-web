import { type DialogProps } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { useGetHostPerson } from "@/hooks/query/useGeHostPersonList";
import { AsyncAutoComplete } from "../inputs/AsyncAutoComplete";
import { Controller, useForm } from "react-hook-form";
import TextInput from "../inputs/TextInput";
import { AutoComplete } from "../inputs/AutoComplete";
import { LinkCardInput, type CardType } from "../inputs/LinkCardInput";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { useEffect, useRef, useState } from "react";
import usePortStore from "@/store/usePortStore";
import { getEMLength, getMIFARELength, getUHFLength } from "@/utils/env";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { readRFIDData } from "@/utils/rfidReaderCommand";
import { cn } from "@/lib/utils";
import { useGetDepartmentList } from "@/hooks/query/useGetDepartmentList";
import { useGetEmployeeByNo } from "@/hooks/query/useGetEmployeeById";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { AutoSuggest } from "../inputs/AutoSuggest";
import { useGetERTList } from "@/hooks/query/useGetERTList";

interface AssignPersonnelDialogProps extends DialogProps {
  assignedPersonnel?: any;
  emitData: (event: string, data: any) => void;
  responseStatus?: string;
  controllerId?: string;
}

//env configs
const UHFLength = getUHFLength();
const MIFARELength = getMIFARELength();
const EMLength = getEMLength();

const AssignPersonnelDialog = ({
  open,
  onOpenChange,
  assignedPersonnel,
  emitData,
  controllerId,
}: AssignPersonnelDialogProps) => {
  const form = useForm({
    mode: "onChange",
  });
  const { control, register, reset, formState, setValue, watch, handleSubmit } =
    form;

  const { errorStyle, infoStyle } = useToastStyleTheme();

  const [isLinking, setIsLinking] = useState<CardType>(null);
  const { port, setPort } = usePortStore((store) => store);
  const [openDialog, setOpenDialog] = useState<"remove" | "update" | null>(
    null
  );

  const { data: departmentList } = useGetDepartmentList();
  const { data: ERTList } = useGetERTList();

  const { data: employee } = useGetEmployeeByNo(watch("EmployeeNo") ?? "");

  const onSubmit = (data: any) => {
    emitData("cdepro_add", {
      id: employee?.EmployeeID.toString() ?? "",
      firstname: data.FirstName,
      lastname: data.LastName,
      email: data.EmailAddress,
      contact: data.ContactNo,
      department: data.Department,
      ert: data.EmergencyResponseTeam,
      uhf: data?.UHF ?? "",
      mifare: data?.MIFARE ?? "",
      em: data?.EM ?? "",
    });
  };

  const onClearData = () => {
    reset();
    setValue("UHF", "");
    setValue("MIFARE", "");
    setValue("EM", "");
  };

  const onUpdatePersonnel = (data: any) => {
    emitData("cdepro_update", {
      row_id: assignedPersonnel?.RowID.toString(),
      id: assignedPersonnel?.EmployeeID.toString(),
      firstname: data.FirstName,
      lastname: data.LastName,
      email: data.EmailAddress,
      contact: data.ContactNo,
      department: data.Department,
      ert: data.EmergencyResponseTeam,
      uhf: data?.UHF ?? "",
      mifare: data?.MIFARE ?? "",
      em: data?.EM ?? "",
    });
    setOpenDialog(null);
  };

  const onRemovePersonnel = () => {
    emitData("cdepro_remove", { row_id: assignedPersonnel?.RowID?.toString() });
    setOpenDialog(null);
  };

  useEffect(() => {
    if (employee) {
      // console.log("Employee Data:", JSON.stringify(employee, null, 2));
      setValue("FirstName", employee.FirstName);
      setValue("LastName", employee.LastName);
      setValue("EmailAddress", employee.EmailAddress);
      setValue("UHF", employee.UHF || "");
      setValue("MIFARE", employee.MIFARE || "");
      setValue("EM", employee.EM || "");
    }
  }, [employee, setValue]);

  useEffect(() => {
    if (assignedPersonnel) {
      // console.log("Assigned Personnel Data:", assignedPersonnel);
      reset({
        LastName: assignedPersonnel.LastName || "",
        FirstName: assignedPersonnel.FirstName || "",
        EmailAddress: assignedPersonnel.EmailAddress || "",
        ContactNo: assignedPersonnel.ContactNo || "",
        EmergencyResponseTeam: assignedPersonnel.ERT || "",
        Department: assignedPersonnel.Department || "",
        UHF: assignedPersonnel.UHF || "",
        MIFARE: assignedPersonnel.MIFARE || "",
        EM: assignedPersonnel.EM || "",
      });
    }
  }, [assignedPersonnel]);

  useEffect(() => {
    if (controllerId) setValue("Department", controllerId);
  }, [controllerId]);

  const mifareRef = useRef<HTMLInputElement>(null);
  const emRef = useRef<HTMLInputElement>(null);

  // Phone number input filter handlers
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow special keys (navigation, editing, shortcuts)
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    // Allow Ctrl/Cmd combinations (for shortcuts like Ctrl+A, Ctrl+C, Ctrl+V)
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Allow the key if it's an allowed special key
    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Block invalid characters (only allow digits 0-9)
    const phoneRegex = /^[0-9]$/;
    if (!phoneRegex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhonePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    field: { onChange: (value: string) => void }
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    // Filter out invalid characters (only keep digits 0-9)
    const filteredText = pastedText.replace(/[^0-9]/g, "");
    field.onChange(filteredText);
  };

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
        setValue("UHF", data?.epc ?? "", { shouldValidate: true });
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
      setIsLinking(null);
    }
  };

  useEffect(() => {
    if (!open) return;

    let buffer = "";
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const resetLinkingState = () => {
      setIsLinking(null);
      buffer = "";
    };

    const handleLastKeyPress = () => {
      let showedError = false;

      switch (isLinking) {
        case "UHF": {
          if (buffer.length === UHFLength) {
            setValue("UHF", buffer);
            setIsLinking(null);
          } else {
            showedError = true;
          }
          break;
        }

        case "EM": {
          if (buffer.length === EMLength) {
            setValue("EM", buffer);
            setIsLinking(null);
          } else {
            showedError = true;
          }
          break;
        }
        case "MIFARE": {
          if (buffer.length === MIFARELength) {
            setValue("MIFARE", buffer);
            setIsLinking(null);
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
  }, [open, isLinking, UHFLength, EMLength, MIFARELength, assignedPersonnel]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      {/* Manual backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>
      )}
      <DialogContent className="sm:max-w-[800px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Assigned Personnel
          </DialogTitle>
        </DialogHeader>
        <div>
          {!assignedPersonnel && (
            <>
              <AsyncAutoComplete
                label="Assign Personnel"
                name={"AssignPersonnel"}
                id="assign-personnel"
                setValue={setValue}
                watch={watch}
                register={register}
                errors={formState?.errors}
                queryHook={useGetHostPerson}
                withEmployeeNo
                required={false}
              />
              <Divider />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="First Name"
              id="first-name"
              name="FirstName"
              register={register}
              errors={formState?.errors}
              required
              readOnly={
                Boolean(employee?.FirstName) ||
                assignedPersonnel?.Type === "Employee"
              }
            />
            <TextInput
              label="Last Name"
              id="last-name"
              name="LastName"
              register={register}
              errors={formState?.errors}
              required
              readOnly={
                Boolean(employee?.LastName) ||
                assignedPersonnel?.Type === "Employee"
              }
            />

            <Controller
              name="EmailAddress"
              control={control}
              rules={{
                required: "Email Address is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              }}
              render={({ field, fieldState }) => (
                <div className="space-y-1 w-full">
                  <div className="flex justify-between">
                    <label
                      htmlFor="email-address"
                      className="text-sm font-normal text-gray-700"
                    >
                      Email Address
                    </label>
                  </div>
                  <Input
                    type="text"
                    id="email-address"
                    className={cn(
                      "h-[44px]",
                      (Boolean(employee?.EmailAddress) ||
                        assignedPersonnel?.Type === "Employee") &&
                        "cursor-not-allowed text-gray-500"
                    )}
                    {...field}
                    readOnly={
                      Boolean(employee?.EmailAddress) ||
                      assignedPersonnel?.Type === "Employee"
                    }
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500 w-full">
                      {fieldState.error.message as string}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="ContactNo"
              control={control}
              rules={{ required: "Contact No. is required" }}
              render={({ field, fieldState }) => (
                <div className="space-y-1 w-full">
                  <div className="flex justify-between">
                    <label
                      htmlFor="contact-no"
                      className="text-sm font-normal text-gray-700"
                    >
                      Contact No.
                    </label>
                  </div>
                  <Input
                    type="text"
                    id="contact-no"
                    className={cn("h-[44px]")}
                    placeholder="09171234567"
                    {...field}
                    onKeyDown={handlePhoneKeyDown}
                    onPaste={(e) => handlePhonePaste(e, field)}
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500 w-full">
                      {fieldState.error.message as string}
                    </p>
                  )}
                </div>
              )}
            />

            <AutoComplete
              readOnly={!assignedPersonnel && Boolean(controllerId)}
              label="Department"
              name={"Department"}
              id="employee-type"
              setValue={setValue}
              watch={watch}
              register={register}
              errors={formState?.errors}
              list={departmentList ?? []}
            />

            <AutoSuggest
              label="Emergency Response Team (ERT)"
              control={control}
              name="EmergencyResponseTeam"
              options={ERTList ?? []}
              errors={formState?.errors}
            />
          </div>

          <Divider />
          <h2 className="font-bold text-lg">Assign RFID Cards</h2>

          <div className="flex flex-col gap-4 mt-4">
            <Controller
              name="UHF"
              control={control}
              rules={{ required: "UHF Card is required" }} // ✅ required rule
              render={({ field, fieldState }) => (
                <div>
                  <LinkCardInput
                    readOnly={Boolean(watch("UHF")) && !assignedPersonnel}
                    label="UHF Card"
                    //@ts-ignore
                    variant={"evacuation"}
                    value={watch("UHF")}
                    isLinking={isLinking === "UHF"}
                    isDeviceConnected={!!port}
                    onLinkCard={handleLinkCard}
                    onStopReading={() => setIsLinking(null)}
                    onUnlinkCard={() => field.onChange("")}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-sm">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            <LinkCardInput
              readOnly={Boolean(watch("MIFARE")) && !assignedPersonnel}
              ref={mifareRef}
              label="MIFARE Card"
              //@ts-ignore
              variant={"evacuation"}
              value={watch("MIFARE")}
              onLinkCard={() => {
                setIsLinking("MIFARE");
                mifareRef.current?.focus();
              }}
              isLinking={isLinking === "MIFARE"}
              onStopReading={() => setIsLinking(null)}
              onUnlinkCard={() => setValue("MIFARE", "", { shouldDirty: true })}
            />
            <LinkCardInput
              readOnly={Boolean(watch("EM")) && !assignedPersonnel}
              ref={emRef}
              label="EM Card"
              //@ts-ignore
              variant={"evacuation"}
              value={watch("EM")}
              onLinkCard={() => {
                setIsLinking("EM");
                emRef.current?.focus();
              }}
              isLinking={isLinking === "EM"}
              onStopReading={() => setIsLinking(null)}
              onUnlinkCard={() => setValue("EM", "", { shouldDirty: true })}
            />
          </div>

          <Divider />
          <div className="flex justify-end items-center mt-6 gap-4">
            <Button
              variant={"outline"}
              className="border-[#980000] text-[#980000] hover:text-[#980000] "
              onClick={() => {
                if (assignedPersonnel) {
                  setOpenDialog("update");
                } else {
                  onClearData();
                }
              }}
              disabled={Object.keys(formState.errors).length > 0}
            >
              {assignedPersonnel ? "Update Personnel" : "Clear Data"}
            </Button>
            <Button
              //@ts-ignore
              variant={"evacuation"}
              className=" text-white px-4 py-2 rounded text-sm font-semibold"
              onClick={() => {
                if (assignedPersonnel) {
                  setOpenDialog("remove");
                } else {
                  handleSubmit(onSubmit)();
                }
              }}
              disabled={Object.keys(formState.errors).length > 0}
            >
              {assignedPersonnel ? "Remove Data" : "Assign Personnel"}
            </Button>
          </div>
          <ConfirmationDialog
            isEVS
            open={Boolean(openDialog)}
            onOpenChange={(openState) => {
              if (!openState) setOpenDialog(null);
            }}
            onConfirm={() => {
              if (openDialog === "update") {
                handleSubmit(onUpdatePersonnel)();
              } else {
                onRemovePersonnel();
              }
            }}
            Title="Confirmation"
            Description={`Are you sure you want to ${openDialog} this person's information?`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPersonnelDialog;

const Divider = () => (
  <div className="border-t w-full my-6 border-[#4F5B66]"></div>
);
