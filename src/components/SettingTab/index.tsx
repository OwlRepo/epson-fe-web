import { Button } from "@/components/ui/button";
import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/dynamic-table";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Moon, RefreshCw, SunMedium, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SyncTimeInput from "./SyncTimeInput";
import TimePickerModal from "./TimePickerModal";
import { useMutateSyncEmployees } from "@/hooks/mutation/useMutateSyncEmployees";
import { toast } from "sonner";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import { useGetSyncActivities } from "@/hooks/query/useGetSyncActivities";
import { objToParams } from "@/utils/objToParams";
import dayjs from "dayjs";
import Spinner from "../ui/spinner";
import { useMutateSyncSchedule } from "@/hooks/mutation/useMutateSyncSchedule";
import { useGetSyncingSchedule } from "@/hooks/query/useGetSyncingSchedule";
import { Input } from "../ui/input";
import { useUploadCards } from "@/hooks/mutation/useUploadCards";
import { useSocket } from "@/hooks";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { io, Socket } from "socket.io-client";
import { getApiSocketBaseUrl } from "@/utils/env";
import { useGetSyncStatus } from "@/hooks/query/useGetSyncStatus";
import { cn } from "@/lib/utils";

interface SyncActivity {
  ID: number;
  Activity: "SCHEDULED" | "MANUAL";
  TotalSyncTarget: number;
  TotalSynced: number;
  DateTime: string;
}

