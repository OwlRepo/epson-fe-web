import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import CardHeaderRight from "@/components/ui/card-header-right";
import { DepartmentCard } from "@/components/ui/department-card";
import { createFileRoute, Link } from "@tanstack/react-router";
import Spinner from "@/components/ui/spinner";
import useEntryExitStore from "@/store/useEntryExitStore";
import { useEffect } from "react";
import { useEvacuationExitsData } from "@/hooks/useEvacuationExitsData";
export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/evacuation-exit/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data,
    isLoading,
    isConnected,
    countData: totalLogs,
  } = useEvacuationExitsData({
    room: "evs_device",
    dataType: "summary",
  });

  const { setCurrentSelectedDeviceType } = useEntryExitStore();

  useEffect(() => {
    setCurrentSelectedDeviceType(null);
  }, []);

  return (
    <CardSection
      headerLeft={<CardHeaderLeft />}
      headerRight={
        <CardHeaderRight
          clockedOut={totalLogs?.out}
          clockedIn={totalLogs?.in}
        />
      }
    >
      <h2 className="text-2xl font-bold my-5">Evacuation Exit</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {isConnected && !isLoading ? (
          data
            .filter((d) => d.DeviceName)
            .map((point) => (
              <Link
                to={`/evacuation-monitoring/dashboard/evacuation-exit/$deviceId`}
                onClick={() => setCurrentSelectedDeviceType(point.DeviceLabel)}
                params={{
                  deviceId: point.DeviceId.toString()
                    ? point.DeviceId.toString()
                    : point.DeviceName,
                }}
                key={point.DeviceId.toString() + point.DeviceName}
              >
                <DepartmentCard
                  title={point.DeviceName}
                  clockedIn={point.eva}
                  clockedOut={point.home}
                  countLabelLeft="Evacuated"
                  countLabelRight="Home"
                />
              </Link>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 w-full col-span-4 p-10">
            <Spinner />
            <p>Loading...</p>
          </div>
        )}
      </div>
    </CardSection>
  );
}
