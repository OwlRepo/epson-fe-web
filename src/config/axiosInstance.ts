import axios from "axios";
import envVariables from "./envVariables";
import { toast } from "sonner";

// Extend the AxiosRequestConfig type to include our custom properties
declare module "axios" {
  export interface AxiosRequestConfig {
    toastConfig?: {
      success?: {
        title?: string;
        message?: string;
      };
      error?: {
        title?: string;
        message?: string;
      };
    };
  }
}

export const api = axios.create({
  baseURL: envVariables.API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Authorization: "Bearer",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const toastConfig = response.config.toastConfig?.success;
    if (toastConfig) {
      toast.success(toastConfig.title || "Request successful", {
        description:
          toastConfig.message || "Your request was completed successfully",
        className: "bg-green-50 border-green-200 text-green-800",
        style: {
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          color: "#166534",
        },
      });
    }
    return response;
  },
  (error) => {
    const toastConfig = error.config?.toastConfig?.error;
    const errorMessage =
      error.response?.data?.message || error.message || "An error occurred";

    if (toastConfig) {
      toast.error(toastConfig.title || "Request failed", {
        description: toastConfig.message || errorMessage,
        className: "bg-red-50 border-red-200 text-red-800",
        style: {
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#991b1b",
        },
      });
    }

    return Promise.reject(error);
  }
);

export default api;
