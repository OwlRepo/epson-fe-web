import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getVisitorReports = async (queryString: string) => {
  const response = await api.get(`/api/vms/reports?${queryString}`);
  return response.data;
};

/** queryString: from objToParams(search) — refetches when search changes via queryKey */
export const useGetVisitorReports = (queryString: string) =>
  useQuery({
    queryKey: ["visitor-reports", queryString],
    queryFn: () => getVisitorReports(queryString),
    refetchOnWindowFocus: false,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404 || status === 400 || status === 422) return false;
      return failureCount < 2;
    },
  });
