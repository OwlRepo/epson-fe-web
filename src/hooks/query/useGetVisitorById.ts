import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getVisitorById = async (visitorId: string) => {
  try {
    const response = await api.get(`api/vms/visitorByID/${visitorId}`, {
      params: { t: Date.now() },
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching visitor data:", error);
  }
};

export const useGetVisitorById = (visitorId: string) =>
  useQuery({
    queryKey: ["visitor", visitorId],
    queryFn: () => getVisitorById(visitorId),
    enabled: !!visitorId,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    staleTime: 0,
  });
