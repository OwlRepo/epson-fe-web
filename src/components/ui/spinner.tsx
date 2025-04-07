import { BounceLoader } from "react-spinners";
import { cn } from "@/lib/utils";
interface SpinnerProps {
  color?: string;
  size?: number;
  message?: string;
  containerClassName?: string;
  spinnerClassName?: string;
}

export default function Spinner({
  color = "#1e3a8a",
  size = 100,
  message,
  containerClassName,
  spinnerClassName,
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center items-center h-full w-full",
        containerClassName
      )}
    >
      <BounceLoader color={color} size={size} className={spinnerClassName} />
      {message && <p className="text-lg font-bold">{message}</p>}
    </div>
  );
}
