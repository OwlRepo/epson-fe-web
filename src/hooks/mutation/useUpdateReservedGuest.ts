import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const updateReservedGuest = async ({
  visitorID,
  payload,
}: {
  visitorID?: string;
  payload: {
    UHF?: string;
    Picture?: string;
    DateTo?: string;
  };
}) => {
  try {
    const response = await api.put(
      `/api/vms/updateVisitor/${visitorID}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error saving  data:", error);
    throw error;
  }
};

export const useUpdateReservedGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReservedGuest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["visitor"],
      });
      queryClient.invalidateQueries({
        queryKey: ["visitors"],
      });

      console.log("saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error savinge data:", error);
    },
  });
};
