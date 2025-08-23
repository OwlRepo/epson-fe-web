import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const isEVS = getIsEVS();

const getDepartmentList = async () => {
  try {
    let data;
    const response = await api.get(
      `api/${isEVS ? "evs" : "employees"}/getDepartmentList`
    );
    if (Array.isArray(response?.data)) {
      data = response.data.map((item) => ({
        label: item.DepartmentName,
        value: item.DepartmentName,
      }));
    }
    return data;
  } catch (error) {
    console.error("Error fetching department data:", error);
  }
};

export const useGetDepartmentList = () =>
  useQuery({
    queryKey: ["department"],
    queryFn: () => getDepartmentList(),
    refetchOnWindowFocus: false,
  });
