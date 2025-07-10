import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const updateuser = async ({
  employeeID,
  payload,
}: {
  employeeID?: string;
  payload: any;
}) => {
  try {
    const response = await api.put(
      `/api/users/updateUser/${employeeID}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error saving  data:", error);
    throw error;
  }
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateuser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });

      console.log(" data saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error saving  data:", error);
    },
  });
};
