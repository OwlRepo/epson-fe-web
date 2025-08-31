import { InPremisesEvsIcon } from "@/assets/svgs";
import DeviceInfoDialog, {
  type Device,
} from "@/components/dialogs/DeviceInfoDialog";
import CardSection from "@/components/layouts/CardSection";
import { Button } from "@/components/ui/button";
import type { countDetails } from "@/components/ui/compact-count";
import CompactCount from "@/components/ui/compact-count";
import { useSocket } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Monitor } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/device-management/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [isController, setIsController] = useState(true);

  const {
    data: device,
    countData,
    emitData,
  } = useSocket<Device>({
    room: isController ? "view_device_controller" : "view_device_chainway",
    dataType: "live",
  });

  const [open, setOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<
    Partial<Device> | undefined
  >();

  const [deviceIds, setDeviceIds] = useState<
    { id: string; controllertype: string }[]
  >([]);

  // const [deviceList, setDeviceList] = useState([]);

  const data = device.map((apiDevice: any) => ({
    id: apiDevice.ID ?? "",
    name: apiDevice.DeviceName ?? "",
    description: apiDevice.Description ?? "",
    status: apiDevice.Status ?? "",
    floor: apiDevice.Floor ?? "",
    area: apiDevice.Area ?? "",
    xaxis: apiDevice.XAxis ?? "",
    yaxis: apiDevice.YAxis ?? "",
    controllertype: apiDevice.DeviceType ?? "",
    archive: 0,
  }));

  const countDetails: countDetails[] = [
    {
      // icon: <HomeIcon className="w-3.5 h-3.5" />,
      label: "Online",
      count: countData?.online,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    },
    {
      label: "Offline",
      count: countData?.offline,
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200",
    },
    {
      // icon: <InPremisesEvsIcon className="w-3.5 h-3.5" />,
      label: "Unregistered",
      count: countData?.unregister,
      bgColor: "bg-primary-50",
      textColor: "text-primary-700",
      borderColor: "border-primary-200",
    },
    {
      // icon: <InPremisesEvsIcon className="w-3.5 h-3.5" />,
      label: "No Location",
      count: countData?.nolocation,
      bgColor: "bg-primary-50",
      textColor: "text-primary-700",
      borderColor: "border-primary-200",
    },
  ];

  return (
    <>
      <CardSection
        headerLeft={
          <div>
            <p className="text-xl font-bold">Overview</p>
            <p className="text-sm text-slate-400">
              Overview of Connected Devices
            </p>
          </div>
        }
        headerRight={<CompactCount countData={countDetails} />}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              onClick={() => setIsController(true)}
              variant={isController ? undefined : "outline"}
              className={
                isController
                  ? undefined
                  : "border-primary text-primary hover:text-primary"
              }
            >
              ELID Controllers
            </Button>
            <Button
              onClick={() => setIsController(false)}
              variant={!isController ? undefined : "outline"}
              className={
                !isController
                  ? undefined
                  : "border-primary text-primary hover:text-primary"
              }
            >
              Chainway (Mobile)
            </Button>
          </div>
          <Button
            onClick={() => {
              setOpen(true);

              setDeviceIds(
                //@ts-ignore
                (data ?? [])
                  .filter((item) => item.name === "")
                  .map(({ id, controllertype }) => ({ id, controllertype }))
              );
            }}
          >
            Register Device
          </Button>
        </div>

        {/* buttons */}
        <div className="grid grid-cols-4 gap-4">
          {data.map((item, index) => (
            <DeviceButton
              onClick={() => {
                setOpen(true);
                setSelectedDevice(item);
                //@ts-ignore
                setDeviceIds(
                  data.map(({ id, controllertype }) => ({
                    id,
                    controllertype,
                  })) ?? []
                );
              }}
              key={index}
              index={index}
              variant={item?.status}
              deviceName={item?.name}
            />
          ))}
        </div>
      </CardSection>
      {open && (
        <DeviceInfoDialog
          deviceList={data}
          deviceIds={deviceIds as any}
          emitData={emitData}
          open={open}
          onOpenChange={() => {
            setOpen(false);
            setSelectedDevice(undefined);
          }}
          deviceInfo={selectedDevice as Device}
          modal={false}
        />
      )}
    </>
  );
}

function DeviceButton({
  index,
  variant,
  deviceName,
  onClick,
}: {
  index: number;
  variant: string;
  deviceName: string | null;
  onClick?: () => void;
}) {
  const variantStyles: any = {
    Active: {
      bgColor: "bg-[#DCF5DC]",
      hoverColor: "hover:bg-[#B2EAB2]",
      iconColor: "bg-green-500",
    },
    ["In Active"]: {
      bgColor: "bg-[#F5DCDC]",
      hoverColor: "hover:bg-[#EAB2B2]",
      iconColor: "bg-red-500",
    },
    unknown: {
      bgColor: "bg-gray-300",
      hoverColor: "hover:bg-gray-400",
      iconColor: "bg-gray-500",
    },
  };

  const style = variantStyles[variant] ?? variantStyles["unknown"] ?? {};
  const { bgColor, hoverColor, iconColor } = style;

  return (
    <div className="flex flex-1  justify-center">
      <Button
        onClick={onClick}
        key={index}
        className={`h-24 w-full flex justify-start items-center  ${bgColor} ${hoverColor}`}
      >
        <div
          className={`rounded-full ${iconColor} p-2 h-10 w-10 flex items-center justify-center`}
        >
          <Monitor />
        </div>
        <p className="text-black text-xl font-bold">{deviceName}</p>
      </Button>
    </div>
  );
}
