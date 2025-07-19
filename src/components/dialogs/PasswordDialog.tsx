import { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";

const PasswordDialogContent = ({
  onSetPassword,
}: {
  onSetPassword: (data: any) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, formState, watch } = useForm();

  const password = watch("Password");
  return (
    <DialogContent>
      <DialogHeader className="flex flex-row justify-between items-center mb-6">
        <DialogTitle className="text-xl font-semibold text-gray-800">
          Password
        </DialogTitle>
      </DialogHeader>
      <div>
        <div className="relative">
          <Input
            {...register("Password", { required: "Password is required" })}
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Password"
            className="h-[44px]"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
      </div>
      <div className="relative">
        <Input
          {...register("ConfirmPassword", {
            validate: (value) => value === password || "Passwords do not match",
          })}
          type={showConfirmPassword ? "text" : "password"}
          id="password"
          placeholder="Confirm Password"
          className="h-[44px]"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </div>
      {formState.errors.Password && (
        <p className="text-xs text-red-600">
          {String(formState?.errors.Password.message || "")}
        </p>
      )}

      {formState.errors.ConfirmPassword && (
        <p className="text-xs text-red-600">
          {String(formState?.errors.ConfirmPassword.message || "")}
        </p>
      )}
      <Button onClick={handleSubmit((data) => onSetPassword(data))}>
        Set Password
      </Button>
    </DialogContent>
  );
};

export default PasswordDialogContent;
