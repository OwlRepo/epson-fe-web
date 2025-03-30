import * as React from "react";
import { cn } from "@/lib/utils";

interface DepartmentCardProps {
  title: string;
  timeIn: number;
  timeOut: number;
  className?: string;
}

export function DepartmentCard({
  title,
  timeIn,
  timeOut,
  className,
}: DepartmentCardProps) {
  return (
    <div className={cn("bg-blue-50 rounded-md p-4 flex flex-col", className)}>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">Department</p>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{timeIn}</span>
          <span className="text-xs text-gray-600">Time In</span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{timeOut}</span>
          <span className="text-xs text-gray-600">Time Out</span>
        </div>
      </div>
    </div>
  );
}
