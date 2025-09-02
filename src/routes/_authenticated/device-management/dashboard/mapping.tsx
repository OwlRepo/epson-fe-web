import {
  EPSON_FL,
  EPSON_SL,
  EPSON_F1_A1,
  EPSON_F1_A2,
  EPSON_F1_A3,
  EPSON_F1_A4,
  EPSON_F2_A1,
  EPSON_F2_A2,
  EPSON_F2_A3,
  EPSON_F2_A4,
} from "@/assets/images";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { DeviceEdit, DeviceChainway, DeviceOnline } from "@/assets/svgs";
import { toast } from "sonner";
import DeviceIcons from "@/components/ui/device-icons";

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

// Device Info Modal Component
function DeviceInfoModal({
  device,
  isOpen,
  onClose,
  onSave,
  onRelocate,
}: {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedDevice: any) => void;
  onRelocate: (device: Device) => void;
}) {
  const [formData, setFormData] = useState({
    deviceId: "",
    deviceType: "",
    deviceName: "",
    controllerType: "",
    description: "",
    status: false,
  });

  const [originalData, setOriginalData] = useState({
    deviceId: "",
    deviceType: "",
    deviceName: "",
    controllerType: "",
    description: "",
    status: false,
  });

  // Update form data when device changes
  useLayoutEffect(() => {
    if (device) {
      const initialData = {
        deviceId: device.deviceId || "",
        deviceType: device.deviceType || "",
        deviceName: device.name || "",
        controllerType: device.controllerType || "",
        description: device.description || "",
        status: device.status === "online",
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [device]);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleSave = () => {
    if (device) {
      onSave({
        ...device,
        deviceId: formData.deviceId,
        deviceType: formData.deviceType,
        name: formData.deviceName,
        controllerType: formData.controllerType,
        description: formData.description,
        status: formData.status ? "online" : "offline",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Device Info</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Device ID */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Device ID</div>
            <Input
              value={formData.deviceId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deviceId: e.target.value }))
              }
              className="bg-gray-100"
              disabled
            />
          </div>

          {/* Status */}
          {/* <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Status</div>
            <div className="flex items-center space-x-3 mt-2">
              <Switch
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, status: checked }))
                }
              />
              <span className="text-sm font-medium">
                {formData.status ? "Active Device" : "Inactive Device"}
              </span>
            </div>
          </div> */}

          {/* Device Type */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Device Type</div>
            <Input
              value={formData.deviceType}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deviceType: e.target.value }))
              }
              className="bg-gray-100"
            />
          </div>

          {/* Device Name */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Device Name</div>
            <Input
              value={formData.deviceName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deviceName: e.target.value }))
              }
            />
          </div>

          {/* Controller Type */}
          <div className="space-y-2 col-span-1">
            <div className="text-sm font-medium text-gray-600">
              Controller Type
            </div>
            <Select
              value={formData.controllerType}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, controllerType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select controller type" />
              </SelectTrigger>
              <SelectContent>
                {device?.deviceType === "EVS" ? (
                  <>
                    <SelectItem value="Safe">Safe</SelectItem>
                    <SelectItem value="Home">Home</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="In">In</SelectItem>
                    <SelectItem value="Out">Out</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2 col-span-2">
            <div className="text-sm font-medium text-gray-600">Description</div>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-[100px] resize-none"
              placeholder="Enter device description..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            className="border-2 border-blue-900 text-blue-900 font-bold hover:bg-blue-50"
          >
            View Device Logs
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="border-2 border-blue-900 text-blue-900 font-bold hover:bg-blue-50"
              onClick={() => {
                if (device) {
                  onRelocate(device);
                  onClose();
                }
              }}
            >
              Re-locate
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-blue-900 text-white font-bold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Floor/Area Picker Modal Component
function FloorAreaPickerModal({
  device,
  isOpen,
  onClose,
  onConfirm,
}: {
  device: any | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (floor: string, area: string, device: any) => void;
}) {
  const [selectedFloor, setSelectedFloor] = useState("1");
  const [selectedArea, setSelectedArea] = useState("1");

  const handleConfirm = () => {
    if (device) {
      onConfirm(selectedFloor, selectedArea, device);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {device?.DeviceName}
          </DialogTitle>
          <div className="text-sm text-gray-400 font-medium">
            Pick a floor and area to place the device
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Floor Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Floor</div>
            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">First Floor</SelectItem>
                <SelectItem value="2">Second Floor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Area Selection */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Area</div>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Area I</SelectItem>
                <SelectItem value="2">Area II</SelectItem>
                <SelectItem value="3">Area III</SelectItem>
                <SelectItem value="4">Area IV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-blue-900 text-white font-bold hover:bg-blue-800"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DraggableText({
  id,
  percentPosition,
  isDragging,
  containerRect,
  relocatingId,
  setRelocatingId,
  confirmPopoverId,
  onCancel,
  activeId,
  device,
  onEditInfo,
  deviceLocation,
  onConfirmWithLocation,
}: {
  id: string;
  percentPosition: PercentPosition;
  isDragging: boolean;
  containerRect: DOMRect | null;
  relocatingId: string | null;
  setRelocatingId: (id: string | null) => void;
  confirmPopoverId: string | null;
  setConfirmPopoverId: (id: string | null) => void;
  onCancel: () => void;
  originalPosition: PercentPosition | null;
  activeId: string | null;
  interactionDisabled: boolean;
  device: Device;
  onEditInfo: (device: Device) => void;
  deviceLocation: { floor: string; area?: string } | null;
  onConfirmWithLocation: (newFloor: string, newArea: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isRelocating = relocatingId === id;
  const isConfirmPopover = confirmPopoverId === id && !activeId;

  // Local state for floor/area selection in confirm popover
  const [selectedFloor, setSelectedFloor] = useState(
    deviceLocation?.floor || "1"
  );
  const [selectedArea, setSelectedArea] = useState(deviceLocation?.area || "1");

  // Reset local state when confirm popover opens
  useLayoutEffect(() => {
    if (isConfirmPopover) {
      setSelectedFloor(deviceLocation?.floor || "1");
      setSelectedArea(deviceLocation?.area || "1");
    }
  }, [isConfirmPopover, deviceLocation]);
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
            className="cursor-move select-none relative"
            {...listeners}
            {...attributes}
          >
            {/* Success glow effect for confirm state */}
            <div className="absolute inset-0 -m-3 bg-green-400/40 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 -m-1 bg-green-300/30 rounded-full blur-sm"></div>

            {/* Device icon with confirm styling */}
            <div className="relative z-10 transform scale-110 drop-shadow-lg">
              <DeviceIcons
                deviceType={device?.deviceType || ""}
                controllerType={device?.controllerType || ""}
                status={"relocating"}
              />
            </div>

            {/* Confirm indicator badge */}
            <div className="absolute -top-2 -right-2 z-20">
              <div className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                ✓
              </div>
            </div>
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
            <div className="text-sm text-gray-400 font-medium mb-4">
              Drag me to the area that fits your layout or select floor & area
              below.
            </div>
          </div>

          <div className="w-full space-y-4">
            {/* Floor & Area Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Floor</div>
                <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Floor</SelectItem>
                    <SelectItem value="2">Second Floor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Area</div>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Area I</SelectItem>
                    <SelectItem value="2">Area II</SelectItem>
                    <SelectItem value="3">Area III</SelectItem>
                    <SelectItem value="4">Area IV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-blue-900 text-white font-bold hover:bg-blue-800"
                onClick={() =>
                  onConfirmWithLocation(selectedFloor, selectedArea)
                }
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
        style={{
          position: "absolute",
          ...style,
          // Hide the original device when it's being actively dragged
          opacity: isDraggableDragging ? 0 : 1,
        }}
        className="group cursor-move select-none relative"
        {...(isRelocating ? listeners : {})}
        {...(isRelocating ? attributes : {})}
      >
        {/* Pulsing background effect for relocation mode */}
        {isRelocating && !isDraggableDragging && (
          <>
            {/* Outer pulsing ring */}
            <div className="absolute inset-0 -m-4 bg-blue-500/30 rounded-full animate-ping"></div>
            {/* Inner pulsing ring */}
            <div className="absolute inset-0 -m-2 bg-blue-400/40 rounded-full animate-pulse"></div>
            {/* Glow effect */}
            <div className="absolute inset-0 -m-1 bg-blue-300/50 rounded-full blur-sm"></div>
          </>
        )}

        {/* Device icon with enhanced styling for relocation mode */}
        <div
          className={`relative z-10 ${isRelocating ? "transform scale-110 drop-shadow-lg" : ""}`}
        >
          <DeviceIcons
            deviceType={device?.deviceType}
            controllerType={device?.controllerType}
            status={device?.status}
          />
        </div>

        {/* Relocation indicator badge */}
        {isRelocating && !isDraggableDragging && (
          <div className="absolute -top-2 -right-2 z-20">
            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
              MOVE
            </div>
          </div>
        )}
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
            data-device-id={device?.id}
            className="cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            onClick={handleMouseEnter}
          >
            <DeviceIcons
              deviceType={device?.deviceType}
              controllerType={device?.controllerType}
              status={device?.status}
            />
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
              <div className="text-md font-bold text-blue-800">
                {device?.type}
              </div>
              <div className="text-sm text-gray-400 my-3">
                {device?.description}
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
            <Button
              className="flex-1 bg-blue-900 text-white font-bold text-lg hover:bg-blue-800"
              onClick={() => {
                onEditInfo(device);
                setOpen(false);
              }}
            >
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

  // State declarations first
  const [positions, setPositions] = useState<Record<string, PercentPosition>>(
    {}
  );
  const [defaultPositions, setDefaultPositions] = useState<
    Record<string, PercentPosition>
  >({});
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

  // Device Info Modal state
  const [deviceInfoModal, setDeviceInfoModal] = useState<{
    isOpen: boolean;
    device: Device | null;
  }>({ isOpen: false, device: null });

  // Selected device from dropdown
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  // Floor/Area picker modal for unlocated devices
  const [floorAreaPickerModal, setFloorAreaPickerModal] = useState<{
    isOpen: boolean;
    device: any | null;
  }>({ isOpen: false, device: null });

  // Manually placed devices (for no-location devices that get placed)
  const [manuallyPlacedDevices, setManuallyPlacedDevices] = useState<Device[]>(
    []
  );

  // Transform API data to Device format for current area
  const currentAreaDevices: Device[] = useMemo(() => {
    let devices: Device[] = [];

    // Get devices from current area
    if (
      deviceLocation?.area &&
      deviceListByArea[deviceLocation.floor as keyof typeof deviceListByArea]
    ) {
      devices =
        deviceListByArea[
          deviceLocation.floor as keyof typeof deviceListByArea
        ]?.map(transformApiDataToDevice) || [];
    }

    // Add manually placed devices for current floor/area
    const placedForCurrentArea = manuallyPlacedDevices.filter(
      (d: Device) =>
        d.floor === deviceLocation?.floor && d.area === deviceLocation?.area
    );
    devices = [...devices, ...placedForCurrentArea];

    return devices;
  }, [deviceListByArea, deviceLocation, manuallyPlacedDevices]);

  // Use device.x and device.y for initial positions
  const initialPositions: Record<string, PercentPosition> = useMemo(
    () =>
      Object.fromEntries(
        currentAreaDevices.map((d) => [d.id, { x: d.x, y: d.y }])
      ),
    [currentAreaDevices]
  );

  // Update positions when device data changes
  useLayoutEffect(() => {
    setPositions(initialPositions);
    setDefaultPositions(initialPositions);
  }, [initialPositions]);

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

  const handleConfirmWithLocation = (newFloor: string, newArea: string) => {
    if (confirmPopoverId) {
      const device = currentAreaDevices.find((d) => d.id === confirmPopoverId);
      const newPosition = positions[confirmPopoverId];

      if (device && newPosition) {
        // Check if floor or area changed
        const floorChanged = newFloor !== device.floor;
        const areaChanged = newArea !== device.area;
        const locationChanged = floorChanged || areaChanged;

        // Update device position and floor/area via socket
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
          floor: newFloor,
          area: newArea,
          xaxis: newPosition.x.toString(),
          yaxis: newPosition.y.toString(),
          archive: 0,
        });

        // Update manually placed device position if it exists
        setManuallyPlacedDevices((prev) =>
          prev.map((d) =>
            d.id === device.id
              ? {
                  ...d,
                  x: newPosition.x,
                  y: newPosition.y,
                  floor: newFloor,
                  area: newArea,
                }
              : d
          )
        );

        if (locationChanged) {
          // Floor/area changed - keep relocation mode active for positioning on new map
          setDeviceLocation({ floor: newFloor, area: newArea });
          setRelocatingId(device.id);
        } else {
          // Only position changed - end relocation mode
          setRelocatingId(null);
        }

        // Refresh room connection to get latest data after successful update
        refreshRoom();
      }

      setDefaultPositions((old) => ({
        ...old,
        [confirmPopoverId]: positions[confirmPopoverId],
      }));
    }
    setConfirmPopoverId(null);
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

  const handleFloorAreaDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId);

    // Check for no-location device first
    const noLocationDevice = deviceList["no-location"]?.find(
      (device: any) => device.ID === deviceId
    );
    if (noLocationDevice) {
      // Show floor/area picker modal for no-location device
      setFloorAreaPickerModal({ isOpen: true, device: noLocationDevice });
      return;
    }

    // Find device in registered devices (current floor only)
    const registeredDevice = deviceList[
      deviceLocation?.floor as keyof typeof deviceList
    ]?.find(
      (device: any) => device.ID === deviceId && device.XAxis && device.YAxis
    );

    if (registeredDevice) {
      // Device is registered - navigate to its floor/area and show device details
      setDeviceLocation({
        floor: registeredDevice.Floor,
        area: registeredDevice.Area,
      });

      // Show device popover after navigation
      setTimeout(() => {
        const transformedDevice = transformApiDataToDevice(registeredDevice);
        const deviceElement = document.querySelector(
          `[data-device-id="${transformedDevice.id}"]`
        );
        if (deviceElement) {
          (deviceElement as HTMLElement).click();
        }
      }, 100);

      toast.info("Device selected", {
        description: "Showing device location and details.",
      });
    }
  };

  const handleFloorAreaConfirm = (
    selectedFloor: string,
    selectedArea: string,
    device: any
  ) => {
    // Transform device and add to manually placed devices
    const transformedDevice = transformApiDataToDevice({
      ...device,
      Floor: selectedFloor,
      Area: selectedArea,
      XAxis: "50",
      YAxis: "50",
    });

    // Add to manually placed devices
    setManuallyPlacedDevices((prev) => [...prev, transformedDevice]);

    // Update deviceLocation to show the selected floor/area
    setDeviceLocation({ floor: selectedFloor, area: selectedArea });

    // Close modal and enter relocation mode after map loads
    setFloorAreaPickerModal({ isOpen: false, device: null });

    setTimeout(() => {
      setRelocatingId(transformedDevice.id);
      toast.info("Device placed on map", {
        description: "Position the device where you want it to be located.",
      });
    }, 200);
  };

  const handleDeviceInfoSave = (updatedDevice: Device) => {
    // Update device via socket using the same format as device relocation
    emitData("device_update", {
      id: updatedDevice.deviceId,
      name: updatedDevice.name,
      controllertype: updatedDevice.controllerType,
      description: updatedDevice.description,
      status:
        updatedDevice.status === "online"
          ? "Active"
          : updatedDevice.status === "offline"
            ? "Inactive"
            : "In Active",
      floor: updatedDevice.floor,
      area: updatedDevice.area,
      xaxis: updatedDevice.x.toString(),
      yaxis: updatedDevice.y.toString(),
      archive: 0,
    });

    // Close modal and refresh data
    setDeviceInfoModal({ isOpen: false, device: null });
    refreshRoom();
  };

  // Get dynamic image based on floor and area
  const getMapImage = () => {
    const floor = deviceLocation?.floor;
    const area = deviceLocation?.area;

    if (floor === "1") {
      switch (area) {
        case "1":
          return EPSON_F1_A1;
        case "2":
          return EPSON_F1_A2;
        case "3":
          return EPSON_F1_A3;
        case "4":
          return EPSON_F1_A4;
        default:
          return EPSON_F1_A1;
      }
    } else if (floor === "2") {
      switch (area) {
        case "1":
          return EPSON_F2_A1;
        case "2":
          return EPSON_F2_A2;
        case "3":
          return EPSON_F2_A3;
        case "4":
          return EPSON_F2_A4;
        default:
          return EPSON_F2_A1;
      }
    }

    return EPSON_F1_A1; // fallback
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
        <Select
          value={selectedDeviceId}
          onValueChange={handleFloorAreaDeviceSelect}
        >
          <SelectTrigger
            className="h-[50px] w-[245px]"
            disabled={
              !deviceListByArea[
                deviceLocation?.floor as keyof typeof deviceList
              ]?.length
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
                ?.filter((device: any) => device.Floor)
                .map((device: any) => (
                  <SelectItem key={device.ID} value={device.ID}>
                    {device.DeviceName}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div ref={containerRef} className="w-full relative">
        <img
          src={getMapImage()}
          alt={`Floor ${deviceLocation?.floor} Area ${deviceLocation?.area}`}
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
                onCancel={initialized ? handleCancel : () => {}}
                originalPosition={originalPosition}
                activeId={activeId}
                interactionDisabled={!initialized || !containerRect}
                device={d}
                onEditInfo={(device) =>
                  setDeviceInfoModal({ isOpen: true, device })
                }
                deviceLocation={deviceLocation}
                onConfirmWithLocation={handleConfirmWithLocation}
              />
            ))}
            <DragOverlay>
              {activeId ? (
                <div className="cursor-move select-none relative">
                  {/* Dragging glow effect */}
                  <div className="absolute inset-0 -m-4 bg-blue-500/50 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 -m-2 bg-blue-400/60 rounded-full animate-pulse"></div>

                  {/* Device icon with dragging styling */}
                  <div className="relative z-10 transform scale-125 drop-shadow-xl">
                    <DeviceIcons
                      deviceType={
                        currentAreaDevices.find((d) => d.id === activeId)
                          ?.deviceType || ""
                      }
                      controllerType={
                        currentAreaDevices.find((d) => d.id === activeId)
                          ?.controllerType || ""
                      }
                      status={"relocating"}
                    />
                  </div>

                  {/* Dragging indicator */}
                  <div className="absolute -top-3 -right-3 z-20">
                    <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                      DRAG
                    </div>
                  </div>
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

        {/* Device Info Modal */}
        <DeviceInfoModal
          device={deviceInfoModal.device}
          isOpen={deviceInfoModal.isOpen}
          onClose={() => setDeviceInfoModal({ isOpen: false, device: null })}
          onSave={handleDeviceInfoSave}
          onRelocate={(device) => {
            setRelocatingId(device.id);
            setDeviceInfoModal({ isOpen: false, device: null });
          }}
        />
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
      {/* Floor/Area Picker Modal */}
      <FloorAreaPickerModal
        device={floorAreaPickerModal.device}
        isOpen={floorAreaPickerModal.isOpen}
        onClose={() => setFloorAreaPickerModal({ isOpen: false, device: null })}
        onConfirm={handleFloorAreaConfirm}
      />
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
                  value={selectedDeviceId}
                  onValueChange={handleFloorAreaDeviceSelect}
                  disabled={
                    !deviceList[
                      deviceLocation?.floor as keyof typeof deviceList
                    ]?.length && !deviceList["no-location"]?.length
                  }
                >
                  <SelectTrigger className="h-[50px] w-[145px]">
                    <SelectValue placeholder="Select Device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-green-400">
                        Registered
                      </SelectLabel>
                      {deviceList[
                        deviceLocation?.floor as keyof typeof deviceList
                      ]
                        .filter((device: any) => device.Floor)
                        .map((device: any) => (
                          <SelectItem key={device.ID} value={device.ID}>
                            {device.DeviceName}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    {deviceList["no-location"]?.length > 0 && (
                      <SelectGroup>
                        <Separator className="mt-1" />
                        <SelectLabel className="text-red-400">
                          No Location
                        </SelectLabel>
                        {deviceList["no-location"].map((device: any) => (
                          <SelectItem key={device.ID} value={device.ID}>
                            {device.DeviceName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>
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
