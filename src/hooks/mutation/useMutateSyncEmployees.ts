import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  return useMutation({
    mutationFn: syncEmployees,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      console.log("Employee data synced successfully:", data);
    },
    onError: (error) => {
      console.error("Error syncing employee data:", error);
    },
  });
};
