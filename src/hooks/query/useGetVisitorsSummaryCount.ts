import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getVisitorsSummaryCount = async () => {
  try {
    //TODO: replace with the actual endpoint
    const response = await api.get(`/api/vms/reservedGuest/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching visitor summary count data:", error);
    throw error;
  }
};

export const useGetVisitorsSummaryCount = () =>
  useQuery({
    queryKey: ["visitors-summary-count"],
    queryFn: () => getVisitorsSummaryCount(),
    refetchOnWindowFocus: false,
  });
