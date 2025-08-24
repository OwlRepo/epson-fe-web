import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { LayoutDashboard, FileText, ShieldPlus } from "lucide-react";
import { EpsonLogoWhite } from "@/assets/svgs";

interface EvacuationMonitoringLayoutProps {
  children: React.ReactNode;
  userProfile?: {
    name: string;
    role: string;
    image?: string;
  };
  defaultCollapsed?: boolean;
  className?: string;
}

export function EvacuationMonitoringLayout({
  children,

  userProfile = {
    name: "Ethan Blackwood",
    role: "HR Manager",
  },
  defaultCollapsed = false,
  className,
}: EvacuationMonitoringLayoutProps) {
  const [collapsed] = React.useState(defaultCollapsed);

  // Default nav items for the sidebar
  const navItems = [
    {
      icon: <LayoutDashboard />,
      label: "Dashboard",
      href: "/evacuation-monitoring/dashboard",
      subItems: [
        {
          label: "Overview",
          href: "/evacuation-monitoring/dashboard/overview",
        },
        {
          label: "Divisions",
          href: "/evacuation-monitoring/dashboard/divisions",
        },
        {
          label: "Visitor / Guest",
          href: "/evacuation-monitoring/dashboard/visitor-guest",
        },
        {
          label: "Evacuation Exit",
          href: "/evacuation-monitoring/dashboard/evacuation-exit",
        },
      ],
    },
    {
      icon: <ShieldPlus />,
      label: "CDEPRO",
      href: "/evacuation-monitoring/cdepro",
    },
    {
      icon: <FileText />,
      label: "Reports",
      href: "/evacuation-monitoring/reports",
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

  // const { emitData } = useSocket({
  //   room: "evac_complete",
  // });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        defaultCollapsed={collapsed}
        navItems={navItems}
        logo={logo}
        collapsedLogo={collapsedLogo}
        className="bg-primary-evs"
        // onEvacComplete={() => {
        //   emitData("evac_complete", {
        //     email: JSON.parse(localStorage.getItem("user") || "{}")[
        //       "EmailAddress"
        //     ],
        //     date: new Date(),
        //   });
        // }}
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
        <main className={cn("flex-1 overflow-auto p-6 bg-white", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
