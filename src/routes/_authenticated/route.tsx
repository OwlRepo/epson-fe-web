import api from "@/config/axiosInstance";
import { getEVSAppBaseUrl, getIsEVS } from "@/utils/env";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const validateSession = async () => {
  await api
    .post(`/api/${getIsEVS() ? "evs" : "users"}/validate`)
    .catch(async () => {
      await api
        .post(`/api/${getIsEVS() ? "evs" : "users"}/refresh-token`, {
          refreshToken: localStorage.getItem("refreshToken"),
        })
        .then((res) => {
          if (res.status === 200 && res.data.success) {
            localStorage.setItem("token", res.data.data.token);
            localStorage.setItem("refreshToken", res.data.data.refreshToken);
            localStorage.setItem(
              "evsURL",
              `${getEVSAppBaseUrl()}/validate-session?token=${res.data.data.token}`
            );
            validateSession();
          }
        })
        .catch(() => {
          localStorage.clear();
          throw redirect({
            to: "/",
            replace: true,
          });
        });
    });
};
export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  loader: () => {
    return validateSession();
  },
});

function RouteComponent() {
  return <Outlet />;
}
