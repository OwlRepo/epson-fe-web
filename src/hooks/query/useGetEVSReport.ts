import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface VisitorParams {
  params?: string | undefined;
}

const getEVSReports = async (params: VisitorParams) => {
  try {
    const response = await api.get(`/api/evs/reports?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching visitor data:", error);
    throw error;
  }
};

export const useGetEVSReports = (params: VisitorParams) =>
  useQuery({
    queryKey: ["evs-reports"],
    queryFn: () => getEVSReports(params),
    refetchOnWindowFocus: false,
  });
