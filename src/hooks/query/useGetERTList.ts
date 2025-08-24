import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getERTList = async () => {
  try {
    let data;
    const response = await api.get(`api/evs/getERTList`);

    if (Array.isArray(response?.data?.data)) {
      data = response.data.data.map((item: any) => ({
        label: item.ERT,
        value: item.ERT,
      }));
    }
    return data;
  } catch (error) {
    console.error("Error fetching department data:", error);
  }
};

export const useGetERTList = () =>
  useQuery({
    queryKey: ["ert-list"],
    queryFn: () => getERTList(),
    refetchOnWindowFocus: false,
  });
