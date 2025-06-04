import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import CardHeaderRight from "@/components/ui/card-header-right";
import { DepartmentCard } from "@/components/ui/department-card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDivisionData } from "@/hooks";
import Spinner from "@/components/ui/spinner";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/divisions/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data,
    isLoading,
    isConnected,
    countData: totalLogs,
  } = useDivisionData();

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
      <h2 className="text-2xl font-bold my-5">Divisions</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {isConnected && !isLoading ? (
          data
            .filter((d) => d.name)
            .map((division) => (
              <Link
                to={`/evacuation-monitoring/dashboard/divisions/$divisionId`}
                params={{ divisionId: division.name }}
                key={division.name}
              >
                <DepartmentCard
                  title={division.name}
                  clockedIn={division.in}
                  clockedOut={division.out}
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
