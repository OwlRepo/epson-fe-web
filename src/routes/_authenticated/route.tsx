import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  loader: async () => {
    await api.post(`/api/${getIsEVS() ? "evs" : "users"}/validate`).catch(async () => {
      const { data: refreshData } = await api
        .post(`/api/${getIsEVS() ? "evs" : "users"}/refresh-token`, {
          refreshToken: localStorage.getItem("refreshToken"),
        })
        .catch(() => {
          return {
            data: { success: false, message: "Invalid token" },
            status: 401,
          };
        });
      localStorage.setItem("token", refreshData.data.token);
      localStorage.setItem("refreshToken", refreshData.data.refreshToken);
    });
  },
});

function RouteComponent() {
  return <Outlet />;
}
