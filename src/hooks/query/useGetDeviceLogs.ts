import api from "@/config/axiosInstance";
import { useInfiniteQuery } from "@tanstack/react-query";

interface DeviceParams {
  params?: string | undefined;
}

interface DeviceLogResponse {
  success: boolean;
  data: Array<{
    ID: number;
    DeviceId: string;
    Status: string;
    DateTime: string;
    Message: string | null;
  }>;
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}

const getDeviceLogs = async ({
  pageParam = 1,
  params,
}: {
  pageParam?: number;
  params?: string;
}): Promise<DeviceLogResponse> => {
  try {
    const response = await api.get(`/api/dmg/logs?${params}&page=${pageParam}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching device logs:", error);
    throw error;
  }
};

export const useGetDeviceLogs = (params: DeviceParams) =>
  useInfiniteQuery<DeviceLogResponse>({
    queryKey: ["device-logs", params],
    queryFn: ({ pageParam = 1 }) =>
      getDeviceLogs({ pageParam, params: params?.params }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.nextPage ?? undefined;
    },
    refetchOnWindowFocus: false,
  });
