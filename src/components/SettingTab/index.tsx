import { Button } from "@/components/ui/button";
import {
  DynamicTable,
  type Column,
  type Filter,
} from "@/components/ui/dynamic-table";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Moon, RefreshCw, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
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

  const [timeKey, setTimeKey] = useState<"am" | "pm">("am");

  const [open, setOpen] = useState(false);
  const { mutate, isError, isSuccess, isPending } = useMutateSyncEmployees();
  const {
    mutate: mutateSched,
    isError: isErrorSched,
    isSuccess: isSuccessSched,
    isPending: isPendingSched,
  } = useMutateSyncSchedule();

  // Get pagination values from URL params
  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.pageSize || "10");

  const { data: syncSched } = useGetSyncingSchedule();

  useEffect(() => {
    if (syncSched) {
      setSyncTime({
        am: syncSched[0]?.scheduleTime,
        pm: syncSched[1]?.scheduleTime,
      });
    }
  }, [syncSched]);

  const { data: syncActivities, isLoading } = useGetSyncActivities(
    objToParams(search) as any
  );
  // Simulate data fetching
  useEffect(() => {
    if (syncActivities) {
      const data = syncActivities.map((item: SyncActivity) => ({
        ...item,
        DateTime: dayjs(item?.DateTime).format("hh:mm A"),
      }));
      setData(data);
    }
  }, [syncActivities]);

  useEffect(() => {
    if (isError) {
      toast.error("Error syncing employees", {
        description: "Please try again later.",
        style: errorStyle,
      });
    }
    if (isSuccess) {
      toast.success("Success syncing employees", {
        description: "Your Employee List  has been synced. You're all set!",
        style: successStyle,
      });
    }
    if (isPending) {
      toast.info("Syncing employee list", {
        description:
          "Please Wait. Your Employee List is syncing. This will take time!",
        style: infoStyle,
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

  const columns: Column[] = [
    { key: "Activity", label: "Activity" },
    { key: "TotalSyncTarget", label: "Total Sync Target" },
    { key: "TotalSynced", label: "Total Synced" },
    { key: "DateTime", label: "Date & Time" },
  ];

  // Filter definitions
  const filters: Filter[] = [
    {
      key: "activity",
      label: "Activity",
      options: [
        { label: "SCHEDULED", value: "SCHEDULED" },
        { label: "MANUAL", value: "MANUAL" },
      ],
    },
    {
      key: "dateTime",
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
          pageSize: String(parsedSize),
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
        [`filter_${key}`]: value || undefined,
        page: "1",
      }),
      replace: true,
    });
  };

  const handleOpenModal = (key: "am" | "pm") => {
    setOpen(true);
    setTimeKey(key);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2 grid-rows-[auto_1fr] h-full">
        {/* First Column (Auto Height) */}
        <div className="bg-white p-4 rounded-lg shadow-md self-start">
          <p className="font-bold flex gap-2">
            <RefreshCw />
            Scheduled Syncing
          </p>
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
            <Button className="w-full mt-4" onClick={() => mutate()}>
              Sync Now
            </Button>
          )}
          {isPending && (
            <Button
              className="w-full mt-4  gap-2"
              onClick={() => mutate()}
              disabled
            >
              <Spinner size={15} color="white" containerClassName="w-6" />
              Syncing Now
            </Button>
          )}
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
                totalPages: 10,
                totalItems: 10,
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
