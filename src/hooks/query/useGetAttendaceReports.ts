import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface EmployeeParams {
  params?: string | undefined;
}

const getAttendanceReports = async (params: EmployeeParams) => {
  try {
    const response = await api.get(`/api/employees/reports?${params}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee data:", error);
    throw error;
  }
};

export const useGetEmployeeReports = (params: EmployeeParams) =>
  useQuery({
    queryKey: ["employee-reports"],
    queryFn: () => getAttendanceReports(params),
    refetchOnWindowFocus: false,
  });
