import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const isEVS = getIsEVS();

const getSectionList = async () => {
  try {
    let data;
    const response = await api.get(
      `api/${isEVS ? "evs" : "employees"}/getSectionList`
    );

    if (isEVS) {
      data = response.data?.data?.map((item: any) => ({
        label: item.Name,
        value: item.Name,
      }));
    }

    if (Array.isArray(response?.data)) {
      data = response.data.map((item: any) => ({
        label: item.SectionName ?? item.Name,
        value: item.SectionName ?? item.Name,
      }));
    }
    return data;
  } catch (error) {
    console.error("Error fetching section data:", error);
  }
};

export const useGetSectionList = () =>
  useQuery({
    queryKey: ["section"],
    queryFn: () => getSectionList(),
    refetchOnWindowFocus: false,
  });
