import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const isEVS = getIsEVS();

type Option = { label: string; value: string };

const getDivisionList = async (): Promise<Option[]> => {
  try {
    let data: Option[] | undefined;
    const response = await api.get(
      `api/${isEVS ? "evs" : "employees"}/getDivisionList`
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
          label: item.DivisionName ?? item.Name ?? "",
          value: item.DivisionName ?? item.Name ?? "",
        }))
        .filter((o) => o.value);
    }

    return data ?? [];
  } catch {
    // Endpoint may not exist yet; keep reports usable without division filter options.
    return [];
  }
};

export const useGetDivisionList = () =>
  useQuery({
    queryKey: ["division"],
    queryFn: getDivisionList,
    retry: 0,
    refetchOnWindowFocus: false,
  });
