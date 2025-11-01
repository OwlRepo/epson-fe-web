export const USE_STATIC_ENVS = false; // Set to true to use static environment variables which are the ones defined in the STATIC_ENVS object below

export const STATIC_ENVS: Record<string, string> = {
  // Core toggles and URLs
  VITE_IS_EVS: "false",
  VITE_EVS_APP_BASE_URL: "",
  VITE_API_SOCKET_EVS_URL: "",
  VITE_API_SOCKET_URL: "",
  VITE_API_REST_EVS_URL: "",
  VITE_API_REST_URL: "",

  // Auth / Valid IDs
  VITE_VALID_USER_CARD_ID: "", // e.g. "123|456|789"

  // Device config
  VITE_UHF_DEVICE_ID: "",
  VITE_UHF_PRODUCT_ID: "",
  VITE_UHF_LENGTH: "0",
  VITE_MIFARE_LENGTH: "0",
  VITE_EM_LENGTH: "0",
  VITE_IS_SERIAL_CONNECTION: "0",
};

const NUMERIC_ENV_KEYS = new Set<string>([
  "VITE_UHF_LENGTH",
  "VITE_MIFARE_LENGTH",
  "VITE_EM_LENGTH",
  "VITE_IS_SERIAL_CONNECTION",
]);

export const getStaticEnvVar = (key: string): string => {
  const value = STATIC_ENVS[key] ?? "";
  if (NUMERIC_ENV_KEYS.has(key)) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? String(parsed) : "0";
  }
  return value;
};
