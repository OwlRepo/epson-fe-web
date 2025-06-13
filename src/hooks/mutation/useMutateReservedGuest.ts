import type { VisitorData } from "@/components/BasicInformationForm";
import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const registerReservedGuest = async (payload: VisitorData) => {
  const { Date, type, ...payloadNew } = payload;
  try {
    const response = await api.post(`/api/vms/reservedGuest`, {
      ...payloadNew,
      DateFrom: payload.Date.from.toISOString(),
      DateTo: payload.Date.to.toISOString(),
      Picture: payload.Picture,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving employee data:", error);
    throw error;
  }
};

export const useMutateReservedGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerReservedGuest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["day-pass"],
      });

      console.log("Daypass saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error saving day pass data:", error);
    },
  });
};
