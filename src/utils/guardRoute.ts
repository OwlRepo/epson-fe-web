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

    console.log("access", access);
    const hasAccess =
      access && permissionModules.some((m) => access?.includes(m));

    if (!hasAccess) {
      if (options.onFailRedirectTo) {
        throw {
          redirect: options.onFailRedirectTo,
        };
      }
      throw options.fallbackError ?? new Error("unauthorized");
    }
  };
}
