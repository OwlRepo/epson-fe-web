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
      icon: <HomeIcon className="text-gray-500" />,
      label: "Home",
      href: "/",
    },
    {
      icon: <LayoutDashboard className="text-gray-500" />,
      label: "Dashboard",
      isActive: true,
      href: "/_authenticated/attendance_monitoring/dashboard",
      subItems: [
        {
          label: "Overview",
          href: "/_authenticated/attendance_monitoring/dashboard",
        },
        {
          label: "Departments",
          href: "/_authenticated/attendance_monitoring/departments",
        },
        {
          label: "Entry & Exit Points",
          href: "/_authenticated/attendance_monitoring/entry-exit",
        },
      ],
    },
    {
      icon: <Users className="text-gray-500" />,
      label: "Employees",
      href: "/_authenticated/attendance_monitoring/employees",
    },
    {
      icon: <FileText className="text-gray-500" />,
      label: "Attendance Monitoring",
      href: "/_authenticated/attendance_monitoring/reports",
      subItems: [
        {
          label: "Daily Reports",
          href: "/_authenticated/attendance_monitoring/reports/daily",
        },
        {
          label: "Weekly Summary",
          href: "/_authenticated/attendance_monitoring/reports/weekly",
        },
        {
          label: "Monthly Analytics",
          href: "/_authenticated/attendance_monitoring/reports/monthly",
        },
      ],
    },
    {
      icon: <Settings className="text-gray-500" />,
      label: "Settings",
      href: "/_authenticated/attendance_monitoring/settings",
      subItems: [
        {
          label: "User Settings",
          href: "/_authenticated/attendance_monitoring/settings/user",
        },
        {
          label: "System Settings",
          href: "/_authenticated/attendance_monitoring/settings/system",
        },
        {
          label: "Permissions",
          href: "/_authenticated/attendance_monitoring/settings/permissions",
        },
      ],
    },
    {
      icon: <HelpCircle className="text-gray-500" />,
      label: "Help & Support",
      href: "/_authenticated/attendance_monitoring/help",
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
        <Header
          title={title}
          // backLink={backLink}
          // backText={backText}
          userProfile={userProfile}
        />

        {/* Content area */}
        <main className={cn("flex-1 overflow-auto p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
