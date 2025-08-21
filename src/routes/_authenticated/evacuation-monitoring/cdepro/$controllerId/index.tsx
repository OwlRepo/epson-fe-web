import { EpsonFlame } from "@/assets/svgs";
import AssignPersonnelDialog from "@/components/dialogs/AssignPersonnelDialog";
import CardSection from "@/components/layouts/CardSection";
import { Button } from "@/components/ui/button";
import CardHeaderLeft from "@/components/ui/card-header-left";
import EVSCounts from "@/components/ui/evs-counts";
import { LiveDataTable } from "@/components/ui/live-data-table";
import Spinner from "@/components/ui/spinner";
import { useCDEPROControllerData } from "@/hooks/useCDEPROControllerData";
import { cn } from "@/lib/utils";
import matchesFilter from "@/utils/matchesFilter";
import {
  createFileRoute,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";

import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/cdepro/$controllerId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_authenticated/evacuation-monitoring/cdepro/$controllerId/",
  });
  const {
    emitData,
    data,
    isLoading,
    isConnected,
    countData: totalLogs,
    clearData,
  } = useCDEPROControllerData({
    room: "cdepro_department" + params.controllerId,
    dataType: "live",
  });

  const [open, setOpen] = useState(false);
  const [assignedPersonnel, setAssignedPersonnel] = useState<any>({});

  const navigate = useNavigate({
    from: "/evacuation-monitoring/cdepro/$controllerId",
  });

  const search = useSearch({
    from: "/_authenticated/evacuation-monitoring/cdepro/$controllerId/",
  });

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

  return (
    <>
      <CardSection
        headerRight={
          <div className="flex flex-col items-end">
            <EVSCounts
              countData={totalLogs}
              type="compact"
              countType="cdepro"
            />
            <Button
              variant="evacuation"
              className="text-white mt-2"
              onClick={() => {
                setOpen(true);
                setAssignedPersonnel(null);
              }}
            >
              Assign Personnel
            </Button>
          </div>
        }
        headerLeft={
          <CardHeaderLeft
            title={
              <div className="flex items-center space-x-2">
                <EpsonFlame />
                <b className="text-[20px] text-primary">Live Data</b>
              </div>
            }
          />
        }
      >
        {isConnected && !isLoading ? (
          <div className="flex">
            <LiveDataTable
              clearSocketData={clearData}
              pageSize={Number(search.pageSize) || 10}
              onPageSizeChange={handlePageSizeChange}
              columns={[
                {
                  key: "ID",
                  label: "ID",
                },
                {
                  key: "FullName",
                  label: "NAME",
                },
                {
                  key: "Position",
                  label: "POSITION",
                },
                {
                  key: "ContactNo",
                  label: "CONTACT NO.",
                },
              ]}
              data={data
                .map((employeeData: any) => {
                  const {
                    ID,
                    FirstName,
                    LastName,
                    ERT,
                    ContactNo,
                    Status,
                    EmailAddress,
                    Department,
                    EmployeeID,
                    EM,
                    MIFARE,
                    UHF,
                  } = employeeData;
                  return {
                    ID: ID,
                    FullName: `${FirstName} ${LastName}`,
                    Position: ERT,
                    ContactNo,
                    Status: Status,
                    FirstName,
                    LastName,
                    EmailAddress,
                    ERT,
                    Department,
                    EmployeeID,
                    RowID: ID,
                    EM,
                    MIFARE,
                    UHF,
                  };
                })
                .filter((item) => {
                  const matchesPosition = matchesFilter(
                    item.Position ?? "",
                    search.filter_position
                  );
                  const matchesContactNo = matchesFilter(
                    item.ContactNo ?? "",
                    search.filter_contact_no
                  );
                  return matchesPosition && matchesContactNo;
                })
                .reverse()
                .map((item: any) => {
                  return {
                    ...item,
                    ID: (
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            `h-4 w-4 rounded-full`,
                            item?.Status === "Active" && "bg-green-500",
                            item?.Status === "In Active" && "bg-red-500",
                            item?.Status === undefined && "bg-gray-500"
                          )}
                        />
                        <span>{item.ID}</span>
                      </div>
                    ),
                  };
                })}
              isLoading={false}
              onRowClick={(row) => {
                setOpen(true);
                setAssignedPersonnel(row);
              }}
              tableId="cdepro-controller-table"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10">
            <Spinner />
            <p>Loading...</p>
          </div>
        )}
      </CardSection>

      {open && (
        <AssignPersonnelDialog
          open={open}
          onOpenChange={setOpen}
          assignedPersonnel={assignedPersonnel}
          emitData={emitData}
        />
      )}
    </>
  );
}
