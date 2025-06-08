import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getGuestTypeList = async () => {
  try {
    const response = await api.get(`/api/vms/guestTypeList`);
    return response.data.map((item: any) => ({
      value: item.Name,
      label: item.Name,
    }));
  } catch (error) {
    console.error("Error fetching host person data:", error);
    throw error;
  }
};

export const useGetGuestTypeList = () =>
  useQuery({
    queryKey: ["guest-type-list"],
    queryFn: () => getGuestTypeList(),
    refetchOnWindowFocus: false,
  });
