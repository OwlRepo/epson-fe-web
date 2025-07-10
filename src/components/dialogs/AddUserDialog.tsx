import { useAddUser } from "@/hooks/mutation/useAddUser";
import { useGetRoles } from "@/hooks/query/useGetRoles";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import type { UserData } from "@/routes/_authenticated/user-management/list-of-users";
import { DialogTitle, type DialogProps } from "@radix-ui/react-dialog";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { useGetHostPerson } from "@/hooks/query/useGeHostPersonList";

import { Controller, useForm } from "react-hook-form";
import { AsyncAutoComplete } from "../inputs/AsyncAutoComplete";
import { AutoComplete } from "../inputs/AutoComplete";
import PasswordDialogContent from "./PasswordDialog";
import ModuleSelection from "../inputs/ModuleSelection";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

const AddUserDialog = ({ open, onOpenChange }: DialogProps) => {
  const { errorStyle, successStyle } = useToastStyleTheme();
  const form = useForm<UserData>();

  const [showPassword, setShowPassword] = useState(false);
  const [errResponse, setErrResponse] = useState<string>("");

  const { register, handleSubmit, formState, setValue, watch, control } = form;

  const { mutate: saveUser, isSuccess, isError, error } = useAddUser();

  const { data: roles } = useGetRoles();

  useEffect(() => {
    if (isError) {
      toast.error("Oops! Saving error!", {
        description:
          (error as any)?.response?.data?.message ??
          "An unknown error occurred",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
      setErrResponse((error as any)?.response?.data?.message || "");
    }
    if (isSuccess) {
      toast.success("User saved Successfully!", {
        description: "You're all set!",
        style: successStyle,
      });
      onOpenChange?.(false);
    }
  }, [isError, isSuccess]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        {open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        )}

        {!showPassword && (
          <DialogContent className="w-auto p-8 bg-white rounded-lg shadow-xl">
            <DialogHeader className="flex flex-row justify-between items-center mb-6">
              <DialogTitle className="text-xl font-semibold text-gray-800">
                Add User
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-8">
              <div className="w-full  flex flex-col">
                <h2 className="text-lg font-bold text-primary mt-1">
                  User Info
                </h2>
                <AsyncAutoComplete
                  required={true}
                  withID
                  label="Employee"
                  name={"Name"}
                  id="employee"
                  setValue={setValue}
                  watch={watch}
                  register={register}
                  errors={formState?.errors}
                  readOnly={false}
                  queryHook={useGetHostPerson}
                />
              </div>
              <div className="w-full  flex flex-col ">
                <h2 className="text-lg font-bold text-primary mt-1">Status:</h2>
                <p className="text-sm">Enable or Disable User Access</p>

                <div className="mt-2 flex items-center gap-4">
                  <Controller
                    name="IsActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    )}
                  />
                  <p>Active user</p>
                </div>
              </div>
            </div>

            <div className="border my-8" />

            <div className="grid grid-cols-2 gap-8">
              <div className="w-full  flex flex-col">
                <h2 className="text-lg font-bold text-primary mt-1">
                  User Role
                </h2>
                <AutoComplete
                  required={true}
                  label="Role"
                  name={"Role"}
                  id="role"
                  setValue={setValue}
                  watch={watch}
                  register={register}
                  errors={formState?.errors}
                  list={roles}
                />
              </div>
              <div className="w-full  flex flex-col">
                <h2 className="text-lg font-bold text-primary mt-1">
                  Access to Modules:
                </h2>
                <p className="text-sm">Assign Modules Accessible to the User</p>

                <Controller
                  name="Access"
                  control={control}
                  render={({ field }) => (
                    <ModuleSelection
                      value={field?.value ?? []}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="border my-8" />
            {errResponse && (
              <p className="text-sm text-destructive">{errResponse}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={() => setShowPassword(true)}>
                Set Password
              </Button>
              <Button onClick={handleSubmit((data) => saveUser(data))}>
                Save User
              </Button>
            </div>
          </DialogContent>
        )}
        {showPassword && (
          <PasswordDialogContent
            onSetPassword={(data) => {
              setValue("Password", data?.Password);
              setShowPassword(false);
            }}
          />
        )}
      </Dialog>
    </>
  );
};

export default AddUserDialog;
