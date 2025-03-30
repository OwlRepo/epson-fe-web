import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import {
  HomeIcon,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  ArrowLeftToLine,
} from "lucide-react";

interface AttendanceMonitoringLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  userProfile?: {
    name: string;
    role: string;
    image?: string;
  };
  defaultCollapsed?: boolean;
  className?: string;
}

export function AttendanceMonitoringLayout({
  children,
  title,
  subtitle,
  backLink,
  backText,
  userProfile = {
    name: "Ethan Blackwood",
    role: "HR Manager",
  },
  defaultCollapsed = false,
  className,
}: AttendanceMonitoringLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // Default nav items for the sidebar
  const navItems = [
    {
      icon: <LayoutDashboard />,
      label: "Dashboard",
      href: "/attendance_monitoring/dashboard",
      subItems: [
        {
          label: "Overview",
          href: "/attendance-monitoring/dashboard/overview",
        },
        {
          label: "Departments",
          href: "/attendance-monitoring/dashboard/departments",
        },
        {
          label: "Entry & Exit Points",
          href: "/attendance-monitoring/dashboard/entry-exit",
        },
      ],
    },
    {
      icon: <Users />,
      label: "Employees",
      href: "/attendance-monitoring/employees",
    },
    {
      icon: <FileText />,
      label: "Reports",
      href: "/attendance-monitoring/reports",
      subItems: [
        {
          label: "Daily Reports",
          href: "/attendance-monitoring/reports/daily",
        },
        {
          label: "Weekly Summary",
          href: "/attendance-monitoring/reports/weekly",
        },
        {
          label: "Monthly Analytics",
          href: "/attendance-monitoring/reports/monthly",
        },
      ],
    },
    {
      icon: <Settings />,
      label: "Settings",
      href: "/attendance-monitoring/settings",
      subItems: [
        {
          label: "User Settings",
          href: "/attendance-monitoring/settings/user",
        },
        {
          label: "System Settings",
          href: "/attendance-monitoring/settings/system",
        },
        {
          label: "Permissions",
          href: "/attendance-monitoring/settings/permissions",
        },
      ],
    },
    {
      icon: <HelpCircle />,
      label: "Help & Support",
      href: "/attendance-monitoring/help",
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
