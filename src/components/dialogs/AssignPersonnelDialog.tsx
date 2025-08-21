import { type DialogProps } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { useGetHostPerson } from "@/hooks/query/useGeHostPersonList";
import { AsyncAutoComplete } from "../inputs/AsyncAutoComplete";
import { useForm } from "react-hook-form";
import TextInput from "../inputs/TextInput";
import { AutoComplete } from "../inputs/AutoComplete";
import { LinkCardInput, type CardType } from "../inputs/LinkCardInput";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { useEffect, useRef, useState } from "react";
import usePortStore from "@/store/usePortStore";
import { getEMLength, getMIFARELength, getUHFLength } from "@/utils/env";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { readRFIDData } from "@/utils/rfidReaderCommand";
import { useGetDepartmentList } from "@/hooks/query/useGetDepartmentList";
import { useGetEmployeeByNo } from "@/hooks/query/useGetEmployeeById";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface AssignPersonnelDialogProps extends DialogProps {
  assignedPersonnel?: any;
  emitData: (event: string, data: any) => void;
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
}: AssignPersonnelDialogProps) => {
  const form = useForm();
  const { register, reset, formState, setValue, watch, handleSubmit } = form;

  const { errorStyle, infoStyle } = useToastStyleTheme();

  const [isUHFLinking, setIsUHFLinking] = useState(false);
  const [isLinking, setIsLinking] = useState<CardType>(null);
  const { port, setPort } = usePortStore((store) => store);
  const [openDialog, setOpenDialog] = useState<"remove" | "update" | null>(
    null
  );

  const { data: departmentList } = useGetDepartmentList();

  const { data: employee } = useGetEmployeeByNo(watch("EmployeeNo") ?? "");

  const onSubmit = (data: any) => {
    emitData("cdepro_add", {
      id: employee?.EmployeeID.toString(),
      firstname: data.FirstName,
      lastname: data.LastName,
      email: data.EmailAddress,
      contact: data.ContactNo,
      department: data.Department,
      ert: data.EmergencyResponseTeam,
      uhf: data?.UHF ?? "123",
      mifare: data?.MIFARE ?? "123",
      em: data?.EM ?? "123",
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
      uhf: data?.UHF ?? "123",
      mifare: data?.MIFARE ?? "123",
      em: data?.EM ?? "123",
    });
    setOpenDialog(null);
  };

  const onRemovePersonnel = () => {
    emitData("cdepro_remove", assignedPersonnel?.RowID.toString());
    setOpenDialog(null);
  };
  useEffect(() => {
    if (employee) {
      setValue("FirstName", employee.FirstName);
      setValue("LastName", employee.LastName);
      setValue("EmailAddress", employee.EmailAddress);
      setValue("ContactNo", employee.ContactNo);
      setValue("Department", employee.DepartmentName);
      setValue("UHF", employee.UHF || "");
      setValue("MIFARE", employee.MIFARE || "");
      setValue("EM", employee.EM || "");
    }
  }, [employee, setValue]);

  useEffect(() => {
    if (assignedPersonnel) {
      console.log("Assigned Personnel Data:", assignedPersonnel);
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
        setValue("UHF", data?.epc ?? "");
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
      <DialogContent className="sm:max-w-[600px] p-8 bg-white rounded-lg shadow-xl">
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
              readOnly={false}
            />
            <TextInput
              label="Last Name"
              id="last-name"
              name="LastName"
              register={register}
              errors={formState?.errors}
              required
              readOnly={false}
            />

            <TextInput
              label="Email Address"
              id="email-address"
              name="EmailAddress"
              register={register}
              errors={formState?.errors}
              required
              readOnly={false}
            />

            <TextInput
              label="Contact No."
              id="contact-no"
              name="ContactNo"
              register={register}
              errors={formState?.errors}
              required
              readOnly={false}
            />

            <AutoComplete
              label="Department"
              name={"Department"}
              id="employee-type"
              setValue={setValue}
              watch={watch}
              register={register}
              errors={formState?.errors}
              list={departmentList ?? []}
            />

            <TextInput
              label="Emergency Response Team (ERT)"
              id="emergency-response-team"
              name="EmergencyResponseTeam"
              register={register}
              errors={formState?.errors}
              required
              readOnly={false}
            />
          </div>

          <Divider />
          <h2 className="font-bold text-lg">Assign RFID Cards</h2>

          <div className="flex flex-col gap-4 mt-4">
            <LinkCardInput
              label="UHF Card"
              variant={"evacuation"}
              value={watch("UHF")}
              isLinking={isUHFLinking}
              isDeviceConnected={!!port}
              onLinkCard={handleLinkCard}
              onStopReading={() => setIsUHFLinking(false)}
              onUnlinkCard={() => setValue("UHF", "", { shouldDirty: true })}
            />

            <LinkCardInput
              ref={mifareRef}
              label="MIFARE Card"
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
              ref={emRef}
              label="EM Card"
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
            >
              {assignedPersonnel ? "Update Personnel" : "Clear Data"}
            </Button>
            <Button
              variant={"evacuation"}
              className=" text-white px-4 py-2 rounded text-sm font-semibold"
              onClick={() => {
                if (assignedPersonnel) {
                  setOpenDialog("remove");
                } else {
                  handleSubmit(onSubmit)();
                }
              }}
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
