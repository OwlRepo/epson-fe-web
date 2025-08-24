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

export interface EVSCountsProps {
  countData?: any;
  type?: "card" | "compact";
  countType?: "default" | "cdepro";
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
          label: "Overall",
          count: countData?.all,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        },
        {
          icon: <EvacuatedIcon className="w-3.5 h-3.5" />,
          label: "Safe",
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

  if (type === "card") {
    return (
      <CardSection headerLeft={<CardHeaderLeft />}>
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <AttendanceCountCard
            count={countData?.safe ? formatCountWithCommas(countData.safe) : 0}
            icon={<EvacuatedIcon />}
            subtitle="Safe"
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
