import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface VisitorParams {
  params?: string | undefined;
}

const getVisitors = async (params: VisitorParams) => {
  try {
    const response = await api.get(`/api/vms/reservedGuest?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching visitor data:", error);
    throw error;
  }
};

export const useGetVisitors = (params: VisitorParams) =>
  useQuery({
    queryKey: ["visitors"],
    queryFn: () => getVisitors(params),
    refetchOnWindowFocus: false,
  });
