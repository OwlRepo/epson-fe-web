import { Home, Monitor, Siren } from "lucide-react";
import { cn } from "../../lib/utils";
import { ChainwayIcon } from "@/assets/svgs";

interface DeviceIconsProps {
  deviceType: string;
  controllerType: string;
  status: string;
}

const deviceDefaultDesign =
  "rounded-full border-[5px] border-white p-[5px] shadow-[0_0_8.3px_5px_rgba(0,0,0,0.4)]";
const deviceDefaultDesignOnline = "bg-[#00CF3B]";
const deviceDefaultDesignOffline = "bg-[#CF0000]";
const deviceDefaultDesignRelocating = "bg-[#003F98]";

function SirenDevice({ status }: { status: string }) {
  return (
    <div
      className={cn(
        deviceDefaultDesign,
        status === "online"
          ? deviceDefaultDesignOnline
          : deviceDefaultDesignOffline,
        status === "relocating" ? deviceDefaultDesignRelocating : ""
      )}
    >
      <Siren className="text-white h-[22px] w-[22px]" />
    </div>
  );
}

function HomeDevice({ status }: { status: string }) {
  return (
    <div
      className={cn(
        deviceDefaultDesign,
        status === "online"
          ? deviceDefaultDesignOnline
          : deviceDefaultDesignOffline,
        status === "relocating" ? deviceDefaultDesignRelocating : ""
      )}
    >
      <Home className="h-[22px] w-[22px] text-white" />
    </div>
  );
}

function ControllerDevice({ status }: { status: string }) {
  return (
    <div
      className={cn(
        deviceDefaultDesign,
        status === "online"
          ? deviceDefaultDesignOnline
          : deviceDefaultDesignOffline,
        status === "relocating" ? deviceDefaultDesignRelocating : ""
      )}
    >
      <Monitor className="text-white h-[22px] w-[22px]" />
    </div>
  );
}

function ChainwayDevice({ status }: { status: string }) {
  return (
    <div
      className={cn(
        deviceDefaultDesign,
        status === "online"
          ? deviceDefaultDesignOnline
          : deviceDefaultDesignOffline,
        status === "relocating" ? deviceDefaultDesignRelocating : ""
      )}
    >
      <ChainwayIcon className="text-white h-[22px] w-[22px]" />
    </div>
  );
}

export default function DeviceIcons({
  deviceType,
  controllerType,
  status,
}: DeviceIconsProps) {
  if (
    deviceType.toLowerCase() === "evs" &&
    controllerType.toLowerCase() === "safe"
  ) {
    return <SirenDevice status={status} />;
  }
  if (
    deviceType.toLowerCase() === "evs" &&
    controllerType.toLowerCase() === "home"
  ) {
    return <HomeDevice status={status} />;
  }
  if (
    deviceType.toLowerCase() === "elid controller" &&
    (controllerType.toLowerCase() === "in" ||
      controllerType.toLowerCase() === "out")
  ) {
    return <ControllerDevice status={status} />;
  }
  if (deviceType.toLowerCase() !== "chainway") {
    return <ChainwayDevice status={status} />;
  }

  return null;
}
