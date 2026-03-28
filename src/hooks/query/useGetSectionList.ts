import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const isEVS = getIsEVS();

type Option = { label: string; value: string };

const getSectionList = async (): Promise<Option[]> => {
  try {
    let data: Option[] | undefined;
    const response = await api.get(
      `api/${isEVS ? "evs" : "employees"}/getSectionList`
    );

    if (isEVS) {
      const rows = response.data?.data;
      if (Array.isArray(rows)) {
        data = rows
          .map((item: { Name?: string }) => ({
            label: item.Name ?? "",
            value: item.Name ?? "",
          }))
          .filter((o) => o.value);
      }
    } else if (Array.isArray(response?.data)) {
      data = response.data
        .map((item: any) => ({
          label: item.SectionName ?? item.Name ?? "",
          value: item.SectionName ?? item.Name ?? "",
        }))
        .filter((o) => o.value);
    }

    return data ?? [];
  } catch {
    // Endpoint may not exist yet; keep reports usable without section filter options.
    return [];
  }
};

export const useGetSectionList = () =>
  useQuery({
    queryKey: ["section"],
    queryFn: getSectionList,
    retry: 0,
    refetchOnWindowFocus: false,
  });
