import api from "@/config/axiosInstance";
import { getEVSAppBaseUrl, getIsEVS } from "@/utils/env";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const validateSession = async (): Promise<void> => {
  try {
    await api.post(`/api/${getIsEVS() ? "evs" : "users"}/validate`);
  } catch (error) {
    // Store the initial validation error to potentially throw later
    const validationError = error;
    try {
      const res = await api.post(
        `/api/${getIsEVS() ? "evs" : "users"}/refresh-token`,
        {
          refreshToken: localStorage.getItem("refreshToken"),
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
          // Success after refresh - don't throw error
          return;
        } catch (retryError) {
          // Retry failed - throw the original validation error so caller can show toast
          throw validationError;
        }
      }
      throw new Error("Refresh token failed");
    } catch (refreshError) {
      // If refresh token fails or is a redirect, re-throw it
      if (
        refreshError &&
        typeof refreshError === "object" &&
        "to" in refreshError
      ) {
        throw refreshError;
      }
      // If refresh token completely fails, clear storage and redirect
      localStorage.clear();
      throw redirect({
        to: "/",
        replace: true,
      });
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
