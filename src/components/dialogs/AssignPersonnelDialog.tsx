import type { DialogProps } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { useGetHostPerson } from "@/hooks/query/useGeHostPersonList";
import { AsyncAutoComplete } from "../inputs/AsyncAutoComplete";
import { useForm } from "react-hook-form";
import TextInput from "../inputs/TextInput";
import { AutoComplete } from "../inputs/AutoComplete";
import { LinkCardInput, type CardType } from "../inputs/LinkCardInput";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { useRef, useState } from "react";
import usePortStore from "@/store/usePortStore";
import { useCardLinkingListener } from "@/hooks/useCardLinkingListener";
import { getEMLength, getMIFARELength, getUHFLength } from "@/utils/env";
import { useMutateEmployee } from "@/hooks/mutation/useMutateEmployee";

interface AssignPersonnelDialogProps extends DialogProps {
  assignedPersonnel?: any;
}

//env configs
const UHFLength = getUHFLength();
const MIFARELength = getMIFARELength();
const EMLength = getEMLength();

const AssignPersonnelDialog = ({
  open,
  onOpenChange,
  assignedPersonnel,
}: AssignPersonnelDialogProps) => {
  const form = useForm();
  const {
    register,
    handleSubmit,
    formState,
    setValue,
    watch,
    control,
    reset,
    setError,
  } = form;

  const { infoStyle, errorStyle, successStyle } = useToastStyleTheme();
  const [deviceUHFValue, setDeviceUHFValue] = useState("");
  const [deviceMIFAREValue, setDeviceMIFAREValue] = useState("");
  const [deviceEMValue, setDeviceEMValue] = useState("");
  const [isUHFLinking, setIsUHFLinking] = useState(false);
  const [isLinking, setIsLinking] = useState<CardType>(null);
  const { port, setPort } = usePortStore((store) => store);

  const { mutate, isError, error, isSuccess } = useMutateEmployee();

  const mifareRef = useRef<HTMLInputElement>(null);
  const emRef = useRef<HTMLInputElement>(null);

  useCardLinkingListener({
    isOpen: open,
    isLinking,
    setIsLinking,
    UHFLength,
    EMLength,
    MIFARELength,
    employee: assignedPersonnel,
    setDeviceUHFValue,
    setDeviceEMValue,
    setDeviceMIFAREValue,
    mutate,
    errorStyle,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Assigned Personnel
          </DialogTitle>
        </DialogHeader>
        <div>
          <AsyncAutoComplete
            label="Assign Personnel"
            name={"AssignPersonnel"}
            id="assign-personnel"
            setValue={setValue}
            watch={watch}
            register={register}
            errors={formState?.errors}
            queryHook={useGetHostPerson}
          />
          <Divider />

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
              name={"GuestType"}
              id="employee-type"
              setValue={setValue}
              watch={watch}
              register={register}
              errors={formState?.errors}
              list={[
                { label: "IT", value: "IT" },
                { label: "HR", value: "HR" },
                { label: "Finance", value: "Finance" },
              ]}
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
              value={assignedPersonnel?.UHF || deviceUHFValue}
              isLinking={isUHFLinking}
              isDeviceConnected={!!port}
              // onLinkCard={handleLinkCard}
              onStopReading={() => setIsUHFLinking(false)}
            />

            <LinkCardInput
              ref={mifareRef}
              label="MIFARE Card"
              variant={"evacuation"}
              value={assignedPersonnel?.MIFARE || deviceMIFAREValue}
              onLinkCard={() => {
                setIsLinking("MIFARE");
                mifareRef.current?.focus();
              }}
              isLinking={isLinking === "MIFARE"}
              onStopReading={() => setIsLinking(null)}
            />
            <LinkCardInput
              ref={emRef}
              label="EM Card"
              variant={"evacuation"}
              value={assignedPersonnel?.EM || deviceEMValue}
              onLinkCard={() => {
                setIsLinking("EM");
                emRef.current?.focus();
              }}
              isLinking={isLinking === "EM"}
              onStopReading={() => setIsLinking(null)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPersonnelDialog;

const Divider = () => (
  <div className="border-t w-full my-6 border-[#4F5B66]"></div>
);
