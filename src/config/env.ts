interface Env {
  VITE_API_BASE_URL: string;
  VITE_DOCKER_BASE_URL: string;
}

// Type-safe environment variables
export const env = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  VITE_DOCKER_BASE_URL: import.meta.env.VITE_DOCKER_BASE_URL as string,
} as const;

// Validate required environment variables
const requiredEnvVars: (keyof Env)[] = [
  "VITE_API_BASE_URL",
  "VITE_DOCKER_BASE_URL",
];

requiredEnvVars.forEach((key) => {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
