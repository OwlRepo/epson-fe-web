import { cn } from "@/lib/utils";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Breadcrumbs } from "./breadcrumbs";
import UserProfile from "./user-profile";
import { useEffect } from "react";

// Module mapping for proper display names
const moduleMap: Record<string, string> = {
  "attendance-monitoring": "AMS",
  "visitor-management": "VMS",
  "evacuation-monitoring": "EVS",
  "user-management": "UMS",
  "device-management": "DMG",
  modules: "Smart Management Modules",
  home: "Home",
};

interface HeaderProps {
  userProfile?: {
    name: string;
    role: string;
    image?: string;
  };
  className?: string;
}

export function Header({ userProfile, className }: HeaderProps) {
  const { location } = useRouterState();
  const navigate = useNavigate();

  const userName =
    JSON.parse(localStorage.getItem("user")!).Name ??
    JSON.parse(localStorage.getItem("user")!).EmailAddress;

  const userInitials =
    JSON.parse(localStorage.getItem("user")!).Initials ?? "-";

  const userRole = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).Role
    : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate({ to: "/" });
  };

  // Get page title from the last segment of the URL
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const pageTitle =
    pathSegments.length > 0
      ? pathSegments[pathSegments.length - 1]
          .split("_")
          .join(" ")
          .replace(/-/g, " ")
      : "";

  // Set document title based on current route
  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    // Get the module name (first segment after authenticated routes)
    let moduleName = "";
    if (pathSegments.length > 0) {
      const moduleKey = pathSegments[0];
      moduleName = moduleMap[moduleKey] || "";
    }

    // Get the last path segment and format it
    const lastSegment =
      pathSegments.length > 0
        ? pathSegments[pathSegments.length - 1]
            .split("_")
            .join(" ")
            .replace(/-/g, " ")
            .replace(/%20/g, " ")
            .split("%2")
            .join(" ")
        : "";

    // Format the last segment as title case
    const formattedLastSegment = lastSegment
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // Set the document title
    if (moduleName && formattedLastSegment) {
      document.title = `${moduleName} - ${formattedLastSegment}`;
    } else if (moduleName) {
      document.title = moduleName;
    } else if (formattedLastSegment) {
      document.title = formattedLastSegment;
    } else {
      document.title = "Epson System"; // Default fallback
    }
  }, [location.pathname]);

  return (
    <header className={cn("bg-white px-6 py-4", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Page title and breadcrumbs */}
          <div className="space-y-1">
            <h1 className="text-[2rem] font-bold text-[#1a2b4b] capitalize">
              {pageTitle
                .split("_")
                .join(" ")
                .replace(/-/g, " ")
                .replace(/%20/g, " ")
                .split("%2")
                .join(" ")}
            </h1>
            <Breadcrumbs />
          </div>

          {/* User profile area */}
          {userProfile && (
            <UserProfile
              userName={userName}
              userInitials={userInitials}
              userRole={userRole}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}
