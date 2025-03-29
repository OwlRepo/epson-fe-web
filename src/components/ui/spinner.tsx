import { BounceLoader } from "react-spinners";

interface SpinnerProps {
  color?: string;
  size?: number;
  message?: string;
}

export default function Spinner({
  color = "#000",
  size = 100,
  message,
}: SpinnerProps) {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <BounceLoader color={color} size={size} />
      {message && <p className="text-lg font-bold">{message}</p>}
    </div>
  );
}
