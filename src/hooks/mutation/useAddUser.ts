import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const registerUser = async (payload: any) => {
  try {
    const response = await api.post(`/api/users/register`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving  data:", error);
    throw error;
  }
};

export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      console.log("Saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error data:", error);
    },
  });
};
