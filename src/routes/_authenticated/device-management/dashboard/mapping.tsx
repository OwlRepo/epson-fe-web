import { ONE_FLOOR_AREA_FOUR } from "@/assets/images";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Computer } from "lucide-react";
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
import { useState, useRef, useLayoutEffect } from "react";

export const Route = createFileRoute(
  "/_authenticated/device-management/dashboard/mapping"
)({
  component: RouteComponent,
});

interface PercentPosition {
  x: number; // percent (0-100)
  y: number; // percent (0-100)
}

interface Device {
  id: string; // internal unique id
  deviceId: string; // shown Device ID
  name: string;
  type: "controller" | "printer" | "scanner";
  deviceType: string; // e.g., "ELID Controller"
  controllerType: string; // e.g., "Entry"
  status: "online" | "offline" | "maintenance";
  description: string;
  x: number; // percent (0-100)
  y: number; // percent (0-100)
}

const DRAGGABLES: Device[] = [
  {
    id: "device1",
    deviceId: "000000481",
    name: "Entry A1",
    type: "controller",
    deviceType: "ELID Controller",
    controllerType: "Entry",
    status: "online",
    description: "Morem ipsum dolor sit amet, consectetur adipiscing elit.",
    x: 10,
    y: 20,
  },
  {
    id: "device2",
    deviceId: "000000482",
    name: "Printer B2",
    type: "printer",
    deviceType: "ELID Printer",
    controllerType: "Printer",
    status: "online",
    description: "Morem ipsum dolor sit amet, consectetur adipiscing elit.",
    x: 30,
    y: 40,
  },
];

function DraggableText({
  id,
  percentPosition,
  isDragging,
  containerRect,
  relocatingId,
  setRelocatingId,
  confirmPopoverId,
  setConfirmPopoverId,
  onConfirm,
  onCancel,
  originalPosition,
  activeId,
  interactionDisabled,
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
}) {
  const [open, setOpen] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const isRelocating = relocatingId === id;
  const isConfirmPopover = confirmPopoverId === id && !activeId;
  const device = DRAGGABLES.find((d) => d.id === id);
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
          className="w-[420px] p-8 rounded-3xl shadow-xl border border-gray-100 bg-[#f7f9fc] flex flex-col items-center gap-4 z-50"
          style={{ left: 0, top: 0 }}
        >
          <div className="-mt-16 mb-2 bg-white rounded-full shadow-lg p-3 border-4 border-white">
            <Computer className="w-16 h-16 text-primary" />
          </div>
          <div className="w-full text-left">
            <div className="text-3xl font-extrabold text-primary mb-1">
              {device?.name}
            </div>
            <div className="text-2xl text-gray-400 font-medium mb-6">
              Drag me to the area that fits your layout.
            </div>
          </div>
          <div className="flex w-full gap-4 mt-2">
            <Button
              variant="outline"
              className="flex-1 border-2 border-blue-900 text-blue-900 font-bold text-lg hover:bg-blue-50 py-5 rounded-2xl"
            >
              Select Floor & Area
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 bg-red-600 text-white font-bold text-lg hover:bg-red-700 py-5 rounded-2xl"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-blue-900 text-white font-bold text-lg hover:bg-blue-800 py-5 rounded-2xl"
              onClick={onConfirm}
            >
              Confirm
            </Button>
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
          className="w-80 p-6 rounded-2xl shadow-xl border border-gray-100 bg-[#f7f9fc] flex flex-col gap-4 z-50"
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
  // Use device.x and device.y for initial positions
  const initialPositions: Record<string, PercentPosition> = Object.fromEntries(
    DRAGGABLES.map((d) => [d.id, { x: d.x, y: d.y }])
  );
  const [positions, setPositions] =
    useState<Record<string, PercentPosition>>(initialPositions);
  const [defaultPositions, setDefaultPositions] =
    useState<Record<string, PercentPosition>>(initialPositions);
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
  }, [containerRect, imageLoaded]);

  // If container size changes after init, clamp positions to bounds
  useLayoutEffect(() => {
    if (!containerRect || !initialized) return;
    setPositions((old) => {
      const updated: Record<string, PercentPosition> = { ...old };
      DRAGGABLES.forEach((d) => {
        const pos = old[d.id];
        updated[d.id] = {
          x: Math.max(0, Math.min(pos.x, 100)),
          y: Math.max(0, Math.min(pos.y, 100)),
        };
      });
      return updated;
    });
  }, [containerRect, initialized]);

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

  return (
    <Card className="flex flex-col gap-4 p-5 h-auto">
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
            {DRAGGABLES.map((d) => (
              <DraggableText
                key={d.id}
                id={d.id}
                percentPosition={positions[d.id]}
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
              />
            ))}
            <DragOverlay>
              {activeId ? (
                <div className="cursor-move select-none p-2 bg-white/90 rounded-md border border-gray-400 shadow-lg text-gray-900 font-bold">
                  {DRAGGABLES.find((d) => d.id === activeId)?.name ||
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
    </Card>
  );
}
