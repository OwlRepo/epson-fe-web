import { forwardRef, type ForwardedRef } from "react";
import { Input } from "../ui/input";
import { Button, type ButtonProps } from "../ui/button";
import { CheckCircle } from "lucide-react";
import Spinner from "../ui/spinner";

export type CardType = "UHF" | "MIFARE" | "EM" | null;

export interface LinkCardInputProps {
  value?: string;
  isLinking: boolean;
  isDeviceConnected?: boolean;
  label?: string;
  onLinkCard?: () => void;
  onClickConnect?: () => void;
  onStopReading?: () => void;
  variant?: ButtonProps["variant"];
  errors?: any;
  name?: any;
}

export const LinkCardInput = forwardRef(
  (
    {
      label,
      value,
      isLinking,
      onLinkCard,
      onStopReading,
      variant,
      errors,
      name,
    }: LinkCardInputProps,
    ref
  ) => {
    return (
      <div className="flex items-center gap-4 w-full">
        <div className="flex-grow w-full">
          <label
            htmlFor="rfidCard"
            className="text-xs text-gray-500 mb-1 block"
          >
            {label} {value && !isLinking && "Linked"}
          </label>
          <div className="relative">
            <Input
              ref={ref as ForwardedRef<HTMLInputElement>}
              id="rfidCard"
              type="text"
              value={value}
              readOnly
              className="bg-gray-100 border-gray-300 rounded w-full"
            />
            {isLinking && <p className=" text-xs absolute">Reading...</p>}
            {errors?.[name as any] && !isLinking && (
              <p className="text-sm text-red-500 w-full absolute">
                {errors[name as any]?.message as string}
              </p>
            )}
          </div>
        </div>
        {value && !isLinking && (
          <Button
            variant={variant}
            onClick={onLinkCard}
            className="bg-green-500 text-white px-4 py-2 rounded text-sm font-semibold self-end w-32"
          >
            <CheckCircle className="h-4 w-4 mr-1 inline-block" />
            Replace
          </Button>
        )}
        {!value && !isLinking && (
          <Button
            variant={variant}
            onClick={onLinkCard}
            className=" text-white px-4 py-2 rounded text-sm font-semibold self-end w-32"
          >
            Link a Card
          </Button>
        )}
        {isLinking && (
          <>
            <Button
              variant={variant}
              onClick={onStopReading}
              className=" text-white px-4 py-2 rounded text-sm font-semibold self-end w-32"
            >
              <Spinner size={15} color="white" containerClassName="w-auto" />
              Stop
            </Button>
          </>
        )}
      </div>
    );
  }
);
