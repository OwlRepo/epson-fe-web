import { EpsonLogoWhite } from "@/assets/svgs";
import { Header } from "@/components/ui/header";
import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Star } from "lucide-react";
import * as React from "react";

interface DeviceManagementLayoutProps {
  children: React.ReactNode;
  userProfile?: {
    name: string;
    role: string;
    image?: string;
  };
  defaultCollapsed?: boolean;
  className?: string;
}

export function DeviceManagementLayout({
  children,

  userProfile = {
    name: "Ethan Blackwood",
    role: "HR Manager",
  },
  defaultCollapsed = false,
  className,
}: DeviceManagementLayoutProps) {
  const [collapsed] = React.useState(defaultCollapsed);

  // Default nav items for the sidebar
  const navItems = [
    {
      icon: <LayoutDashboard />,
      label: "Dashboard",
      href: "/device-management/dashboard",
      subItems: [
        {
          label: "Overview",
          href: "/device-management/dashboard/overview",
        },
        {
          label: "Mapping",
          href: "/device-management/dashboard/mapping",
        },
      ],
    },
  ];

  // Logo
  const logo = (
    <div className="w-full flex items-center justify-center">
      <EpsonLogoWhite className="w-[180px]" />
    </div>
  );

  // Collapsed logo
  const collapsedLogo = (
    <div className="w-full flex items-center justify-center">
      <EpsonLogoWhite className="w-[110px] rotate-90" />
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        defaultCollapsed={collapsed}
        navItems={navItems}
        logo={logo}
        collapsedLogo={collapsedLogo}
      />

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300"
        )}
      >
        {/* Header */}
        <Header userProfile={userProfile} />

        {/* Content area */}
        <main className={cn("flex-1 overflow-auto p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
