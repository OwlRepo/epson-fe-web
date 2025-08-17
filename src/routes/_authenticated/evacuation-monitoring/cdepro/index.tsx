import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import { DepartmentCard } from "@/components/ui/department-card";
import EVSCounts from "@/components/ui/evs-counts";
import Spinner from "@/components/ui/spinner";
import { useCDEPROData } from "@/hooks/useCDEPROData";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/cdepro/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data,
    isLoading,
    isConnected,
    countData: totalLogs,
  } = useCDEPROData();

  return (
    <CardSection
      headerLeft={<CardHeaderLeft />}
      headerRight={
        <EVSCounts countData={totalLogs} type="compact" countType="cdepro" />
      }
    >
      <h2 className="text-2xl font-bold my-5">CDEPRO</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {isConnected && !isLoading ? (
          data
            .filter((d) => d.Department)
            .map((division) => (
              <Link
                to={`/evacuation-monitoring/cdepro/$controllerId`}
                params={{ controllerId: division.Department }}
                key={division.Department}
              >
                <DepartmentCard
                  title={division.Department}
                  clockedIn={division.active}
                  clockedOut={division.inactive}
                  countLabelLeft="Active"
                  countLabelRight="Inactive"
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
