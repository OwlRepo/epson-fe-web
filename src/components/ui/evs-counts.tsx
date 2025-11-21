import formatCountWithCommas from "@/utils/formatCountWithCommas";
import {
  EvacuatedIcon,
  InjuredIcon,
  InPremisesEvsIcon,
  HomeIcon,
} from "@/assets/svgs";
import { Users } from "lucide-react";
import AttendanceCountCard from "./attendance-count-card";
import CardSection from "../layouts/CardSection";
import CardHeaderLeft from "./card-header-left";
import { io, type Socket } from "socket.io-client";
import { getApiSocketBaseUrl } from "@/utils/env";
import { useEffect, useState, useRef } from "react";

export interface EVSCountsProps {
  countData?: any;
  type?: "card" | "compact";
  countType?: "default" | "cdepro" | "deviceManagement" | "overview_evs";
}

export default function EVSCounts(props: EVSCountsProps) {
  const { countData, type = "card", countType = "default" } = props;

  // Compact horizontal status bar
  if (type === "compact") {
    const statusItems = {
      default: [
        {
          icon: (
            <Users className="w-3.5 h-3.5 text-white bg-gray-500 rounded-full p-[2px]" />
          ),
          label: !window.location.pathname.includes(
            "evacuation-monitoring/reports"
          )
            ? "Total Man Power"
            : "Total Record",
          count: countData?.all,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        },
        {
          icon: <EvacuatedIcon className="w-3.5 h-3.5" />,
          label: "Total Evacuees",
          count: countData?.safe,
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        },
        {
          icon: <InjuredIcon className="w-3.5 h-3.5" />,
          label: "Injured",
          count: countData?.injured,
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
        },
        {
          icon: <HomeIcon className="w-3.5 h-3.5" />,
          label: "Go Home",
          count: countData?.home,
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
        },
        {
          icon: <InPremisesEvsIcon className="w-3.5 h-3.5" />,
          label: "Missing",
          count: countData?.missing,
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        },
      ],
      overview_evs: [
        {
          icon: (
            <Users className="w-3.5 h-3.5 text-white bg-gray-500 rounded-full p-[2px]" />
          ),
          label: "Total Man Power",
          count: countData?.all,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        },
        {
          icon: <EvacuatedIcon className="w-3.5 h-3.5" />,
          label: "Total Evacuees",
          count: countData?.safe,
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        },
        {
          icon: <InjuredIcon className="w-3.5 h-3.5" />,
          label: "Injured",
          count: countData?.injured,
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
        },
        {
          icon: <HomeIcon className="w-3.5 h-3.5" />,
          label: "Go Home",
          count: countData?.home,
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
        },
        {
          icon: <InPremisesEvsIcon className="w-3.5 h-3.5" />,
          label: "Missing",
          count: countData?.missing,
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        },
      ],
      cdepro: [
        {
          icon: (
            <Users className="w-3.5 h-3.5 text-white bg-gray-500 rounded-full p-[2px]" />
          ),
          label: "Overall",
          count: countData?.all,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        },
        {
          icon: <EvacuatedIcon className="w-3.5 h-3.5" />,
          label: "Active",
          count: countData?.active,
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        },
        {
          icon: <InPremisesEvsIcon className="w-3.5 h-3.5" />,
          label: "Inactive",
          count: countData?.inactive,
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        },
      ],

      deviceManagement: [
        {
          icon: <></>,
          label: "Online",
          count: countData?.active,
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        },
        {
          icon: <></>,
          label: "Offline",
          count: countData?.inactive,
          bgColor: "bg-red-50",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        },
        {
          icon: <></>,
          label: "Unregistered",
          count: countData?.unregistered,
          bgColor: "bg-primary-50",
          textColor: "text-primary-700",
          borderColor: "border-primary-200",
        },

        {
          icon: <></>,
          label: "No Location",
          count: countData?.noLocation,
          bgColor: "bg-primary-50",
          textColor: "text-primary-700",
          borderColor: "border-primary-200",
        },
      ],
    };

    return (
      <div className="flex items-center gap-3">
        {statusItems[countType].map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border ${item.bgColor} ${item.borderColor}`}
          >
            {item.icon}
            <span className={`text-sm font-semibold ${item.textColor}`}>
              {item.count}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const [asofData, setAsofData] = useState<string>("");
  const socketRef = useRef<Socket | null>(null);

  // Only create socket when type === "card" since it's only needed for asof data in card mode
  useEffect(() => {
    // Skip socket creation for compact type
    if (type !== "card") {
      return;
    }

    // Guard: prevent duplicate connections if socket already exists and is connected
    if (socketRef.current?.connected) {
      console.log(
        "⚠️ [EVSCounts] Socket already connected, skipping duplicate connection"
      );
      return;
    }

    const SOCKET_URL = getApiSocketBaseUrl();
    let socketInstance: Socket;

    try {
      console.log("🔧 [EVSCounts] Creating socket instance with config...");
      socketInstance = io(SOCKET_URL, {
        extraHeaders: {
          "ngrok-skip-browser-warning": "true",
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
      console.log("✅ [EVSCounts] Socket instance created successfully");
      socketRef.current = socketInstance;
    } catch (err) {
      console.error("🔴 [EVSCounts] Socket initialization failed:", err);
      return;
    }

    socketInstance.on("connect", () => {
      console.log("🟢 [EVSCounts] Socket connected to server successfully!");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("🔴 [EVSCounts] Socket connection error:", err.message);
    });

    socketInstance.on("disconnect", () => {
      console.log("🔌 [EVSCounts] Socket disconnected from server");
    });

    socketInstance.on("asof", (asofData: string) => {
      setAsofData(asofData);
    });

    // Clean up function
    return () => {
      console.log("🧹 [EVSCounts] Cleaning up socket connections...");
      const socketToCleanup = socketRef.current;
      if (socketToCleanup) {
        socketToCleanup.off("connect");
        socketToCleanup.off("disconnect");
        socketToCleanup.off("connect_error");
        socketToCleanup.off("asof");
        socketToCleanup.disconnect();
      }
      socketRef.current = null;
      console.log("✨ [EVSCounts] Socket cleanup completed");
    };
  }, [type]);

  if (type === "card") {
    return (
      <CardSection
        headerLeft={<CardHeaderLeft subtitle={`As of ${asofData}`} />}
      >
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <AttendanceCountCard
            count={countData?.safe ? formatCountWithCommas(countData.safe) : 0}
            icon={<EvacuatedIcon />}
            subtitle="Total Evacuees"
            variant="success"
          />

          <AttendanceCountCard
            count={
              countData?.injured ? formatCountWithCommas(countData.injured) : 0
            }
            icon={<InjuredIcon />}
            subtitle="Injured"
            variant="warning"
          />

          <AttendanceCountCard
            count={countData?.home ? formatCountWithCommas(countData.home) : 0}
            icon={<HomeIcon />}
            subtitle="Home"
            variant="info"
          />
          <AttendanceCountCard
            count={
              countData?.missing ? formatCountWithCommas(countData?.missing) : 0
            }
            icon={<InPremisesEvsIcon />}
            subtitle="Missing"
            variant="error"
          />
        </div>
      </CardSection>
    );
  }
}
