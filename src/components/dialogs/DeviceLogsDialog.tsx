import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import type { DialogProps } from "@radix-ui/react-dialog";
import { useGetDeviceLogs } from "@/hooks/query/useGetDeviceLogs";
import { objToParams } from "@/utils/objToParams";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DatePickerWithRange } from "../ui/date-range-picker";
import dayjs from "dayjs";
import { Button } from "../ui/button";

export interface DeviceLogsDialogProps extends DialogProps {
  deviceName?: string;
  deviceId?: string;
}

const DeviceLogsDialog = ({
  open,
  onOpenChange,
  deviceName = "UNKNOWN",
  deviceId = "C66_T_20241024",
}: DeviceLogsDialogProps) => {
  const [status, setStatus] = useState(undefined);
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetDeviceLogs({
      params: objToParams({
        DeviceId: deviceId,
        Status: status,
        from_dmg_reports_date: dateRange?.from
          ? dayjs(dateRange.from).format("YYYY-MM-DD")
          : undefined,
        to_dmg_reports_date: dateRange?.to
          ? dayjs(dateRange.to).format("YYYY-MM-DD")
          : undefined,
      }),
    });

  // Flatten paginated results
  const logs = data?.pages.flatMap((page) => page.data) ?? [];

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: containerRef.current, threshold: 1.0 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {` Device Logs - [${deviceName}]`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Select
              onValueChange={(value: any) => setStatus(value)}
              value={status}
            >
              <SelectTrigger className="w-1/3 h-[44px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  {["Online", "Offline"].map((item, i) => (
                    <SelectItem value={item} key={i}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <DatePickerWithRange
              onSelect={(v: any) => setDateRange(v)}
              className="w-56 h-[40px] border-red-600"
            />
          </div>
          <Button
            onClick={() => {
              setDateRange({ from: undefined, to: undefined });
              setStatus(undefined);
            }}
          >
            Clear
          </Button>
        </div>
        <div
          ref={containerRef}
          className="max-h-[400px] overflow-y-auto border rounded-lg"
        >
          {/* Sticky header */}
          <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700 border-b bg-white sticky top-0 z-10 p-2">
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Date & Time</div>
            <div className="col-span-3">Message</div>
          </div>

          {/* Rows */}
          <div className="space-y-1">
            {logs.map((log) => (
              <div
                key={log.ID}
                className="grid grid-cols-6 gap-4 p-2 text-sm border-b hover:bg-gray-50"
              >
                <div
                  className={`font-medium col-span-1 ${
                    log.Status === "Online" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {log.Status}
                </div>
                <div className="col-span-2">{log.DateTime}</div>
                <div className="col-span-3">
                  {log.Message ?? <span className="text-gray-400">—</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Loader (sentinel) */}
          <div ref={loaderRef} className="p-4 text-center text-gray-500">
            {isFetchingNextPage
              ? "Loading more..."
              : hasNextPage
                ? "Scroll to load more"
                : "No more logs"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceLogsDialog;
