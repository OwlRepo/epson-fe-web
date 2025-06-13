import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface VisitorParams {
  params?: string | undefined;
}

const getVisitorReports = async (params: VisitorParams) => {
  try {
    const response = await api.get(`/api/vms/reports?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching visitor data:", error);
    throw error;
  }
};

export const useGetVisitorReports = (params: VisitorParams) =>
  useQuery({
    queryKey: ["visitor-reports"],
    queryFn: () => getVisitorReports(params),
    refetchOnWindowFocus: false,
  });
