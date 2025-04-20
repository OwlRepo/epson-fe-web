import { cn } from "@/lib/utils";

interface DepartmentCardProps {
  title: string;
  clockedIn: number;
  clockedOut: number;
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
    <div className={cn("bg-blue-50 rounded p-6 flex flex-col", className)} onClick={onClick}>
      <h3 className="font-bold mb-1 text-2xl">{title}</h3>
      <p className="text-xs text-gray-500 mb-10">Department</p>

      <div className="flex justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{clockedIn}</span>
          <span className="text-xs text-gray-600">Clocked In</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{clockedOut}</span>
          <span className="text-xs text-gray-600">Clocked Out</span>
        </div>
      </div>
    </div>
  );
}
