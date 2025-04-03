import { VisitorManagementLayout } from "@/components/layouts/VisitorManagementLayout";
import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/visitor-management")({
  component: RouteComponent,
  loader: async () => {
    // TODO: Get user profile from API
    return {
      userProfile: {
        name: "Ethan Blackwood",
        role: "HR Manager",
      },
    };
  },
});

function RouteComponent() {
  const { userProfile } = useLoaderData({
    from: "/_authenticated/visitor-management",
  });
  return (
    <VisitorManagementLayout userProfile={userProfile} defaultCollapsed={false}>
      <Outlet />
    </VisitorManagementLayout>
  );
}
