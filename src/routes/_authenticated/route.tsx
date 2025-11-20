import api from "@/config/axiosInstance";
import { getEVSAppBaseUrl, getIsEVS } from "@/utils/env";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const validateSession = async (): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) {
    localStorage.clear();
    throw redirect({
      to: "/",
      replace: true,
    });
  }

  try {
    await api.post(`/api/${getIsEVS() ? "evs" : "users"}/validate`);
  } catch (error) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      localStorage.clear();
      throw redirect({
        to: "/",
        replace: true,
      });
    }

    try {
      const res = await api.post(
        `/api/${getIsEVS() ? "evs" : "users"}/refresh-token`,
        {
          refreshToken,
        }
      );
      if (res.status === 200 && res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("refreshToken", res.data.data.refreshToken);
        localStorage.setItem(
          "evsURL",
          `${getEVSAppBaseUrl()}/validate-session?token=${res.data.data.token}`
        );
        // Retry validation after refresh token succeeds
        try {
          await api.post(`/api/${getIsEVS() ? "evs" : "users"}/validate`);
          return;
        } catch (retryError) {
          throw error;
        }
      }
      throw new Error("Refresh token failed");
    } catch (refreshError: any) {
      // If refresh token fails or is a redirect, re-throw it
      if (
        refreshError &&
        typeof refreshError === "object" &&
        "to" in refreshError
      ) {
        throw refreshError;
      }
      // Only logout on 401/403 errors (expired/invalid tokens)
      const status = refreshError?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.clear();
        throw redirect({
          to: "/",
          replace: true,
        });
      }
      // For other errors (network, 500, etc.), rethrow original validation error
      throw error;
    }
  }
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
