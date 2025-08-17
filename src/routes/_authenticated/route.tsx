import api from "@/config/axiosInstance";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  loader: async () => {
    const { data, status } = await api.post(`/api/users/validate`).catch(() => {
      return {
        data: { success: false, message: "Invalid token" },
        status: 401,
      };
    });

    if (!data.success && status !== 200) {
      const { data: refreshData } = await api
        .post(`/api/users/refresh-token`, {
          refreshToken: localStorage.getItem("refreshToken"),
        })
        .catch(() => {
          return {
            data: { success: false, message: "Invalid token" },
            status: 401,
          };
        });
      localStorage.setItem("token", refreshData.token);
      localStorage.setItem("refreshToken", refreshData.refreshToken);
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
