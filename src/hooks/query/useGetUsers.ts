import api from "@/config/axiosInstance";
import type { EmployeeData } from "@/routes/_authenticated/attendance-monitoring/employees";
import { useQuery } from "@tanstack/react-query";

interface EmployeeParams {
  params?: string | undefined;
}

const getUsers = async (params: EmployeeParams) => {
  try {
    const response = await api.get(`/api/employees/getAll?${params}`);

    const data = response.data.data.map((item: EmployeeData) => ({
      ...item,
      Name: item.FirstName,
      Access:
        item.DepartmentName === "GAD"
          ? ["VMS", "AMS", "Dashboard"]
          : ["VMS", "AMS"],
      IsActive: true,
    }));

    return { ...response.data, data };
  } catch (error) {
    console.error("Error fetching employee data:", error);
    throw error;
  }
};

export const useGetUsers = (params: EmployeeParams) =>
  useQuery({
    queryKey: ["employees"],
    queryFn: () => getUsers(params),
    refetchOnWindowFocus: false,
  });
