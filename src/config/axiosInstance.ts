import axios from "axios";
import { toast } from "sonner";
import { ToastType } from "@/hooks/useToastStyleTheme";
import { getApiRESTBaseUrl } from "@/utils/env";

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
  baseURL: getApiRESTBaseUrl(),
  headers: {
    "ngrok-skip-browser-warning": "true",
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
      config.headers.Authorization = `Bearer ${token.includes("Bearer") ? token.split(" ")[1] : token}`;
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
        style: JSON.parse(ToastType.SUCCESS_STYLE),
      });
    }
    return response;
  },
  (error) => {
    const toastConfig = error.config?.toastConfig?.error;
    const errorMessage =
      error.response?.data?.message || error.response?.message || error.message || "An error occurred";

    
    if (error.response?.status === 401 && window.location.pathname !== "/") {
      localStorage.removeItem("token");
      window.location.href = "/";
      if (toastConfig) {
        toast.error(toastConfig.title || "Request failed", {
          description: errorMessage || "Please login again",
          className: "bg-red-50 border-red-200 text-red-800",
          style: JSON.parse(ToastType.ERROR_STYLE),
        });
      }
    }
    else{
      toast.error(toastConfig?.title || "Request failed", {
        description: errorMessage || "Login failed. Please try again.",
        className: "bg-red-50 border-red-200 text-red-800",
        style: JSON.parse(ToastType.ERROR_STYLE),
      });
    }

    return Promise.reject(error);
  }
);

export default api;
