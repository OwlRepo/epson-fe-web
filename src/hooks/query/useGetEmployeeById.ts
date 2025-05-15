import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getEmployeeByNo = async (employeeNo: string) => {
  try {
    const response = await api.get(`api/employees/${employeeNo}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee data:", error);
  }
};

export const useGetEmployeeByNo = (employeeNo: string) =>
  useQuery({
    queryKey: ["employee", employeeNo],
    queryFn: () => getEmployeeByNo(employeeNo),
    enabled: !!employeeNo,
    refetchOnWindowFocus: false,
  });
