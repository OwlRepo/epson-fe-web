declare global {
  interface Window {
    env: Record<string, string>;
  }
}

export const getEnvVar = (key: string): string => {
  return import.meta.env[key] || "";
};

// Create specific getters for each env variable
export const getApiSocketBaseUrl = () =>
  `${getEnvVar("VITE_API_BASE_IP")}:${getEnvVar("VITE_API_SOCKET_PORT")}`;
export const getApiRESTBaseUrl = () =>
  `${getEnvVar("VITE_API_BASE_IP")}:${getEnvVar("VITE_API_REST_PORT")}`;
export const getValidUserID = () =>
  getEnvVar("VITE_VALID_USER_CARD_ID").split("|") ?? [];
export const getUHFDeviceID = () => getEnvVar("VITE_UHF_DEVICE_ID");
export const getUHFProductID = () => getEnvVar("VITE_UHF_PRODUCT_ID");
// Add other env variable getters as needed
