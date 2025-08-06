import {
  ClockedInIcon,
  ClockedOutIcon,
  EpsonFlame,
  InPremisesIcon,
} from "@/assets/svgs";
import type { VisitorData } from "@/components/BasicInformationForm";

import CardSection from "@/components/layouts/CardSection";
import AttendanceCountCard from "@/components/ui/attendance-count-card";
import { Button } from "@/components/ui/button";
import CardHeaderLeft from "@/components/ui/card-header-left";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { LiveDataTable } from "@/components/ui/live-data-table";
import Spinner from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useSocket } from "@/hooks";
import { useCheckoutVisitor } from "@/hooks/mutation/useCheckoutVisitor";
import { useGetVisitorById } from "@/hooks/query/useGetVisitorById";
import { useOverviewCountData } from "@/hooks/useOverviewCountData";
import useToastStyleTheme from "@/hooks/useToastStyleTheme";
import usePortStore from "@/store/usePortStore";
import formatCountWithCommas from "@/utils/formatCountWithCommas";
import { readRFIDData } from "@/utils/rfidReaderCommand";
import { Dialog, type DialogProps } from "@radix-ui/react-dialog";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useLiveDataTableStore from "@/store/vms/overview/useLiveDataTableStore";

export const Route = createFileRoute(
  "/_authenticated/visitor-management/dashboard/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate({
    from: "/visitor-management/dashboard/overview",
  });
  const search = useSearch({
    from: "/_authenticated/visitor-management/dashboard/overview",
  });

  //employee data
  const [isOpen, setIsOpen] = useState(false);
  const [visitorID, setVisitorID] = useState("");
  const { data: visitor } = useGetVisitorById(visitorID);

  // Add handler for page size changes
  const handlePageSizeChange = (newPageSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageSize: String(newPageSize),
      }),
      replace: true,
    });
  };

  // Handle filter changes
  const handleFilter = (key: string, value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [`filter_${key}`]: value || undefined,
      }),
      replace: true,
    });
  };

  // Handle search using socket functionality
  const handleSearch = (searchTerm: string) => {
    searchData(searchTerm);
  };

  const { flaggedRecords, setFlaggedRecords } = useLiveDataTableStore();

  const {
    data: liveData,
    isLoading: isLiveDataLoading,
    isConnected: isLiveDataConnected,
    countData,
    clearData,
    emitData,
    searchData,
    clearSearch,
    searchTerm,
  } = useOverviewCountData({
    room: "VMS",
    dataType: "live",
    statusFilter: flaggedRecords,
  });

  return (
    <>
      <div className="space-y-8">
        <CardSection headerLeft={<CardHeaderLeft />}>
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <AttendanceCountCard
              count={
                countData?.inside
                  ? parseInt(formatCountWithCommas(countData.inside))
                  : 0
              }
              icon={<InPremisesIcon />}
              subtitle="Inside premises"
            />
            <AttendanceCountCard
              count={
                countData?.in
                  ? parseInt(formatCountWithCommas(countData.in))
                  : 0
              }
              icon={<ClockedInIcon />}
              subtitle="Checked in"
              variant="success"
            />
            <AttendanceCountCard
              count={
                countData?.out
                  ? parseInt(formatCountWithCommas(countData.out))
                  : 0
              }
              icon={<ClockedOutIcon />}
              subtitle="Check out"
              variant="error"
            />
          </div>
        </CardSection>
        <CardSection
          headerRight={
            isLiveDataConnected &&
            !isLiveDataLoading && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Flagged Records
                </span>
                <Switch
                  id="airplane-mode"
                  className="data-[state=checked]:bg-primary-evs"
                  checked={flaggedRecords}
                  onCheckedChange={setFlaggedRecords}
                  disabled={
                    !isLiveDataConnected ||
                    isLiveDataLoading ||
                    !liveData.length
                  }
                />
              </div>
            )
          }
          headerLeft={
            <CardHeaderLeft
              title={
                <div className="flex items-center space-x-2">
                  <EpsonFlame />
                  <b className="text-[20px] text-primary">Live Data</b>
                </div>
              }
              subtitle=""
            />
          }
        >
          {isLiveDataConnected && !isLiveDataLoading ? (
            <div className="flex">
              <LiveDataTable
                pageSize={Number(search.pageSize) || 10}
                onPageSizeChange={handlePageSizeChange}
                clearSocketData={clearData}
                emitSocketData={emitData}
                searchTerm={searchTerm}
                onClearSearch={clearSearch}
                onRowClick={(row) => {
                  setVisitorID(row.ID);
                  setIsOpen(true);
                }}
                columns={[
                  {
                    key: "ID",
                    label: "ID",
                  },
                  {
                    key: "Name",
                    label: "NAME",
                  },
                  {
                    key: "Purpose",
                    label: "PURPOSE",
                  },
                  {
                    key: "clocked_in",
                    label: "CHECKED IN",
                  },
                  {
                    key: "clocked_out",
                    label: "CHECKED OUT",
                  },
                ]}
                filters={[
                  // {
                  //   key: "employee_id",
                  //   label: "ID",
                  //   options: Array.from(
                  //     new Set(liveData.map((item) => item.ID))
                  //   ).map((item) => ({
                  //     label: item,
                  //     value: item,
                  //   })),
                  // },
                  // {
                  //   key: "Name",
                  //   label: "Name",
                  //   options: Array.from(
                  //     new Set(liveData.map((item) => item.Name))
                  //   ).map((item) => ({
                  //     label: item,
                  //     value: item,
                  //   })),
                  // },
                  {
                    key: "clocked_in",
                    label: "Checked In",
                    options: Array.from(
                      new Set(liveData.map((item) => item.clocked_in ?? "-"))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                  {
                    key: "clocked_out",
                    label: "Checked Out",
                    options: Array.from(
                      new Set(liveData.map((item) => item.clocked_out ?? "-"))
                    ).map((item) => ({
                      label: item,
                      value: item,
                    })),
                  },
                ]}
                data={liveData
                  .map((visitorData) => {
                    const {
                      ID,
                      Name,
                      clocked_in,
                      clocked_out,
                      Purpose,
                      status,
                    } = visitorData;
                    return {
                      ID: ID,
                      Name: Name,
                      Purpose: Purpose,
                      clocked_in: clocked_in,
                      clocked_out: clocked_out,
                      status: status,
                    };
                  })
                  .filter((item) => {
                    const matchesId =
                      !search.filter_ID || item.ID === search.filter_ID;
                    const matchesName =
                      !search.filter_Name || item.Name === search.filter_Name;
                    const matchesPurpose =
                      !search.filter_Purpose ||
                      item.Purpose === search.filter_Purpose;
                    const matchesClockedIn =
                      !search.filter_clocked_in ||
                      item.clocked_in === search.filter_clocked_in;
                    const matchesClockedOut =
                      !search.filter_clocked_out ||
                      item.clocked_out === search.filter_clocked_out;

                    return (
                      matchesId &&
                      matchesName &&
                      matchesPurpose &&
                      matchesClockedIn &&
                      matchesClockedOut
                    );
                  })
                  .reverse()}
                onFilter={handleFilter}
                onSearch={handleSearch}
                routeSearch={search}
                isLoading={false}
                tableId="divisions-departments-sections-table"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10">
              <Spinner />
              <p>Loading...</p>
            </div>
          )}
        </CardSection>
      </div>
      {isOpen && (
        <VisitorInformationDialog
          open
          visitor={visitor}
          onOpenChange={setIsOpen}
        />
      )}
    </>
  );
}

