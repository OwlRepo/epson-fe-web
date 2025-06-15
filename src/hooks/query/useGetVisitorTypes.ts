import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getVisitorTypes = async () => {
  try {
    const response = await api.get(`/api/vms/guestTypeList`);
    return response.data;
  } catch (error) {
    console.error("Error fetching visitor data:", error);
    throw error;
  }
};

export const useGetVisitorTypes = () =>
  useQuery({
    queryKey: ["visitor-types"],
    queryFn: () => getVisitorTypes(),
    refetchOnWindowFocus: false,
  });
