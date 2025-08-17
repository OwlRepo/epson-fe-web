declare global {
  interface Window {
    ENV: Record<string, string>;
  }
}

export const getEnvVar = (key: string): string => {
  // In development, use import.meta.env
  if (import.meta.env.DEV) {
    return import.meta.env[key] || "";
  }

  // In production, use window.env
  return window.ENV?.[key] || "";
};

// Create specific getters for each env variable
export const getIsEVS = () => getEnvVar("VITE_IS_EVS") === "true";
export const getEVSAppBaseUrl = () => getEnvVar("VITE_EVS_APP_BASE_URL");
export const getApiSocketBaseUrl = () =>
  `${getEnvVar("VITE_IS_EVS") === "true" ? getEnvVar("VITE_API_SOCKET_EVS_URL") : getEnvVar("VITE_API_SOCKET_URL")}`;
export const getApiRESTBaseUrl = () => `${getEnvVar("VITE_API_REST_URL")}`;
export const getValidUserID = () =>
  getEnvVar("VITE_VALID_USER_CARD_ID").split("|") ?? [];
export const getUHFDeviceID = () => getEnvVar("VITE_UHF_DEVICE_ID");
export const getUHFProductID = () => getEnvVar("VITE_UHF_PRODUCT_ID");
export const getUHFLength = () => parseInt(getEnvVar("VITE_UHF_LENGTH"));
export const getMIFARELength = () => parseInt(getEnvVar("VITE_MIFARE_LENGTH"));
export const getEMLength = () => parseInt(getEnvVar("VITE_EM_LENGTH"));
export const getIsSerialConnection = () =>
  parseInt(getEnvVar("VITE_IS_SERIAL_CONNECTION"));

// Add other env variable getters as needed
