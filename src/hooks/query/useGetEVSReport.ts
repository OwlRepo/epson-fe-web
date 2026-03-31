import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface VisitorParams {
  params?: string | undefined;
}

/** Safe fallback when the reports API is down, 404, or not deployed yet — keeps the Completed tab usable. */
const EMPTY_EVS_REPORTS = {
  data: [] as unknown[],
  pagination: { totalPages: 1, totalItems: 0 },
  Overall: 0,
  Safe: 0,
  Injured: 0,
  GoHome: 0,
  Missing: 0,
};

const getEVSReports = async (params: VisitorParams) => {
  try {
    const response = await api.get(`/api/evs/reports?${params}`);
    return response.data ?? EMPTY_EVS_REPORTS;
  } catch (error) {
    console.warn(
      "[useGetEVSReports] Request failed (endpoint may be unavailable):",
      error
    );
    return EMPTY_EVS_REPORTS;
  }
};

export const useGetEVSReports = (params: VisitorParams) =>
  useQuery({
    queryKey: ["evs-reports", params?.params],
    queryFn: () => getEVSReports(params),
    refetchOnWindowFocus: false,
    retry: 1,
  });
