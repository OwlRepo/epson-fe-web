import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  loader: async () => {
    await api
      .post(`/api/${getIsEVS() ? "evs" : "users"}/validate`)
      .catch(async () => {
        const { data: refreshData, status } = await api
          .post(`/api/${getIsEVS() ? "evs" : "users"}/refresh-token`, {
            refreshToken: localStorage.getItem("refreshToken"),
          })
          .catch(() => {
            localStorage.clear();
            throw redirect({
              to: "/",
              replace: true,
            });
          });
        if (status === 200 && refreshData.success) {
          localStorage.setItem("token", refreshData.data.token);
          localStorage.setItem("refreshToken", refreshData.data.refreshToken);
        }
      });
  },
});

function RouteComponent() {
  return <Outlet />;
}
