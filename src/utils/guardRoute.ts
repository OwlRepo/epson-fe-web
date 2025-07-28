import { getEnvVar } from "./env";

export function withModuleAccess(
  permissionModules: string[],
  options: {
    onFailRedirectTo?: string;
    fallbackError?: Error;
  }
) {
  return () => {
    const access = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")!).Access
      : "";

    const hasAccess =
      access && permissionModules.some((m) => access?.includes(m));

    if (
      !hasAccess ||
      (!location.pathname.includes("evacuation-monitoring") &&
        getEnvVar("VITE_IS_EVS") === "true")
    ) {
      if (options.onFailRedirectTo) {
        throw {
          redirect: options.onFailRedirectTo,
        };
      }
      throw options.fallbackError ?? new Error("unauthorized");
    }
  };
}
