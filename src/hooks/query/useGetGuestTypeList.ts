import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getGuestTypeList = async () => {
  try {
    const response = await api.get(`/api/vms/guestTypeList`);
    const rows = Array.isArray(response.data) ? response.data : [];
    return rows.map((item: { ID: string; Name: string }) => ({
      value: item.ID,
      label: item.Name,
    }));
  } catch (error) {
    console.error("Error fetching guest type list:", error);
    return [];
  }
};

export const useGetGuestTypeList = () =>
  useQuery({
    queryKey: ["guest-type-list"],
    queryFn: () => getGuestTypeList(),
    refetchOnWindowFocus: false,
    retry: 0,
  });
