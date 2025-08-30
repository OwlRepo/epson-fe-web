import { EPSON_FL, EPSON_SL, ONE_FLOOR_AREA_FOUR } from "@/assets/images";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { createFileRoute } from "@tanstack/react-router";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useState, useRef, useLayoutEffect, useMemo } from "react";
import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ZoomIn } from "lucide-react";
import type { Device as DeviceType } from "@/components/dialogs/DeviceInfoDialog";
import useDeviceMappingData from "@/hooks/useDeviceMappingData";
import Spinner from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/_authenticated/device-management/dashboard/mapping"
)({
  component: RouteComponent,
});

interface PercentPosition {
  x: number; // percent (0-100)
  y: number; // percent (0-100)
}

export interface Device extends DeviceType {
  id: string; // internal unique id (maps to ID from API)
  deviceId: string; // shown Device ID (maps to ID from API)
  name: string; // maps to DeviceName from API
  type: "controller" | "printer" | "scanner";
  deviceType: string; // e.g., "ELID Controller"
  controllerType: string; // maps to ControllerType from API
  status: "online" | "offline" | "maintenance"; // derived from Status
  description: string; // maps to Description from API
  x: number; // percent (0-100) - maps to XAxis from API
  y: number; // percent (0-100) - maps to YAxis from API
}

// Transform API data to Device format
const transformApiDataToDevice = (apiDevice: any): Device => {
  const getDeviceType = (
    controllerType: string
  ): "controller" | "printer" | "scanner" => {
    if (
      controllerType?.toLowerCase().includes("in") ||
      controllerType?.toLowerCase().includes("out") ||
      controllerType?.toLowerCase().includes("entry") ||
      controllerType?.toLowerCase().includes("exit")
    ) {
      return "controller";
    }
    if (controllerType?.toLowerCase().includes("printer")) {
      return "printer";
    }
    return "scanner";
  };

  const getStatus = (status: string): "online" | "offline" | "maintenance" => {
    if (status === "Active") return "online";
    if (status === "Inactive" || status === "In Active") return "offline";
    return "maintenance";
  };

  return {
    id: apiDevice.ID,
    deviceId: apiDevice.ID,
    name: apiDevice.DeviceName || apiDevice.ID,
    type: getDeviceType(apiDevice.ControllerType),
    deviceType: apiDevice.DeviceType || "ELID Controller",
    controllerType: apiDevice.ControllerType || "",
    status: getStatus(apiDevice.Status),
    description: apiDevice.Description || "",
    x: parseFloat(apiDevice.XAxis) || 10,
    y: parseFloat(apiDevice.YAxis) || 10,
    floor: apiDevice.Floor,
    area: apiDevice.Area,
    xaxis: apiDevice.XAxis,
    yaxis: apiDevice.YAxis,
    controllertype: apiDevice.ControllerType,
    archive: 0,
  };
};

