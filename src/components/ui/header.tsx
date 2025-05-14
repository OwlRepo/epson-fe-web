import { cn } from "@/lib/utils";
import { useRouterState } from "@tanstack/react-router";
import { Breadcrumbs } from "./breadcrumbs";

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

  // Get page title from the last segment of the URL
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathSegments.length > 0
    ? pathSegments[pathSegments.length - 1].split("_").join(" ").replace(/-/g, " ")
    : "";

  return (
    <header className={cn("bg-white px-6 py-4", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Page title and breadcrumbs */}
          <div className="space-y-1">
            <h1 className="text-[2rem] font-bold text-[#1a2b4b] capitalize">
              {pageTitle}
            </h1>
            <Breadcrumbs />
          </div>

          {/* User profile area */}
          {userProfile && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="font-medium">{userProfile.name}</span>
                <span className="text-xs text-gray-500">
                  {userProfile.role}
                </span>
              </div>
              <div className="h-8 w-8 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                {userProfile.image ? (
                  <img
                    src={userProfile.image}
                    alt={userProfile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-800 font-medium text-sm">
                    {userProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
