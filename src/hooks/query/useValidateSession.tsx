import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const validateSession = async () => {
  try {
    const response = await api.get(`/api/users/validate`);
    return response.data;
  } catch (error) {
    console.error("Error validating session:", error);
    throw error;
  }
};

interface Props {
  queryKey: string[];
}

export const useValidateSession = (props: Props) =>
  useQuery({
    queryKey: props.queryKey,
    queryFn: () => validateSession(),
    refetchOnWindowFocus: false,
  });
