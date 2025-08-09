import api from "@/config/axiosInstance";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  loader: async ({ location }) => {
    // beforeLoad: async ({ location }) => {
    // if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
    //   throw redirect({ to: "/", search: { redirect: location.href } });
    //   throw redirect({ to: "/" });
    // }
    const { data } = await api.get(`/api/users/validate`);
    if (!data.success) {
      toast.error(data.message);
      localStorage.clear();
      throw redirect({ to: "/", search: { redirect: location.href } });
    }
    console.log("location.pathname", location.pathname);
  },
});

function RouteComponent() {
  return <Outlet />;
}
