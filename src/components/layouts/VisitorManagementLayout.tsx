import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Star,
} from "lucide-react";

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
      label: "VIP",
      href: "/visitor-management/vip",
    },
  ];

  // Logo
  const logo = (
    <div className="h-8 w-full bg-blue-800 rounded flex items-center justify-center">
      <span className="font-bold text-white">EPSON</span>
    </div>
  );

  // Collapsed logo
  const collapsedLogo = (
    <div className="h-8 w-8 bg-blue-800 rounded flex items-center justify-center">
      <span className="font-bold text-white text-sm">E</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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
