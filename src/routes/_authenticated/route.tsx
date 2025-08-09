import api from "@/config/axiosInstance";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  loader: async ({ location }) => {
    const { data } = await api.post(`/api/users/validate`);
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
