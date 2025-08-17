import CardSection from "@/components/layouts/CardSection";
import CardHeaderLeft from "@/components/ui/card-header-left";
import { DepartmentCard } from "@/components/ui/department-card";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useSectionData } from "@/hooks";
import Spinner from "@/components/ui/spinner";
import EVSCounts from "@/components/ui/evs-counts";

export const Route = createFileRoute(
  "/_authenticated/evacuation-monitoring/dashboard/divisions/$divisionId/$departmentId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({
    from: "/_authenticated/evacuation-monitoring/dashboard/divisions/$divisionId/$departmentId/",
  });
  const {
    data,
    isLoading,
    isConnected,
    countData: totalLogs,
  } = useSectionData({
    useSearchFrom:
      "/_authenticated/evacuation-monitoring/dashboard/divisions/$divisionId/$departmentId/",
  });

  return (
    <CardSection
      headerLeft={<CardHeaderLeft />}
      headerRight={<EVSCounts type="compact" countData={totalLogs} />}
    >
      <h2 className="text-2xl font-bold my-5">Sections</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {isConnected && !isLoading ? (
          data
            .filter((d) => d.name)
            .map((section) => (
              <Link
                to={`/evacuation-monitoring/dashboard/divisions/$divisionId/$departmentId/$sectionId`}
                params={{ ...params, sectionId: section.name }}
                key={section.name}
              >
                <DepartmentCard
                  title={section.name}
                  clockedIn={section.evacuated}
                  clockedOut={section.missing}
                  countLabelLeft="Evacuated"
                  countLabelRight="Missing"
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
