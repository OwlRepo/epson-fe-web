import { DepartmentCard } from "@/components/ui/DepartmentCard";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentDate] = useState(() => {
    const now = new Date();
    // Format like "Saturday, Jan 2 2024, 09:25:48 AM (GMT +8)"
    return `${now.toLocaleDateString("en-US", { weekday: "long" })}, ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${now.toLocaleTimeString("en-US")} (GMT +8)`;
  });

  // Department data
  const departments = [
    { title: "ABBC", timeIn: 10, timeOut: 0 },
    { title: "CMD", timeIn: 50, timeOut: 0 },
    { title: "PCP", timeIn: 10, timeOut: 0 },
    { title: "PDEE", timeIn: 15, timeOut: 0 },
    { title: "PP", timeIn: 30, timeOut: 0 },
    { title: "PRDP", timeIn: 35, timeOut: 0 },
    { title: "QAE", timeIn: 30, timeOut: 0 },
    { title: "VP PD", timeIn: 24, timeOut: 0 },
    { title: "HRD", timeIn: 30, timeOut: 0 },
    { title: "ITD", timeIn: 24, timeOut: 0 },
    { title: "MIS", timeIn: 30, timeOut: 0 },
    { title: "R&D", timeIn: 24, timeOut: 0 },
  ];

  // Summary data
  const summaryItems = [
    { label: "Clocked In", value: "1,500", valueColor: "text-green-600" },
    { label: "Clocked Out", value: "0", valueColor: "text-red-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Overview section with date and department filter */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Overview</h2>
          <p className="text-sm text-gray-500 mt-1">As of {currentDate}</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Department</span>
          <button className="inline-flex items-center gap-1 border rounded px-3 py-1.5 text-sm hover:bg-gray-50">
            All Departments <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Total logs summary */}
      <div className="md:w-1/4">
        <SummaryCard title="Total Logs" items={summaryItems} />
      </div>

      {/* Departments grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {departments.map((dept, index) => (
          <DepartmentCard
            key={index}
            title={dept.title}
            timeIn={dept.timeIn}
            timeOut={dept.timeOut}
          />
        ))}
      </div>
    </div>
  );
}
