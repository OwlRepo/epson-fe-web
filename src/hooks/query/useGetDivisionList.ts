import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const isEVS = getIsEVS();

const getDivisionList = async () => {
  try {
    let data;
    const response = await api.get(
      `api/${isEVS ? "evs" : "employees"}/getDivisionList`
    );

    if (isEVS) {
      data = response.data?.data?.map((item: any) => ({
        label: item.Name,
        value: item.Name,
      }));
    }

    if (Array.isArray(response?.data)) {
      data = response.data.map((item: any) => ({
        label: item.DivisionName ?? item.Name,
        value: item.DivisionName ?? item.Name,
      }));
    }
    return data;
  } catch (error) {
    console.error("Error fetching division data:", error);
  }
};

export const useGetDivisionList = () =>
  useQuery({
    queryKey: ["division"],
    queryFn: () => getDivisionList(),
    refetchOnWindowFocus: false,
  });
