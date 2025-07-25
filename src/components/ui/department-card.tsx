import { cn } from "@/lib/utils";
import formatCountWithCommas from "@/utils/formatCountWithCommas";

interface DepartmentCardProps {
  title: string;
  clockedIn: number | string | undefined;
  clockedOut: number | string | undefined;
  className?: string;
  onClick?: () => void;
}

export function DepartmentCard({
  title,
  clockedIn,
  clockedOut,
  className,
  onClick,
}: DepartmentCardProps) {
  return (
    <div
      className={cn(
        "bg-blue-50 rounded p-6 flex flex-col h-full justify-between min-h-[200px] space-y-20",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col space-y-2">
        <h3 className="font-bold mb-1 text-2xl break-words">{title}</h3>
        {/* <p className="text-xs text-gray-500 mb-10">{title}</p> */}
      </div>

      <div className="flex justify-between mt-auto">
        {clockedIn !== undefined && (
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {formatCountWithCommas(clockedIn)}
            </span>
            <span className="text-xs text-gray-600">Incoming</span>
          </div>
        )}
        {clockedOut !== undefined && (
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {formatCountWithCommas(clockedOut)}
            </span>
            <span className="text-xs text-gray-600">Outgoing</span>
          </div>
        )}
      </div>
    </div>
  );
}
