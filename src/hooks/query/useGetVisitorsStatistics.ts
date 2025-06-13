import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getVisitorsStatistics = async () => {
  try {
    const response = await api.get(`/api/vms/visitorsOverview`);
    return response.data;
  } catch (error) {
    console.error("Error fetching visitor data:", error);
    throw error;
  }
};

export const useGetVisitorsStatistics = () =>
  useQuery({
    queryKey: ["visitors-statistics"],
    queryFn: () => getVisitorsStatistics(),
    refetchOnWindowFocus: false,
  });
