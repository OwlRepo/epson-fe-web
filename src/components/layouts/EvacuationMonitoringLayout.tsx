import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { LayoutDashboard, FileText, ShieldPlus, Monitor } from "lucide-react";
import { EpsonLogoWhite } from "@/assets/svgs";
import { useSocketEmit } from "@/hooks";
import { useEvsMode } from "@/hooks/useEvsMode";
import dayjs from "dayjs";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
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
      icon: <Monitor />,
      label: "Overview",
      href: "/evacuation-monitoring/overview",
    },
    {
      icon: <LayoutDashboard />,
      label: "Dashboard",
      href: "/evacuation-monitoring/dashboard",
      subItems: [
        {
          label: "Realtime",
          href: "/evacuation-monitoring/dashboard/realtime",
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

  const { emitWithAck } = useSocketEmit();
  const { successStyle, errorStyle } = useToastStyleTheme();
  const {
    evsMode,
    onEvsModeToggle,
    hasReceivedData,
    isSwitchDisabled,
    readiness,
    hasReceivedReadiness,
    canCompleteEvacuation,
    showPersistentReadinessNotice,
    dismissReadinessNotice,
    acknowledgeReadinessOnComplete,
  } = useEvsMode();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        defaultCollapsed={collapsed}
        navItems={navItems}
        logo={logo}
        collapsedLogo={collapsedLogo}
        className="bg-primary-evs"
        evsMode={evsMode}
        onEvsModeToggle={onEvsModeToggle}
        hasReceivedEvsModeData={hasReceivedData}
        isSwitchDisabled={isSwitchDisabled}
        readiness={readiness}
        hasReceivedReadiness={hasReceivedReadiness}
        canCompleteEvacuation={canCompleteEvacuation}
        showPersistentReadinessNotice={showPersistentReadinessNotice}
        onDismissReadinessNotice={dismissReadinessNotice}
        onAcknowledgeReadinessOnComplete={acknowledgeReadinessOnComplete}
        onEvacComplete={() => {
          emitWithAck(
            "evac_complete",
            {
              trigger_by: JSON.parse(localStorage.getItem("user") || "{}")[
                "Name"
              ],
              date: dayjs().format("YYYY-MM-DD hh:mm:ss A"),
            },
            (response) => {
              if (response.ok === true) {
                toast.success("", {
                  description:
                    response.message || "Evacuation completed successfully",
                  className: "bg-green-50 border-green-200 text-black",
                  style: successStyle,
                });
                console.log(
                  "🟢 [EvacuationMonitoringLayout] Evacuation completed successfully",
                  response
                );
                window.location.reload();
              } else {
                toast.error("", {
                  description:
                    response.error || "Failed to complete evacuation",
                  className: "bg-red-50 border-red-200 text-red-800",
                  style: errorStyle,
                });
                console.log(
                  "🔴 [EvacuationMonitoringLayout] Failed to complete evacuation",
                  response
                );
              }
            }
          );
        }}
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
