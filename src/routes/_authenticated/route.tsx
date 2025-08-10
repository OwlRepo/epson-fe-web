import api from "@/config/axiosInstance";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  loader: async ({ location }) => {
    const { data, status } = await api.post(`/api/users/validate`).catch(() => {
      return {
        data: { success: false, message: "Invalid token" },
        status: 401,
      };
    });
    if (!data.success && status !== 200) {
      toast.error(data.message);
      localStorage.clear();
      throw redirect({ to: "/", search: { redirect: location.href } });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
