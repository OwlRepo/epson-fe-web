import EVSCounts from "@/components/ui/evs-counts";
import { useOverviewCountData } from "@/hooks";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/overview"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <Overview />;
}

const Overview = () => {
  const {
    data: liveData,
    overallCountData,
    countData,
  } = useOverviewCountData({
    room: "overall",
    dataType: "live",
  });

  const employeeDivisions = liveData.filter((item) => item.type === "1");
  const visitorsDivisions = liveData.filter((item) => item.type === "2");

  console.log("employeeDivisions", employeeDivisions, visitorsDivisions);
  return (
    <div className="flex flex-col p-8">
      <div className="self-end mb-8">
        <EVSCounts
          type="compact"
          countType="overview_evs"
          countData={countData}
        />
      </div>
      {/* two col */}
      <div className="grid grid-cols-5 gap-8 mt-4 items-start">
        {/* 1st col */}
        <div className="col-span-3 grid grid-cols-3 gap-4 border-r border-gray-300 pr-8">
          <div className="col-span-3">
            <p className="text-2xl font-bold">Employee Division</p>
            <p className=" text-gray-600">
              TOTAL: {overallCountData?.employee ?? 0}
            </p>
          </div>

          {employeeDivisions.map((division) => (
            <div
              className={cn(
                "bg-blue-50 rounded p-6 flex flex-col h-full justify-between min-h-[200px] space-y-20"
              )}
            >
              <div className="flex flex-col space-y-2">
                <h3 className="font-bold mb-1 text-xl break-words">
                  {division.name}
                </h3>
              </div>

              <div className="flex justify-between mt-auto">
                <div className="flex flex-col text-[#0F0098]">
                  <span className="text-2xl font-bold ">
                    {division.evacuated}
                  </span>
                  <span>Evacuees</span>
                </div>

                <div className="flex flex-col text-[#980000]">
                  <span className="text-2xl font-bold">{division.missing}</span>
                  <span>Missing</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2nd row */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="col-span-3">
            <p className="text-2xl font-bold">Visitor/Services</p>
            <p className=" text-gray-600">
              TOTAL: {overallCountData?.visitor ?? 0}
            </p>
          </div>
          {visitorsDivisions.map((division) => (
            <div
              className={cn(
                "bg-blue-50 rounded p-6 flex flex-col h-full justify-between min-h-[200px] space-y-20"
              )}
            >
              <div className="flex flex-col space-y-2">
                <h3 className="font-bold mb-1 text-xl break-words">
                  {division.name}
                </h3>
              </div>

              <div className="flex justify-between mt-auto">
                <div className="flex flex-col text-[#0F0098]">
                  <span className="text-2xl font-bold ">
                    {division.evacuated}
                  </span>
                  <span>Evacuees</span>
                </div>

                <div className="flex flex-col text-[#980000]">
                  <span className="text-2xl font-bold">{division.missing}</span>
                  <span>Missing</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
