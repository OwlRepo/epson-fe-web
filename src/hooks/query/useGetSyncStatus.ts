import api from "@/config/axiosInstance";
import { getSyncStatusCheckInterval } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const getSyncStatus = async () => {
  try {
    const response = await api.get(`api/syncing/status`);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching sync status data:", error);
  }
};

export const useGetSyncStatus = (props: { enabled: boolean }) =>
  useQuery({
    queryKey: ["sync-status", props.enabled],
    queryFn: () => getSyncStatus(),
    refetchInterval: props.enabled ? getSyncStatusCheckInterval() : false,
    enabled: props.enabled,
  });
