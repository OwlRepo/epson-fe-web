import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginBackground } from "@/assets/svgs";
import {
  ATTENDANCE_MONITORING,
  DEVICE_MANAGEMENT,
  EPSON_LOGO_NORMAL,
  EVACUATION_MONITORING,
  USER_MANAGEMENT,
  VISITOR_MANAGEMENT,
} from "@/assets/images";
import { ModuleCard } from "@/components/ui/module-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut } from "lucide-react";

// Helper function to truncate text
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + ".";
}

export const Route = createFileRoute("/_authenticated/modules")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const userName = "Kindred Ino.";
  const userRole = "HR Manager";
  const truncatedName = truncateText(userName, 12);
  const moduleRoutes = [
    {
      path: "/attendance-monitoring/dashboard/overview",
      title: "Attendance",
      icon: ATTENDANCE_MONITORING,
      subtitle: "Monitoring",
    },
    {
      path: "/visitor-management",
      title: "Visitor",
      icon: VISITOR_MANAGEMENT,
      subtitle: "Management",
    },
    {
      path: "/evacuation-monitoring",
      title: "Evacuation",
      icon: EVACUATION_MONITORING,
      subtitle: "Monitoring",
    },
    {
      path: "/user-management",
      title: "User",
      icon: USER_MANAGEMENT,
      subtitle: "Management",
    },
    {
      path: "/device-management",
      title: "Device",
      icon: DEVICE_MANAGEMENT,
      subtitle: "Management",
    },
  ];
  return (
    <div className="relative min-h-screen w-full bg-gray-50 px-6 py-4">
      {/* Background */}
      <LoginBackground className="absolute h-full w-full" />

      {/* Header */}
      <div className="relative z-10 mb-8 flex items-center justify-between p-5">
        <img src={EPSON_LOGO_NORMAL} alt="Epson Logo" className="h-8" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-auto items-center gap-3 rounded-lg px-3 py-2 hover:bg-transparent shadow-none"
            >
              <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-200" />
              <div className="text-left">
                <div className="font-medium" title={userName}>
                  {truncatedName}
                </div>
                <div className="text-sm text-gray-500">{userRole}</div>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="mt-1 w-[180px] rounded-xl bg-white p-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          >
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#FF4D4D] focus:bg-gray-50 focus:text-[#FF4D4D]">
              <LogOut
                className="h-5 w-5"
                onClick={() => {
                  navigate({
                    to: "/",
                  });
                }}
              />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 mx-auto w-full max-w-[1300px] min-h-[800px] rounded-3xl bg-white p-4 sm:p-8 lg:p-16 shadow-lg">
        {/* Title */}
        <h1 className="mb-12 sm:mb-16 lg:mb-20 text-2xl sm:text-3xl font-bold text-gray-600">
          Smart Management Modules
        </h1>

        {/* Modules Grid */}
        <div className="flex flex-col justify-center gap-20 min-h-[500px]">
          {/* First row - 3 modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 place-items-center">
            {moduleRoutes.slice(0, 3).map((module) => (
              <ModuleCard
                key={module.path}
                icon={module.icon}
                title={module.title}
                subtitle={module.subtitle}
                href={module.path}
                className="w-full lg:w-[320px] border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors"
              />
            ))}
          </div>
          {/* Second row - 2 modules centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 lg:w-2/3 mx-auto place-items-center">
            {moduleRoutes.slice(3).map((module) => (
              <ModuleCard
                key={module.path}
                icon={module.icon}
                title={module.title}
                subtitle={module.subtitle}
                href={module.path}
                className="w-full lg:w-[320px] border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-4 sm:mt-6 lg:mt-8 text-center text-xs sm:text-sm px-4 py-10">
        <p>Copyright ©2024 Produced by ELD Technology Intl, Inc.</p>
        <p>version 1.0.0</p>
      </div>
    </div>
  );
}
