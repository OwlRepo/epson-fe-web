import CardSection from "@/components/layouts/CardSection";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { Monitor } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/device-management/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <CardSection
      headerLeft={
        <div>
          <p className="text-xl font-bold">Overview</p>
          <p className="text-sm text-slate-400">
            Overview of Connected Devices
          </p>
        </div>
      }
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button>ELID Controllers</Button>
          <Button>Chainway (Mobile)</Button>
        </div>
        <Button>Regular Device</Button>
      </div>

      {/* buttons */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 16 }).map((_, index) => (
          <DeviceButton
            key={index}
            index={index}
            variant={
              index % 3 === 0 ? "entry" : index % 3 === 1 ? "exit" : "unknown"
            }
          />
        ))}
      </div>
    </CardSection>
  );
}

function DeviceButton({
  index,
  variant,
}: {
  index: number;
  variant: "entry" | "exit" | "unknown";
}) {
  const variantStyles = {
    entry: {
      bgColor: "bg-[#DCF5DC]",
      hoverColor: "hover:bg-[#B2EAB2]",
      iconColor: "bg-green-500",
      text: `Entry A${index + 1}`,
    },
    exit: {
      bgColor: "bg-[#F5DCDC]",
      hoverColor: "hover:bg-[#EAB2B2]",
      iconColor: "bg-red-500",
      text: `Exit A${index + 1}`,
    },
    unknown: {
      bgColor: "bg-gray-300",
      hoverColor: "hover:bg-gray-400",
      iconColor: "bg-gray-500",
      text: `Unknown A${index + 1}`,
    },
  };

  const { bgColor, hoverColor, iconColor, text } = variantStyles[variant];

  return (
    <Button
      key={index}
      className={`h-20 w-60 flex justify-start items-center  ${bgColor} ${hoverColor}`}
    >
      <div
        className={`rounded-full ${iconColor} p-2 h-10 w-10 flex items-center justify-center`}
      >
        <Monitor />
      </div>
      <p className="text-black text-xl font-bold">{text}</p>
    </Button>
  );
}
