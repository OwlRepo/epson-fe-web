import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Moon, RefreshCw, SunMedium } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/attendance-monitoring/settings"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-row gap-2">
      {/* first col */}
      <div className="bg-white basis-1/3 p-4 rounded-lg shadow-md">
        <p className="font-bold flex gap-2 te">
          <RefreshCw />
          Scheduled Syncing
        </p>
        <SyncTimeInput icon={<SunMedium />} time="6:00AM" />
        <SyncTimeInput icon={<Moon />} time="5:00PM" />

        <p className="mt-4 font-bold text-center">or</p>
        <Button className=" bg-blue-900 w-full mt-4">Sync Now</Button>
      </div>

      {/* 2nd col */}
      <div className="bg-white basis-2/3 p-4 rounded-lg shadow-md ">
        <p className="font-extrabold">List of Activities</p>
        <div className="flex gap-4">
          <button className="inline-flex items-center gap-1 border rounded-md px-3 py-1.5 text-sm hover:bg-gray-50">
            Activity <ChevronDown className="h-4 w-4 ml-1" />
          </button>
          <button className="inline-flex items-center gap-1 border rounded-md px-3 py-1.5 text-sm hover:bg-gray-50">
            Date & Time <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface SyncTimeInputProps {
  icon?: React.ReactNode;
  time: string;
  onEdit?: () => void;
}

const SyncTimeInput = ({
  icon = undefined,
  time,
  onEdit,
}: SyncTimeInputProps) => {
  return (
    <div className="bg-neutral-100 rounded-xl p-2 flex justify-between items-center mt-4">
      <p className="flex ml-2 gap-2 text-neutral-600">
        {icon}
        {time}
      </p>
      <Button onClick={onEdit} className="bg-blue-900">
        Edit
      </Button>
    </div>
  );
};
