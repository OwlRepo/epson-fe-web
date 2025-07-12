import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getUserbyId = async (userId: string) => {
  try {
    const response = await api.get(`api/users/getUserByID/${userId}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching visitor data:", error);
  }
};

export const useGetUserbyId = (userId: string) =>
  useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserbyId(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
