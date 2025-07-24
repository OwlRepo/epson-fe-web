import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import type {
  FieldErrors,
  UseFormRegister,
  Path,
  FieldValues,
} from "react-hook-form";

interface TextInputProps<T extends FieldValues> {
  label: string;
  id: string;
  name: Path<T>;
  placeholder?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  required?: boolean;
  readOnly?: boolean;
}

const TextInput = <T extends FieldValues>({
  label,
  id,
  name,
  placeholder,
  register,
  errors,
  required = true,
  readOnly = false,
}: TextInputProps<T>) => {
  return (
    <div className="space-y-1 w-full">
      <div className="flex justify-between">
        <label htmlFor={id} className="text-sm font-normal text-gray-700">
          {label}
        </label>
        {!required && !readOnly && (
          <label htmlFor={id} className="text-sm font-normal text-gray-700">
            Optional
          </label>
        )}
      </div>
      <Input
        type="text"
        id={id}
        placeholder={placeholder}
        className={cn(
          "h-[44px] last",
          readOnly && "cursor-not-allowed text-gray-500"
        )}
        {...register(
          name,
          required ? { required: `${label} is required` } : {}
        )}
        readOnly={readOnly}
      />
      {errors[name] && (
        <p className="text-sm text-red-500 w-full">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
};

export default TextInput;
