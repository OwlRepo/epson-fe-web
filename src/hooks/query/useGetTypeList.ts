import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getTypeList = async () => {
  try {
    let data;
    const response = await api.get(`api/evs/getTypeList`);

    if (Array.isArray(response?.data?.data)) {
      data = response.data.data.map((item: any) => ({
        label: item.Type,
        value: item.Type,
      }));
    }
    return data;
  } catch (error) {
    console.error("Error fetching department data:", error);
  }
};

export const useGetTypeList = () =>
  useQuery({
    queryKey: ["type-list"],
    queryFn: () => getTypeList(),
    refetchOnWindowFocus: false,
  });
