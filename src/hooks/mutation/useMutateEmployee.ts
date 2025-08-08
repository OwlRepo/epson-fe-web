import api from "@/config/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const saveEmployeeData = async ({
  employeeNo,
  payload,
}: {
  employeeNo?: string;
  payload: any;
}) => {
  try {
    const response = await api.put(`/api/employees/${employeeNo}`, payload);
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
        queryKey: ["employee", payload.employeeNo],
      });
      console.log("Employee data saved successfully:", data);
    },
    onError: (error) => {
      console.error("Error saving employee data:", error);
    },
  });
};
