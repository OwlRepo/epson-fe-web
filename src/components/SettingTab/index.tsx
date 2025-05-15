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

interface SyncActivity {
  id: number;
  activity: "SCHEDULED" | "MANUAL";
  totalSyncTarget: number;
  totalSynced: number;
  dateTime: string;
}
// Mock data for the example
const MOCK_DATA: SyncActivity[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  activity: i % 2 === 0 ? "SCHEDULED" : "MANUAL",
  totalSyncTarget: 2000 + i,
  totalSynced: 1000 + i,
  dateTime: `6:00 PM`,
}));

const SettingTab = () => {
  const search = useSearch({
    from: "/_authenticated/attendance-monitoring/settings",
  });
  const navigate = useNavigate({
    from: "/attendance-monitoring/settings",
  });

  const { errorStyle } = useToastStyleTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SyncActivity[]>([]);

  const [syncTime, setSyncTime] = useState({
    am: "",
    pm: "",
  });

  const [timeKey, setTimeKey] = useState<"am" | "pm">("am");

  const [open, setOpen] = useState(false);
  const { mutate, isError } = useMutateSyncEmployees();

  // Get pagination values from URL params
  const currentPage = parseInt(search.page || "1");
  const pageSize = parseInt(search.pageSize || "10");

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(MOCK_DATA);
      setIsLoading(false);
    };

    fetchData();
  }, [currentPage, pageSize, search.filter_role, search.filter_status]);

  useEffect(() => {
    if (isError) {
      toast.error("Error syncing employees", {
        description: "Please try again later.",
        className: "bg-red-50 border-red-200 text-black",
        style: errorStyle,
      });
    }
  }, [isError]);

  const columns: Column[] = [
    { key: "activity", label: "Activity" },
    { key: "totalSyncTarget", label: "Total Sync Target" },
    { key: "totalSynced", label: "Total Synced" },
    { key: "dateTime", label: "Date & Time" },
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

  // Filter data based on search params
  const filterData = (data: SyncActivity[]) => {
    return data.filter((item) => {
      const matchesActivity =
        !search.filter_activity || item.activity === search.filter_activity;
      const matchesDateTime =
        !search.filter_date_time || item.dateTime === search.filter_date_time;

      return matchesActivity && matchesDateTime;
    });
  };

  // Apply filtering and pagination
  const filteredData = filterData(data);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
          <Button className="w-full mt-4" onClick={() => mutate()}>
            Sync Now
          </Button>
        </div>

        {/* Second Column (Expands Fully) */}
        <div className="bg-white col-span-2 p-4 rounded-lg shadow-md overflow-hidden flex flex-col">
          <p className="font-extrabold">List of Activities</p>
          <div className="flex-1 overflow-auto">
            <DynamicTable
              columns={columns}
              data={paginatedData}
              filters={filters}
              pagination={{
                currentPage,
                pageSize,
                totalPages: Math.ceil(filteredData.length / pageSize),
                totalItems: filteredData.length,
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onFilter={handleFilter}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      <TimePickerModal
        open={open}
        onOpenChange={() => setOpen(false)}
        onDone={(value) => {
          setSyncTime((prev) => ({ ...prev, [timeKey]: value }));
          setOpen(false);
        }}
      />
    </>
  );
};

export default SettingTab;
