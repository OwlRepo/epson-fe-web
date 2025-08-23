import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const isEVS = getIsEVS();

const getEmployeeByNo = async (employeeNo: string) => {
  try {
    const response = await api.get(
      `api/${isEVS ? "evs" : "employees"}/getByEmployeeNo/${employeeNo}`
    );
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
