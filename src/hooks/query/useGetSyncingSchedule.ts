import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getSyncingSchedule = async () => {
  try {
    const response = await api.get("api/syncing/schedule");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee data:", error);
  }
};

export const useGetSyncingSchedule = () =>
  useQuery({
    queryKey: ["syncing-schedule"],
    queryFn: () => getSyncingSchedule(),
    refetchOnWindowFocus: false,
  });
