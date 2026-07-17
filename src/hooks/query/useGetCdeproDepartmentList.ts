import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const isEVS = getIsEVS();

const getCdeproDepartmentList = async () => {
  try {
    let data;
    const response = await api.get(
      `api/${isEVS ? "evs" : "employees"}/getCdeproDepartmentList`
    );

    if (isEVS) {
      data = response.data?.data?.map((item: any) => ({
        label: item.Name,
        value: item.Name,
      }));
    }

    if (Array.isArray(response?.data)) {
      data = response.data.map((item) => ({
        label: item.DepartmentName,
        value: item.DepartmentName,
      }));
    }
    return data;
  } catch (error) {
    console.error("Error fetching cdepro department data:", error);
  }
};

export const useGetCdeproDepartmentList = () =>
  useQuery({
    queryKey: ["cdepro-department"],
    queryFn: () => getCdeproDepartmentList(),
    refetchOnWindowFocus: false,
  });
