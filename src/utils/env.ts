declare global {
  interface Window {
    env: Record<string, string>;
  }
}

export const getEnvVar = (key: string): string => {
  return import.meta.env[key] || "";
};

// Create specific getters for each env variable
export const getApiSocketBaseUrl = () => `${getEnvVar("VITE_API_BASE_IP")}:${getEnvVar("VITE_API_SOCKET_PORT")}`;
export const getApiRESTBaseUrl = () => `${getEnvVar("VITE_API_BASE_IP")}:${getEnvVar("VITE_API_REST_PORT")}`;
// Add other env variable getters as needed
