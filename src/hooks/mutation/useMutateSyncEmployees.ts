import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useToastStyleTheme from "../useToastStyleTheme";

const syncEmployees = async () => {
  try {
    const response = await api.post("/api/syncing/manually", {
      timeout: 120000,
    });
    return response.data;
  } catch (error) {
    console.error("Error syncing employees:", error);
    throw error;
  }
};

export const useMutateSyncEmployees = () => {
  const queryClient = useQueryClient();

  const { errorStyle } = useToastStyleTheme();
  
  return useMutation({
    mutationFn: syncEmployees,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      console.log("Employee data synced successfully:", data);
    },
    onError: (error: any) => {
      if(error?.response?.data?.message){
        toast.error(error?.response?.data?.message, {
          style: errorStyle,
        });
      } else {
        toast.error("Error syncing employee data", {
          style: errorStyle,
        });
      }
      console.error("Error syncing employee data:", error);
    },
  });
};
