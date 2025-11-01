import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getCompletedList = async () => {
  try {
    const response = await api.get(`api/evs/getCompletedList`);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching completed list data:", error);
  }
};

export const useGetCompletedList = () =>
  useQuery({
    queryKey: ["completed-list"],
    queryFn: () => getCompletedList(),
    refetchOnWindowFocus: false,
  });
