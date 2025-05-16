import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface EmployeeParams {
  params?: string | undefined;
}

const getSyncActivities = async (params: EmployeeParams) => {
  try {
    const response = await api.get(`/api/syncing/logs?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching synced data:", error);
    throw error;
  }
};

export const useGetSyncActivities = (params: EmployeeParams) =>
  useQuery({
    queryKey: ["employees"],
    queryFn: () => getSyncActivities(params),
    refetchOnWindowFocus: false,
  });
