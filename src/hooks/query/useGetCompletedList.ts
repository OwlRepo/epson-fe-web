import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getCompletedList = async () => {
  try {
    // let data;
    const response = await api.get(`api/evs/getCompletedList`);

    // if (Array.isArray(response?.data?.data)) {
    //   data = response.data.data.map((item: any) => ({
    //     label: item.Type,
    //     value: item.Type,
    //   }));
    // }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching department data:", error);
  }
};

export const useGetCompletedList = () =>
  useQuery({
    queryKey: ["completed-list"],
    queryFn: () => getCompletedList(),
    refetchOnWindowFocus: false,
  });
