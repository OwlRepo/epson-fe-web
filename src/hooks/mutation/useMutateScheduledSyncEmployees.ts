import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const schedSyncEmployees = async () => {
  try {
    const response = await api.get("/api/employees/sync");
    return response.data;
  } catch (error) {
    console.error("Error scheduled syncing employees:", error);
    throw error;
  }
};

export const useMutateScheduledSyncEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: schedSyncEmployees,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      console.log("Scheduled sync saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error scheduled syncing employee data:", error);
    },
  });
};
