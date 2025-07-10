import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getRoles = async () => {
  try {
    const response = await api.get(`/api/users/getRoles`);

    return response.data.data.map((item: any) => ({
      value: item.Name,
      label: item.Name,
    }));
  } catch (error) {
    console.error("Error fetching   data:", error);
    throw error;
  }
};

export const useGetRoles = () =>
  useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(),
    refetchOnWindowFocus: false,
  });
