import { forwardRef, useState, type ForwardedRef } from "react";
import { Input } from "../ui/input";
import { Button, type ButtonProps } from "../ui/button";
import Spinner from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ConfirmationDialog } from "../dialogs/ConfirmationDialog";

export type CardType = "UHF" | "MIFARE" | "EM" | null;

export interface LinkCardInputProps {
  value?: string;
  isLinking: boolean;
  isDeviceConnected?: boolean;
  label?: string;
  onLinkCard?: () => void;
  onUnlinkCard?: () => void;
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
      onUnlinkCard,
      onStopReading,
      variant,
      errors,
      name,
    }: LinkCardInputProps,
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
      setIsOpen(false);
      onUnlinkCard?.();
    };

    return (
      <>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={variant}
                  className=" text-white px-4 py-2 rounded text-sm font-semibold self-end w-32"
                >
                  Action
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={onLinkCard}>
                  Replace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsOpen(true)}>
                  Unlink
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        <ConfirmationDialog
          onConfirm={handleConfirm}
          onOpenChange={setIsOpen}
          open={isOpen}
          Title="Unlink Card"
          Description="Are you sure you want to unlink this card? This action cannot be undone."
        />
      </>
    );
  }
);