const SettingTab = () => {
  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/settings",
  });
  const navigate = useNavigate({
    from: "/attendance-monitoring/settings",
  });

  const { errorStyle, successStyle, infoStyle } = useToastStyleTheme();
  const [data, setData] = useState<SyncActivity[]>([]);
  const [syncTime, setSyncTime] = useState({
    am: "",
    pm: "",
  });

  const { emitData } = useSocket({ room: "updates" });

  const [timeKey, setTimeKey] = useState<"am" | "pm">("am");

  const [open, setOpen] = useState(false);

  const { mutate, isError, isSuccess, isPending } = useMutateSyncEmployees();
  const {
    mutate: mutateSched,
    isError: isErrorSched,
    isSuccess: isSuccessSched,
    isPending: isPendingSched,
  } = useMutateSyncSchedule();

  const {
    mutate: uploadCards,
    isPending: isUploading,
    isSuccess: isUploadSuccess,
    isError: isUploadError,
  } = useUploadCards();

  const handleSyncData = () => {
    setIsCheckSyncStatusEnabled(true);
    mutate();
  };

  const [isCheckSyncStatusEnabled, setIsCheckSyncStatusEnabled] =
    useState(false);
  const {
    data: syncStatus,
    isFetched: isFetchedSyncStatus,
    refetch: refetchSyncStatus,
  } = useGetSyncStatus({ enabled: isCheckSyncStatusEnabled });

  useEffect(() => {
    refetchSyncStatus();
  }, []);

  useEffect(() => {
    if (isFetchedSyncStatus) {
      switch (syncStatus) {
        case "completed":
          setIsCheckSyncStatusEnabled(false);
          break;
        case "pending":
          setIsCheckSyncStatusEnabled(true);
          break;
        default:
          break;
      }
    }
  }, [isFetchedSyncStatus, syncStatus]);
  // Get pagination values from URL params
  const [totalPages, setTotalPages] = useState(10);
  const [totalItems, setTotalItems] = useState(10);

  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.pageSize || "10");

  const { data: syncSched } = useGetSyncingSchedule();

  const [fileName, setFileName] = useState<File>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [syncDateTime, setSyncDateTime] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file);
    }
  };

  useEffect(() => {
    if (syncSched) {
      setSyncTime({
        am: syncSched[0]?.scheduleTime,
        pm: syncSched[1]?.scheduleTime,
      });
    }
  }, [syncSched]);

  const {
    data: syncActivities,
    isLoading,
    refetch,
  } = useGetSyncActivities(objToParams(search) as any);
  // Simulate data fetching
  useEffect(() => {
    if (Array.isArray(syncActivities?.data)) {
      const data = syncActivities?.data?.map((item: SyncActivity) => ({
        ...item,
        DateTime: dayjs(item?.DateTime).format("hh:mm A"),
      }));
      setData(data);
      setTotalPages(syncActivities?.pagination?.totalPages ?? 10);
      setTotalItems(syncActivities?.pagination?.totalItems ?? 10);
    }
  }, [syncActivities]);

  useEffect(() => {
    refetch();
  }, [search]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Sync Request Sent", {
        description: "Your Sync Request has been sent.",
        style: successStyle,
      });
    }
  }, [isError, isSuccess, isPending]);

  useEffect(() => {
    if (isErrorSched) {
      toast.error("Error saving syncing schedule", {
        description: "Please try again later.",
        style: errorStyle,
      });
    }
    if (isSuccessSched) {
      toast.success("Success saving syncing schedule", {
        description: "Your syncing schedule  has been saved. You're all set!",
        style: successStyle,
      });
      setOpen(false);
    }
    if (isPendingSched) {
      toast.info("Saving syncing schedule", {
        description: "Please Wait.",
        style: infoStyle,
      });
    }
  }, [isErrorSched, isSuccessSched, isPendingSched]);

  useEffect(() => {
    if (isUploadError) {
      toast.error("Error saving uploading cards", {
        description: "Please try again later.",
        style: errorStyle,
      });
      setFileName(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    if (isUploadSuccess) {
      toast.success("Success saving uploading cards", {
        description: "Your uploading cards  has been saved. You're all set!",
        style: successStyle,
      });
      setFileName(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      emitData("users");
    }
    if (isUploading) {
      toast.info("Uploading Cards", {
        description: "Please Wait.",
        style: infoStyle,
      });
    }
  }, [isUploadError, isUploadSuccess, isUploading]);

  const columns: Column[] = [
    { key: "Activity", label: "Activity" },
    { key: "TotalSyncTarget", label: "Total Sync Target" },
    { key: "TotalSynced", label: "Total Synced" },
    { key: "DateTime", label: "Date & Time" },
  ];

  // Filter definitions
  const filters: Filter[] = [
    {
      key: "Activity",
      label: "Activity",
      options: [
        { label: "SCHEDULED", value: "SCHEDULED" },
        { label: "MANUAL", value: "MANUAL" },
      ],
    },
    {
      key: "DateTime",
      label: "Date & TIme",
      options: [
        { label: "6:00 PM", value: "6:00 PM" },
        { label: "3:00 AM", value: "3:00 AM" },
      ],
      singleSelect: true,
    },
  ];

  // Handlers for table interactions
  const handlePageChange = (page: number) => {
    const parsedPage = parseInt(String(page));
    if (!isNaN(parsedPage) && parsedPage > 0) {
      navigate({
        search: (prev) => ({
          ...prev,
          page: String(parsedPage),
        }),
        replace: true,
      });
    }
  };

  const handlePageSizeChange = (size: number) => {
    const parsedSize = parseInt(String(size));
    if (!isNaN(parsedSize) && parsedSize > 0) {
      navigate({
        search: (prev) => ({
          ...prev,
          limit: String(parsedSize),
          page: "1",
        }),
        replace: true,
      });
    }
  };

  const handleFilter = (key: string, value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: value || undefined,
        page: "1",
      }),
      replace: true,
    });
  };

  const handleOpenModal = (key: "am" | "pm") => {
    setOpen(true);
    setTimeKey(key);
  };

  let socketInstance: Socket;
  const SOCKET_URL = getApiSocketBaseUrl();

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

  const handleSyncTime = () => {
    console.log("🚀 Socket emitting to room:", "sync_time");
    console.log("📦 Socket payload:", syncDateTime);
    socketInstance.emit("sync_time", syncDateTime);
    console.log("✨ Socket emission sent successfully");
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2 grid-rows-[auto_1fr] h-full">
        {/* First Column (Auto Height) */}
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md self-start">
            <div className="flex justify-between items-center">
              <p className="font-bold flex gap-2">
                <RefreshCw />
                Scheduled Syncing
              </p>
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  syncStatus?.status?.toLowerCase() === "pending" &&
                    "bg-amber-400",
                  syncStatus?.status?.toLowerCase() === "completed" &&
                    "bg-green-400",
                  syncStatus?.status?.toLowerCase() === "failed" &&
                    "bg-red-400",
                  !syncStatus?.status && "bg-gray-400"
                )}
              />
            </div>
            <SyncTimeInput
              icon={<SunMedium />}
              onEdit={() => handleOpenModal("am")}
              time={syncTime.am}
            />
            <SyncTimeInput
              icon={<Moon />}
              onEdit={() => handleOpenModal("pm")}
              time={syncTime.pm}
            />

            <p className="mt-4 font-bold text-center">or</p>
            {!isPending && (
              <Button
                className="w-full mt-4"
                disabled={syncStatus?.status?.toLowerCase() === "pending"}
                onClick={handleSyncData}
              >
                Sync Now
              </Button>
            )}
            {isPending && (
              <Button className="w-full mt-4  gap-2" disabled>
                <Spinner size={15} color="white" containerClassName="w-6" />
                Syncing Now
              </Button>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md self-start mt-4 ">
            <p className="font-bold flex gap-2">
              <Upload />
              Upload Bulk Enrollment File
            </p>
            <div className="grid gap-2 mt-6">
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="cursor-pointer"
                accept=".csv"
              />
              {!isUploading && (
                <Button
                  className="w-full mt-4"
                  onClick={() => {
                    if (fileName) {
                      uploadCards(fileName);
                    }
                  }}
                  disabled={!Boolean(fileName)}
                >
                  Upload Now
                </Button>
              )}

              {isUploading && (
                <Button
                  className="w-full mt-4  gap-2"
                  onClick={() => mutate()}
                  disabled
                >
                  <Spinner size={15} color="white" containerClassName="w-6" />
                  Uploading Now
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md self-start mt-4 ">
            <p className="font-bold flex gap-2">
              <RefreshCw />
              Sync Time
            </p>
            <div className="grid gap-2 mt-6">
              <DateTimePicker value={syncDateTime} onChange={setSyncDateTime} />
              <Button onClick={handleSyncTime} disabled={!syncDateTime}>
                Sync Now
              </Button>
            </div>
          </div>
        </div>

        {/* Second Column (Expands Fully) */}
        <div className="bg-white col-span-2 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
          <p className="font-extrabold">List of Activities</p>
          <div className="flex-1 overflow-auto mt-4">
            <DynamicTable
              columns={columns}
              data={data}
              filters={filters}
              pagination={{
                currentPage,
                pageSize,
                totalPages,
                totalItems,
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onFilter={handleFilter}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      {open && (
        <TimePickerModal
          isLoading={isPendingSched}
          value={syncTime[timeKey]}
          open={open}
          onOpenChange={() => setOpen(false)}
          onDone={(value) => {
            const id = timeKey === "am" ? "1" : "2";
            setSyncTime((prev) => ({ ...prev, [timeKey]: value }));
            mutateSched({
              id,
              payload: {
                scheduleTime: value,
              },
            });
          }}
        />
      )}
    </>
  );
};

export default SettingTab;