interface VisitorInfoDialogProps extends DialogProps {
  visitor?: VisitorData;
  isLoading?: boolean;
}

export const VisitorInformationDialog = ({
  open,
  visitor,
  onOpenChange,
  isLoading,
}: VisitorInfoDialogProps) => {
  const { port, setPort } = usePortStore((store) => store);
  const { emitData } = useSocket({ room: "updates" });

  const { mutate: checkoutVisitor, isSuccess } = useCheckoutVisitor();
  const { infoStyle, errorStyle } = useToastStyleTheme();
  const [isLinking, setIsLinking] = useState(false);
  const [socketData, setSocketData] = useState({});
  const handleLinkCard = async () => {
    try {
      let portToUse = port;

      if (!portToUse) {
        const newPort = await navigator.serial.requestPort();
        await newPort.open({ baudRate: 57600 });
        setPort(newPort);
        portToUse = newPort;
      }

      await linkCard(portToUse);
    } catch (error) {
      console.error("Failed to link card:", error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      emitData("visitor_reader", socketData);
    }
  }, [isSuccess]);

  const linkCard = async (newPort: any) => {
    if (!newPort) return;
    toast.info("Almost here - Tap your card", {
      description: "Please tap your card on the reader.",
      style: infoStyle,
    });
    try {
      console.log("card is linking");
      setIsLinking(true);
      const data = await readRFIDData(newPort);

      if (data?.epc === visitor?.UHF) {
        checkoutVisitor({
          VisitorID: visitor?.ID ?? "",
        });
        setSocketData({
          data: data?.epc,
          device_id: 0,
          date_receive: new Date(),
        });
      } else {
        toast.error("Oops! Card not matched", {
          description: "Please make sure your card is matched and try again.",
          className: "bg-red-50 border-red-200 text-black",
          style: errorStyle,
        });
      }
    } catch (error) {
      console.error("Error reading RFID data:", error);
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-auto p-8 bg-white rounded-lg shadow-xl">
        <DialogHeader className="flex flex-row justify-between items-center mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Visitor Information
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="flex gap-2">
            <div>
              {visitor?.Picture && visitor?.Picture !== "string" ? (
                <img
                  src={`data:image/jpeg;base64,${visitor?.Picture}`}
                  alt="Captured"
                  className="w-24 h-24  object-cover rounded-xl"
                />
              ) : (
                <div className="w-24 h-24 flex items-center justify-center  rounded-xl bg-slate-400">
                  <p className="text-2xl text-slate-200">
                    {visitor?.Name?.split(" ")
                      .map((word, index) => (index < 2 ? word[0] : ""))
                      .join("")}
                  </p>
                </div>
              )}
            </div>
            <div>
              <p>{`CARD ID: ${visitor?.UHF}`}</p>
              <h2 className="text-2xl font-bold text-primary mt-1">
                {visitor?.Name}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <TextDisplay
                  label="Contact No"
                  value={visitor?.ContactInformation}
                />
                <TextDisplay label="Host Person" value={visitor?.HostPerson} />
                <TextDisplay label="Company" value={visitor?.Company} />
                <TextDisplay label="Plate Number" value={visitor?.PlateNo} />
                <TextDisplay label="Room Reservation" value={visitor?.Room} />
                <TextDisplay
                  label="Beverage Request"
                  value={visitor?.Beverage}
                />
                <TextDisplay label="Purpose" value={visitor?.Purpose} />
                <TextDisplay label="Status" value={visitor?.Status} />
              </div>
            </div>
          </div>
        )}
        {!isLinking && !visitor?.CardSurrendered && (
          <Button onClick={handleLinkCard}>Check Out Now</Button>
        )}

        {isLinking && !visitor?.CardSurrendered && (
          <Button>
            <Spinner size={15} color="white" containerClassName="w-auto" />
            Reading
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface TextDisplayProps {
  label: string;
  value?: string;
}

const TextDisplay = ({ label, value }: TextDisplayProps) => {
  return (
    <div>
      <h2 className="text-lg font-bold text-primary mt-1">{label}</h2>
      <p>{value}</p>
    </div>
  );
};
