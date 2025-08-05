import api from "@/config/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const getHostPerson = async (hostPerson: string) => {
  try {
    const response = await api.get(
      `/api/vms/hostperson?HostPerson=${hostPerson}`
    );

    return response.data.data.map((item: any) => ({
      value: item.HOSTPERSON,
      label: item.HOSTPERSON,
      id: item.EmployeeID,
    }));
  } catch (error) {
    console.error("Error fetching host person data:", error);
    throw error;
  }
};

export const useGetHostPerson = (hostPerson: string) =>
  useQuery({
    queryKey: ["host-person-list", hostPerson],
    queryFn: () => getHostPerson(hostPerson),
    refetchOnWindowFocus: false,
    enabled: !!hostPerson,
  });