function DraggableText({
  id,
  percentPosition,
  isDragging,
  containerRect,
  relocatingId,
  setRelocatingId,
  confirmPopoverId,
  onConfirm,
  onCancel,
  activeId,
  device,
}: {
  id: string;
  percentPosition: PercentPosition;
  isDragging: boolean;
  containerRect: DOMRect | null;
  relocatingId: string | null;
  setRelocatingId: (id: string | null) => void;
  confirmPopoverId: string | null;
  setConfirmPopoverId: (id: string | null) => void;
  onConfirm: () => void;
  onCancel: () => void;
  originalPosition: PercentPosition | null;
  activeId: string | null;
  interactionDisabled: boolean;
  device: Device;
}) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isRelocating = relocatingId === id;
  const isConfirmPopover = confirmPopoverId === id && !activeId;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggableDragging,
  } = useDraggable({ id, disabled: !isRelocating });
  // Convert percent to px for rendering
  const left = containerRect
    ? (percentPosition.x / 100) * containerRect.width
    : 0;
  const top = containerRect
    ? (percentPosition.y / 100) * containerRect.height
    : 0;
  const style = {
    left,
    top,
    zIndex: isDraggableDragging || isDragging || isConfirmPopover ? 50 : 10,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  // Handlers for delayed close (for the info popover)
  const handleMouseEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => {
      setOpen(false);
    }, 1000);
  };

  useLayoutEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  // Show confirm popover if needed
  if (isRelocating && isConfirmPopover) {
    return (
      <Popover open={true}>
        <PopoverTrigger asChild>
          <div
            ref={setNodeRef}
            style={{ position: "absolute", ...style }}
            className="cursor-move select-none p-2 bg-primary rounded-md border border-primary-300 shadow-sm hover:shadow-md transition-shadow duration-200 text-white font-bold"
            {...listeners}
            {...attributes}
          >
            {device?.name || `Device ${id}`}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          sideOffset={24}
          className="w-fit p-8 rounded-3xl shadow-xl border border-gray-100 bg-[#f7f9fc] flex flex-col items-center gap-4 z-50"
          style={{ left: 0, top: 0 }}
        >
          <div className="w-full text-left">
            <div className="text-2xl font-extrabold mb-1">{device?.name}</div>
            <div className="text-md text-gray-400 font-medium mb-6">
              Drag me to the area that fits your layout.
            </div>
          </div>
          <div className="flex w-full gap-4 mt-2 justify-between">
            <Button
              variant="outline"
              className="flex-1 border-2 border-blue-900 text-blue-900 font-bold hover:bg-blue-50 py-5"
            >
              Select Floor & Area
            </Button>
            <div className=" flex">
              <Button
                type="button"
                variant="destructive"
                className="flex-1 bg-red-600 text-white font-bold hover:bg-red-700 py-5"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-blue-900 text-white font-bold hover:bg-blue-800 py-5"
                onClick={onConfirm}
              >
                Confirm
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Do not show info popover if relocating or confirm popover is open
  if (isRelocating || confirmPopoverId) {
    return (
      <div
        ref={setNodeRef}
        style={{ position: "absolute", ...style }}
        className="group cursor-move select-none p-2 bg-primary rounded-md border border-primary-300 shadow-sm hover:shadow-md transition-shadow duration-200 text-white font-bold"
        {...(isRelocating ? listeners : {})}
        {...(isRelocating ? attributes : {})}
      >
        {device?.name || `Device ${id}`}
      </div>
    );
  }

  // Default info popover
  return (
    <div
      ref={setNodeRef}
      style={{ position: "absolute", ...style }}
      className="group"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="cursor-pointer select-none p-2 bg-primary rounded-md border border-primary-300 shadow-sm hover:shadow-md transition-shadow duration-200 text-white font-bold"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
          >
            {device?.name || `Device ${id}`}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          sideOffset={8}
          className="w-80 p-6 shadow-xl border border-gray-100 bg-[#f7f9fc] flex flex-col gap-4 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-extrabold text-gray-900">
                {device?.name}
              </div>
              <div className="text-lg font-bold text-blue-800">
                {device?.type
                  ? device.type.charAt(0).toUpperCase() + device.type.slice(1)
                  : ""}
              </div>
            </div>
            <div
              className={`font-extrabold text-lg mt-1 ${
                device?.status === "online"
                  ? "text-green-600"
                  : device?.status === "maintenance"
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {device?.status.toUpperCase()}
            </div>
          </div>
          <div className="text-gray-400 text-xl font-medium">
            {device?.description}
          </div>
          <div className="flex gap-4 mt-2">
            <Button
              variant="outline"
              className="flex-1 border-2 border-blue-900 text-blue-900 font-bold text-lg hover:bg-blue-50"
              onClick={() => {
                setRelocatingId(id);
                setOpen(false);
              }}
            >
              Re-locate
            </Button>
            <Button className="flex-1 bg-blue-900 text-white font-bold text-lg hover:bg-blue-800">
              Edit Info
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RouteComponent() {
  const [deviceLocation, setDeviceLocation] = useState<{
    floor: string;
    area?: string;
  } | null>({ floor: "1" });

  const {
    deviceCounts,
    deviceList,
    isConnected,
    deviceListByArea,
    emitData,
    refreshRoom,
  } = useDeviceMappingData({
    floor: deviceLocation?.floor || "1",
    area: deviceLocation?.area || "1",
  });

  // Transform API data to Device format for current area
  const currentAreaDevices: Device[] = useMemo(() => {
    if (
      !deviceLocation?.area ||
      !deviceListByArea[deviceLocation.floor as keyof typeof deviceListByArea]
    ) {
      return [];
    }
    return (
      deviceListByArea[
        deviceLocation.floor as keyof typeof deviceListByArea
      ]?.map(transformApiDataToDevice) || []
    );
  }, [deviceListByArea, deviceLocation]);

  // Use device.x and device.y for initial positions
  const initialPositions: Record<string, PercentPosition> = useMemo(
    () =>
      Object.fromEntries(
        currentAreaDevices.map((d) => [d.id, { x: d.x, y: d.y }])
      ),
    [currentAreaDevices]
  );

  const [positions, setPositions] = useState<Record<string, PercentPosition>>(
    {}
  );
  const [defaultPositions, setDefaultPositions] = useState<
    Record<string, PercentPosition>
  >({});

  // Update positions when device data changes
  useLayoutEffect(() => {
    setPositions(initialPositions);
    setDefaultPositions(initialPositions);
  }, [initialPositions]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [relocatingId, setRelocatingId] = useState<string | null>(null);
  const [confirmPopoverId, setConfirmPopoverId] = useState<string | null>(null);
  const [originalPosition, setOriginalPosition] =
    useState<PercentPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const hasInitialized = useRef(false);

  // Only measure container after image is loaded
  useLayoutEffect(() => {
    if (!imageLoaded) return;
    function updateRect() {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    }
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [imageLoaded]);

  // Only initialize ONCE after both image and container are ready
  useLayoutEffect(() => {
    if (containerRect && imageLoaded && !hasInitialized.current) {
      setPositions({ ...initialPositions });
      setDefaultPositions({ ...initialPositions });
      setActiveId(null);
      setRelocatingId(null);
      setConfirmPopoverId(null);
      setOriginalPosition(null);
      setInitialized(true);
      hasInitialized.current = true;
    }
  }, [containerRect, imageLoaded, initialPositions]);

  // If container size changes after init, clamp positions to bounds
  useLayoutEffect(() => {
    if (!containerRect || !initialized) return;
    setPositions((old) => {
      const updated: Record<string, PercentPosition> = { ...old };
      currentAreaDevices.forEach((d) => {
        const pos = old[d.id];
        if (pos) {
          updated[d.id] = {
            x: Math.max(0, Math.min(pos.x, 100)),
            y: Math.max(0, Math.min(pos.y, 100)),
          };
        }
      });
      return updated;
    });
  }, [containerRect, initialized, currentAreaDevices]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Drag logic
  const handleDragStart = (event: DragStartEvent) => {
    if (!initialized || !containerRect) return;
    setActiveId(event.active.id as string);
    setOriginalPosition({ ...positions[event.active.id as string] });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!initialized || !containerRect) return;
    const { active, delta } = event;
    const id = active.id as string;
    setActiveId(null);
    const prev = positions[id];
    const prevX = (prev.x / 100) * containerRect.width;
    const prevY = (prev.y / 100) * containerRect.height;
    let newX = prevX + delta.x;
    let newY = prevY + delta.y;
    newX = Math.max(0, Math.min(newX, containerRect.width));
    newY = Math.max(0, Math.min(newY, containerRect.height));
    setPositions((old) => ({
      ...old,
      [id]: {
        x: (newX / containerRect.width) * 100,
        y: (newY / containerRect.height) * 100,
      },
    }));
    setConfirmPopoverId(id);
  };

  const handleConfirm = () => {
    if (confirmPopoverId) {
      const device = currentAreaDevices.find((d) => d.id === confirmPopoverId);
      const newPosition = positions[confirmPopoverId];

      if (device && newPosition) {
        // Update device position via socket
        emitData("device_update", {
          id: device.deviceId,
          name: device.name,
          controllertype: device.controllerType,
          description: device.description,
          status:
            device.status === "online"
              ? "Active"
              : device.status === "offline"
                ? "Inactive"
                : "In Active",
          floor: device.floor,
          area: device.area,
          xaxis: newPosition.x.toString(),
          yaxis: newPosition.y.toString(),
          archive: 0,
        });

        // Refresh room connection to get latest data after successful update
        refreshRoom();
      }

      setDefaultPositions((old) => ({
        ...old,
        [confirmPopoverId]: positions[confirmPopoverId],
      }));
    }
    setConfirmPopoverId(null);
    setRelocatingId(null);
  };

  const handleCancel = () => {
    if (confirmPopoverId) {
      setPositions((old) => ({
        ...old,
        [confirmPopoverId]: defaultPositions[confirmPopoverId],
      }));
    }
    setConfirmPopoverId(null);
    setRelocatingId(null);
  };

  const dndReady = imageLoaded && containerRect && containerRect.height > 0;
  if (!isConnected) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <Spinner message="Connecting to server..." />
      </div>
    );
  }
  return deviceLocation?.floor && deviceLocation.area ? (
    <CardSection
      headerLeft={
        <div
          className="flex flex-col cursor-pointer"
          onClick={() => setDeviceLocation({ floor: "1" })}
        >
          <b className="flex items-center space-x-2 text-xl ">
            <span className="cursor-pointer">
              <ArrowLeft className="mr-2" />
            </span>
            {deviceLocation.floor === "1" ? "First" : "Second"} Floor
            <span>
              {`> Area ${deviceLocation.area === "1" ? "I" : deviceLocation.area === "2" ? "II" : deviceLocation.area === "3" ? "III" : "IV"}`}
            </span>
          </b>
          <p className="text-sm text-gray-400 ml-8">
            Manage Device Locations on the Map
          </p>
        </div>
      }
      headerRight={
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2">
            <p>
              Online:{" "}
              <span className="font-bold text-green-400">
                {
                  deviceListByArea[
                    deviceLocation?.floor as keyof typeof deviceList
                  ].filter((device: any) => device.Status === "Active").length
                }
              </span>
            </p>
            <p>
              Offline:{" "}
              <span className="font-bold text-red-400">
                {
                  deviceListByArea[
                    deviceLocation?.floor as keyof typeof deviceList
                  ].filter((device: any) => device.Status === "Inactive").length
                }
              </span>
            </p>
            <p>
              No Location:{" "}
              <span className="font-bold text-gray-400">
                {
                  deviceListByArea[
                    deviceLocation?.floor as keyof typeof deviceList
                  ].filter((device: any) => !device.XAxis && !device.YAxis)
                    .length
                }
              </span>
            </p>
          </div>
        </div>
      }
    >
      <div className="flex items-stretch justify-between space-x-5 my-5 px-[1px]">
        <Select>
          <SelectTrigger
            className="h-[50px] w-[245px]"
            disabled={
              !deviceListByArea[
                deviceLocation?.floor as keyof typeof deviceList
              ].filter((device: any) => device.XAxis && device.YAxis).length
            }
          >
            <SelectValue placeholder="Select Device" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Registered</SelectLabel>
              {deviceListByArea[
                deviceLocation?.floor as keyof typeof deviceList
              ]
                .filter((device: any) => device.XAxis && device.YAxis)
                .map((device: any) => (
                  <SelectItem key={device.ID} value={device.ID}>
                    {device.DeviceName}
                  </SelectItem>
                ))}
            </SelectGroup>
            {deviceListByArea[
              deviceLocation?.floor as keyof typeof deviceList
            ].filter((device: any) => !device.XAxis && !device.YAxis).length >
              0 && (
              <>
                <Separator />
                <SelectGroup>
                  <SelectLabel>No Location</SelectLabel>
                  {deviceListByArea[
                    deviceLocation?.floor as keyof typeof deviceList
                  ]
                    .filter((device: any) => !device.XAxis && !device.YAxis)
                    .map((device: any) => (
                      <SelectItem key={device.ID} value={device.ID}>
                        {device.DeviceName}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </>
            )}
          </SelectContent>
        </Select>
        <Button className="h-[50px] w-[145px]">Register Device</Button>
      </div>
      <div ref={containerRef} className="w-full relative">
        <img
          src={ONE_FLOOR_AREA_FOUR}
          alt="One Floor Area Four"
          className="w-full h-full object-contain"
          onLoad={() => setImageLoaded(true)}
        />
        {dndReady ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {currentAreaDevices.map((d) => (
              <DraggableText
                key={d.id}
                id={d.id}
                percentPosition={positions[d.id] || { x: d.x, y: d.y }}
                isDragging={activeId === d.id}
                containerRect={containerRect}
                relocatingId={relocatingId}
                setRelocatingId={initialized ? setRelocatingId : () => {}}
                confirmPopoverId={confirmPopoverId}
                setConfirmPopoverId={
                  initialized ? setConfirmPopoverId : () => {}
                }
                onConfirm={initialized ? handleConfirm : () => {}}
                onCancel={initialized ? handleCancel : () => {}}
                originalPosition={originalPosition}
                activeId={activeId}
                interactionDisabled={!initialized || !containerRect}
                device={d}
              />
            ))}
            <DragOverlay>
              {activeId ? (
                <div className="cursor-move select-none p-2 bg-white/90 rounded-md border border-gray-400 shadow-lg text-gray-900 font-bold">
                  {currentAreaDevices.find((d) => d.id === activeId)?.name ||
                    `Device ${activeId}`}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
            <span className="text-lg text-gray-500 font-semibold">
              Loading layout...
            </span>
          </div>
        )}
      </div>
    </CardSection>
  ) : (
    <CardSection
      headerLeft={
        <CardHeaderLeft
          title="Device Mapping"
          subtitle="Manage Device Locations on the Map"
        />
      }
      headerRight={
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2">
            <p>
              Online:{" "}
              <span className="font-bold text-green-400">
                {deviceCounts.perFloor.active}
              </span>
            </p>
            <p>
              Offline:{" "}
              <span className="font-bold text-red-400">
                {deviceCounts.perFloor.inactive}
              </span>
            </p>
            <p>
              Unregistered:{" "}
              <span className="font-bold text-yellow-400">
                {deviceCounts.perFloor.unregistered}
              </span>
            </p>
            <p>
              No Location:{" "}
              <span className="font-bold text-gray-400">
                {deviceCounts.perFloor.noLocation}
              </span>
            </p>
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <Tabs defaultValue="1">
            <div className="flex justify-between items-center">
              <div className="flex items-stretch py-4 space-x-3">
                <TabsList className="h-[50px] w-[245px]">
                  <TabsTrigger
                    value="1"
                    onClick={() => setDeviceLocation({ floor: "1" })}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white h-full w-full rounded-r-none"
                  >
                    First Floor
                  </TabsTrigger>
                  <TabsTrigger
                    value="2"
                    onClick={() => setDeviceLocation({ floor: "2" })}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white h-full w-full rounded-l-none"
                  >
                    Second Floor
                  </TabsTrigger>
                </TabsList>
                <Select
                  disabled={
                    !deviceList[
                      deviceLocation?.floor as keyof typeof deviceList
                    ].length
                  }
                >
                  <SelectTrigger className="h-[50px] w-[145px]">
                    <SelectValue placeholder="Select Device" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceList[
                      deviceLocation?.floor as keyof typeof deviceList
                    ] ? (
                      deviceList[
                        deviceLocation?.floor as keyof typeof deviceList
                      ].map((device: any) => (
                        <SelectItem key={device.ID} value={device.ID}>
                          {device.DeviceName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="No devices">No devices</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button className="h-[50px] w-[145px]">Register Device</Button>
            </div>
            <TabsContent value="1" className="w-full h-full relative">
              <img
                src={EPSON_FL}
                alt="First Floor"
                className="w-full h-full object-contain"
              />
              <div className="grid grid-cols-2 absolute inset-0">
                {deviceCounts.perArea.map((area) => (
                  <div
                    key={area.id}
                    onClick={() =>
                      setDeviceLocation({ floor: "1", area: area.id })
                    }
                    className="w-full h-full relative bg-[#F7FAFF]/90 hover:bg-[#003f98]/90 cursor-pointer transition ease-in-out duration-300 text-primary hover:text-white border border-primary p-5 group"
                  >
                    <p className=" text-3xl font-bold">{area.name}</p>
                    <p className=" text-md ">Devices: {area.deviceCount}</p>
                    <ZoomIn
                      size={50}
                      className="absolute bottom-[43%] left-[43%] hidden group-hover:block"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="2" className="w-full h-full relative">
              <img
                src={EPSON_SL}
                alt="Second Floor"
                className="w-full h-full object-contain"
              />
              <div className="grid grid-cols-2 absolute inset-0">
                {deviceCounts.perArea.map((area) => (
                  <div
                    key={area.id}
                    onClick={() =>
                      setDeviceLocation({ floor: "2", area: area.id })
                    }
                    className="w-full h-full relative bg-[#F7FAFF]/90 hover:bg-[#003f98]/90 cursor-pointer transition ease-in-out duration-300 text-primary hover:text-white border border-primary p-5 group"
                  >
                    <p className=" text-3xl font-bold">{area.name}</p>
                    <p className=" text-md ">Devices: {area.deviceCount}</p>
                    <ZoomIn
                      size={50}
                      className="absolute bottom-[43%] left-[43%] hidden group-hover:block"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CardSection>
  );
}
