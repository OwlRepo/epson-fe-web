import { cn } from "@/lib/utils";
import formatCountWithCommas from "@/utils/formatCountWithCommas";

interface DepartmentCardProps {
  title: string;
  clockedIn: number | string | undefined;
  clockedOut: number | string | undefined;
  countLabelLeft?: string;
  countLabelRight?: string;
  className?: string;
  onClick?: () => void;
  type?: "evs" | "ams" | "entry-exit";
}

export function DepartmentCard({
  title,
  clockedIn,
  clockedOut,
  countLabelLeft,
  countLabelRight,
  className,
  onClick,
  type = "ams",
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
        <h3 className="font-bold mb-1 text-3xl break-words">{title}</h3>
        <h3 className="text-xl">
          {type === "ams"
            ? "Total Employees: "
            : type === "evs"
              ? "Total Man Power: "
              : ""}
          {type !== "entry-exit" &&
            formatCountWithCommas(
              (() => {
                const inNum = Number(clockedIn ?? 0);
                const outNum = Number(clockedOut ?? 0);
                const total = inNum + outNum;
                return Number.isNaN(total) ? 0 : total;
              })()
            )}
        </h3>
        {/* <p className="text-xs text-gray-500 mb-10">{title}</p> */}
      </div>

      <div className="flex justify-between mt-auto">
        {clockedIn !== undefined && (
          <div className="flex flex-col text-[#0F0098]">
            <span className="text-5xl font-bold ">
              {formatCountWithCommas(clockedIn)}
            </span>
            <span>{countLabelLeft ? countLabelLeft : "Time In"}</span>
          </div>
        )}
        {clockedOut !== undefined && (
          <div className="flex flex-col text-[#980000]">
            <span className="text-5xl font-bold">
              {formatCountWithCommas(clockedOut)}
            </span>
            <span>{countLabelRight ? countLabelRight : "Time Out"}</span>
          </div>
        )}
      </div>
    </div>
  );
}
