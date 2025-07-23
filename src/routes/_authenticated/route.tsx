import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: async ({}) => {
    // beforeLoad: async ({ location }) => {
    if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
      // throw redirect({ to: "/", search: { redirect: location.href } });
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
