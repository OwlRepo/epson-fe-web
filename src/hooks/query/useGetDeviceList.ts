import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const getDeviceList = async () => {
  try {
    const response = await api.get(
      `api/${getIsEVS() ? "evs" : "dmg"}/getDeviceList`
    );

    return response.data.data;
  } catch (error) {
    console.error("Error fetching device list data:", error);
  }
};

export const useGetDeviceList = () =>
  useQuery({
    queryKey: ["device-list"],
    queryFn: () => getDeviceList(),
    refetchOnWindowFocus: false,
  });
