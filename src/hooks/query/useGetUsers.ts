import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface EmployeeParams {
  params?: string | undefined;
}

const getUsers = async (params: EmployeeParams) => {
  try {
    const response = await api.get(`/api/users/getAllUsers?${params}`);

    const data = response.data.data;

    return { ...response.data, data };
  } catch (error) {
    console.error("Error fetching employee data:", error);
    throw error;
  }
};

export const useGetUsers = (params: EmployeeParams) =>
  useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(params),
    refetchOnWindowFocus: false,
  });
