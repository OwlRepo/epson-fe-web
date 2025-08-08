import { EpsonLogoWhite } from "@/assets/svgs";
import { Header } from "@/components/ui/header";
import { Sidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard, Star } from "lucide-react";
import * as React from "react";

interface VisitorManagementLayoutProps {
  children: React.ReactNode;
  userProfile?: {
    name: string;
    role: string;
    image?: string;
  };
  defaultCollapsed?: boolean;
  className?: string;
}

export function VisitorManagementLayout({
  children,

  userProfile = {
    name: "Ethan Blackwood",
    role: "HR Manager",
  },
  defaultCollapsed = false,
  className,
}: VisitorManagementLayoutProps) {
  const [collapsed] = React.useState(defaultCollapsed);

  // Default nav items for the sidebar
  const navItems = [
    {
      icon: <LayoutDashboard />,
      label: "Dashboard",
      href: "/visitor-management/dashboard",
      subItems: [
        {
          label: "Overview",
          href: "/visitor-management/dashboard/overview",
        },
        {
          label: "Checkin Visitor",
          href: "/visitor-management/dashboard/check-in-visitor",
        },
      ],
    },
    {
      icon: <Star />,
      label: "Reserved Guest",
      href: "/visitor-management/reserved-guest",
      subItems: [
        {
          label: "Guest List",
          href: "/visitor-management/reserved-guest/guest-list",
        },
        {
          label: "Register Guest",
          href: "/visitor-management/reserved-guest/register-guest",
        },
      ],
    },
    {
      icon: <FileText />,
      label: "Reports",
      href: "/visitor-management/reports",
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
