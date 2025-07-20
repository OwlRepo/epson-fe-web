import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  LoginBackground,
  AttendanceMonitoring,
  DeviceManagement,
  EvacuationMonitoring,
  UserManagement,
  VisitorManagement,
} from "@/assets/svgs";
import { EPSON_LOGO_NORMAL } from "@/assets/images";
import { ModuleCard } from "@/components/ui/module-card";
import UserProfile from "@/components/ui/user-profile";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/modules")({
  component: RouteComponent,
});

const moduleRoutes = [
  {
    path: "/attendance-monitoring/dashboard/overview",
    title: "Attendance",
    icon: AttendanceMonitoring,
    subtitle: "Monitoring",
    key: "AMS",
  },
  {
    path: "/visitor-management",
    title: "Visitor",
    icon: VisitorManagement,
    subtitle: "Management",
    key: "VMS",
  },
  {
    path: "/evacuation-monitoring",
    title: "Evacuation",
    icon: EvacuationMonitoring,
    subtitle: "Monitoring",
    key: "EVS",
  },
  {
    path: "/user-management",
    title: "User",
    icon: UserManagement,
    subtitle: "Management",
    key: "UMS",
  },
  {
    path: "/device-management",
    title: "Device",
    icon: DeviceManagement,
    subtitle: "Management",
    key: "DMG",
  },
];

function RouteComponent() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).EmailAddress
    : "";
  const userRole = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).Role
    : "";

  const modules = moduleRoutes.filter((module) => {
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null;
    return user?.Access?.includes(module.key);
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate({ to: "/" });
  };

  // Set document title for modules page
  useEffect(() => {
    document.title = "Smart Management Modules";
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-gray-50 px-6 py-4">
      {/* Background */}
      <LoginBackground className="absolute h-full w-full" />

      {/* Header */}
      <div className="relative z-10 mb-8 flex items-center justify-between p-5">
        <img src={EPSON_LOGO_NORMAL} alt="Epson Logo" className="h-8" />

        <UserProfile
          userName={userName}
          userRole={userRole}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 mx-auto w-full max-w-[1300px] min-h-[800px] rounded-3xl bg-white p-4 sm:p-8 lg:p-16 shadow-lg">
        {/* Title */}
        <h1 className="mb-12 sm:mb-16 lg:mb-20 text-2xl sm:text-3xl font-bold text-gray-600">
          Smart Management Modules
        </h1>

        {/* Modules Grid */}
        <div className="flex flex-row flex-wrap justify-center items-center gap-20 min-h-[500px] min-w-[600px]">
          {modules.map((module) => (
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

      {/* Footer */}
      <div className="relative z-10 mt-4 sm:mt-6 lg:mt-8 text-center text-xs sm:text-sm px-4 py-10">
        <p>Copyright ©2024 Produced by ELD Technology Intl, Inc.</p>
        <p>version 1.0.0</p>
      </div>
    </div>
  );
}
