import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
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
import { useEffect, useMemo, useState } from "react";
import { getEVSAppBaseUrl, getIsEVS } from "@/utils/env";
import { validateSession } from "../route";

export const Route = createFileRoute("/_authenticated/modules")({
  component: RouteComponent,
  beforeLoad: () => {
    if (getIsEVS()) {
      throw redirect({ to: "/evacuation-monitoring" });
    }
  },
});

// const moduleRoutes = [
//   {
//     path: "/attendance-monitoring/dashboard/overview",
//     title: "Attendance",
//     icon: AttendanceMonitoring,
//     subtitle: "Monitoring",
//     key: "AMS",
//     external: false,
//   },
//   {
//     path: "/visitor-management",
//     title: "Visitor",
//     icon: VisitorManagement,
//     subtitle: "Management",
//     key: "VMS",
//     external: false,
//   },
//   {
//     path: `${getEVSAppBaseUrl()}/validate-session?token=${encodeURIComponent(
//       localStorage.getItem("token")!
//     )}`,
//     title: "Evacuation",
//     icon: EvacuationMonitoring,
//     subtitle: "Monitoring",
//     key: "EVS",
//     external: true,
//   },
//   {
//     path: "/user-management",
//     title: "User",
//     icon: UserManagement,
//     subtitle: "Management",
//     key: "UMG",
//     external: false,
//   },
//   {
//     path: "/device-management",
//     title: "Device",
//     icon: DeviceManagement,
//     subtitle: "Management",
//     key: "DMG",
//     external: false,
//   },
// ];

function RouteComponent() {
  const [evsUrl, setEvsUrl] = useState<string | null>(
    localStorage.getItem("evsURL") ?? null
  );
  const moduleRoutes = useMemo(
    () => [
      {
        path: "/attendance-monitoring/dashboard/overview",
        title: "Attendance",
        icon: AttendanceMonitoring,
        subtitle: "Monitoring",
        key: "AMS",
        external: false,
      },
      {
        path: "/visitor-management",
        title: "Visitor",
        icon: VisitorManagement,
        subtitle: "Management",
        key: "VMS",
        external: false,
      },
      {
        path: evsUrl,
        title: "Evacuation",
        icon: EvacuationMonitoring,
        subtitle: "Monitoring",
        key: "EVS",
        external: true,
      },
      {
        path: "/user-management",
        title: "User",
        icon: UserManagement,
        subtitle: "Management",
        key: "UMG",
        external: false,
      },
      {
        path: "/device-management",
        title: "Device",
        icon: DeviceManagement,
        subtitle: "Management",
        key: "DMG",
        external: false,
      },
    ],
    [evsUrl]
  );

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "evsURL") {
        setEvsUrl(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key: string, value: string) {
      originalSetItem.apply(this, [key, value]);
      if (key === "evsURL") {
        setEvsUrl(value);
      }
    };

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const navigate = useNavigate();
  const userName =
    JSON.parse(localStorage.getItem("user")!)?.Name ??
    JSON.parse(localStorage.getItem("user")!)?.EmailAddress;
  const userInitials =
    JSON.parse(localStorage.getItem("user")!)?.Initials ?? "-";
  const userRole = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)?.Role
    : "";

  const modules = moduleRoutes.filter((module) => {
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!)
      : null;
    return user?.Access?.includes(module.key);
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate({ to: "/" });
  };

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
          userInitials={userInitials}
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
              subtitle={module.subtitle ?? ""}
              href={module.path ?? ""}
              external={module.external}
              onHover={() => {
                if (module.path === evsUrl) {
                  validateSession();
                }
              }}
              className="w-full lg:w-[320px] border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors"
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-4 sm:mt-6 lg:mt-8 text-center text-xs sm:text-sm px-4 py-10">
        <p>Copyright ©2025 Produced by ELD Technology Intl, Inc.</p>
        <p>version 1.2.0</p>
      </div>
    </div>
  );
}
