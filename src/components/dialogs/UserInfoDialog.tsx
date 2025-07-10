import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import Spinner from "../ui/spinner";
import type { DialogProps } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";

import { Switch } from "../ui/switch";

import { useEffect, useState } from "react";
import PasswordDialogContent from "./PasswordDialog";
import ModuleSelection from "../inputs/ModuleSelection";
import { useUpdateUser } from "@/hooks/mutation/useUpdateUser";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";

interface UserInfoDialogProps extends DialogProps {
  user?: User;
  isLoading?: boolean;
}
interface User {
  ID: string;
  EmployeeID: string;
  Name: string;
  Email: string;
  Role: string;
  Access: string[];
  IsActive: boolean;
}

const UserInfoDialog = ({
  open,
  onOpenChange,
  user,
  isLoading,
}: UserInfoDialogProps) => {
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const { errorStyle, successStyle } = useToastStyleTheme();

  const [isActive, setIsActive] = useState(false);
  const [access, setAccess] = useState<string[]>([]);
  const [password, setPassword] = useState<string>("");

  const { mutate: updateUser, isSuccess, isError, error } = useUpdateUser();

  const isDirty =
    isActive !== (user?.IsActive || false) ||
    access.join(",") !== (user?.Access || []).join(",") ||
    password;

  const handleUpdateUser = () => {
    updateUser({
      employeeID: user?.EmployeeID || "",
      payload: {
        IsActive: isActive,
        Access: access,
        Password: password,
      },
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
    }
    if (isSuccess) {
      toast.success("User saved Successfully!", {
        description: "You're all set!",
        style: successStyle,
      });
      onOpenChange?.(false);
    }
  }, [isError, isSuccess]);

  useEffect(() => {
    if (user) {
      setAccess(user.Access || []);
      setIsActive(user.IsActive || false);
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!openPasswordDialog && (
        <DialogContent className="sm:max-w-[500px] p-8 bg-white rounded-lg shadow-xl">
          <DialogHeader className="flex flex-row justify-between items-center mb-6">
            <DialogTitle className="text-xl font-semibold text-gray-800">
              User Information
            </DialogTitle>
          </DialogHeader>
          {isLoading && <Spinner />}
          {!isLoading && (
            <div>
              <p>{`ID: ${user?.ID}`}</p>
              <h2 className="text-2xl font-bold text-primary mt-1">
                {user?.Name}
              </h2>
              <p>{`Email: ${user?.Email}`}</p>

              <div className="border my-8" />

              <h2 className="text-lg font-bold text-primary mt-1">Status:</h2>
              <p className="text-sm">Enable or Disable User Access</p>
              <div className="mt-2 flex items-center gap-4">
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    setIsActive(checked);
                  }}
                  className={cn(
                    "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                  )}
                />
                <p>Active user</p>
              </div>

              <div className="border my-8" />
              <h2 className="text-lg font-bold text-primary mt-1">
                Assign Modules Accessible to the User
              </h2>
              <p className="text-sm">Enable or Disable User Access</p>

              <div className="mt-2">
                <ModuleSelection
                  value={access}
                  onChange={(value) => {
                    setAccess(value);
                  }}
                />
              </div>

              <div className="border my-8" />

              <div className="flex gap-2 justify-end">
                <Button onClick={() => setOpenPasswordDialog(true)}>
                  Change Password
                </Button>
                <Button disabled={!isDirty} onClick={handleUpdateUser}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      )}
      {openPasswordDialog && (
        <PasswordDialogContent
          onSetPassword={(data) => {
            setPassword(data);
            setOpenPasswordDialog(false);
          }}
        />
      )}
    </Dialog>
  );
};

export default UserInfoDialog;
