import { BounceLoader } from "react-spinners";
import { cn } from "@/lib/utils";
import { useLocation } from "@tanstack/react-router";
interface SpinnerProps {
  color?: string;
  size?: number;
  message?: string;
  containerClassName?: string;
  spinnerClassName?: string;
  type?:'button' | 'table'
}

export default function Spinner({
  color = "#1e3a8a",
  size = 100,
  message,
  containerClassName,
  spinnerClassName,
  type='table'
}: SpinnerProps) {
  const location = useLocation();
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center h-full w-full",
        containerClassName
      )}
    >
      <BounceLoader
        color={
          location.pathname.includes("evacuation-monitoring") && type !=='button'
            ? "#980000"
            : color
        }
        size={size}
        className={spinnerClassName}
      />
      {message && <p className="text-lg font-bold">{message}</p>}
    </div>
  );
}
