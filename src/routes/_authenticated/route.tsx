import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  // TODO: Add authentication check here when Login API is ready
  // beforeLoad: async ({ location }) => {
  //   if (!localStorage.getItem("user")) {
  //     throw redirect({ to: "/", search: { redirect: location.href } });
  //   }
  // },
});

function RouteComponent() {
  return <Outlet />;
}
