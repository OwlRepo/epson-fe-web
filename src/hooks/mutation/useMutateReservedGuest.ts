import type { VisitorData } from "@/components/BasicInformationForm";
import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const registerReservedGuest = async (payload: VisitorData) => {
  const { Date, type, ...payloadNew } = payload;
  try {
    const response = await api.post(`/api/vms/reservedGuest`, {
      ...payloadNew,
      // Use only the date portion in "YYYY-MM-DD" (PHT, but date only, no time)
      DateFrom: payload.Date.from.toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila",
      }),
      DateTo: payload.Date.to.toLocaleDateString("en-CA", {
        timeZone: "Asia/Manila",
      }),
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
