import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const saveSyncDate = async ({ id, payload }: { id?: string; payload: any }) => {
  try {
    const response = await api.put(`/api/syncing/schedule/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("ESync Schedule:", error);
    throw error;
  }
};

export const useMutateSyncSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSyncDate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
      console.log("Sync Schedule saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error Sync Schedule:", error);
    },
  });
};
