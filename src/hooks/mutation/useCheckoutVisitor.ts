import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import useToastStyleTheme from "../useToastStyleTheme";

const checkoutVisitor = async (payload: { VisitorID: string }) => {
  try {
    const response = await api.post(`/api/vms/registerDayPass`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving employee data:", error);
    throw error;
  }
};

export const useCheckoutVisitor = () => {
  const queryClient = useQueryClient();

  const { errorStyle, successStyle } = useToastStyleTheme();
  return useMutation({
    mutationFn: checkoutVisitor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["visitor"],
      });
      toast.success("Visitor Check-Out Successful", {
        description: "The guest has checked out successfully.",
        style: successStyle,
      });
      console.log("Checked out successfully:", data);
    },
    onError: (error) => {
      console.error("Error checkout:", error);
      toast.error("Visitor Check-Out UnSuccessful", {
        description:
          (error as any)?.response?.data?.message ??
          "An unknown error occurred",
        style: errorStyle,
      });
    },
  });
};
