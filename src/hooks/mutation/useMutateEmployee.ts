import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const saveEmployeeData = async ({
  employeeID,
  payload,
}: {
  employeeID?: string;
  payload: any;
}) => {
  try {
    const response = await api.put(`/api/employees/${employeeID}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error saving employee data:", error);
    throw error;
  }
};

export const useMutateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveEmployeeData,
    onSuccess: (data, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee", payload.employeeID],
      });
      console.log("Employee data saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error saving employee data:", error);
    },
  });
};
