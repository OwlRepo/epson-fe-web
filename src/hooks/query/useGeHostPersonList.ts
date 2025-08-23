import api from "@/config/axiosInstance";
import { getIsEVS } from "@/utils/env";
import { useQuery } from "@tanstack/react-query";

const isEVS = getIsEVS();

const getHostPerson = async (hostPerson: string) => {
  try {
    const response = await api.get(
      `/api/${isEVS ? "evs" : "vms"}/hostperson?HostPerson=${hostPerson}`
    );

    return response.data.data.map((item: any) => ({
      value: item.HOSTPERSON,
      label: item.HOSTPERSON,
      email: item.EmailAddress,
      id: item.EmployeeID,
      employeeNo: item.EmployeeNo,
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
