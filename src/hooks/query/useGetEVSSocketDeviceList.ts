import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { getApiSocketBaseUrl } from "@/utils/env";

type DeviceListRow = {
  ID?: unknown;
  DeviceName?: unknown;
};

export type DeviceFilterOption = {
  label: string;
  value: string;
};

function cleanString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function mapEVSSocketDeviceListOptions(
  rows: unknown
): DeviceFilterOption[] {
  if (!Array.isArray(rows)) return [];

  const seenIds = new Set<string>();
  const options: DeviceFilterOption[] = [];

  rows.forEach((row) => {
    const item = row as DeviceListRow;
    const id = cleanString(item.ID);
    const deviceName = cleanString(item.DeviceName);

    if (!id || !deviceName || seenIds.has(id)) return;

    seenIds.add(id);
    options.push({
      label: deviceName,
      value: id,
    });
  });

  return options;
}

const getEVSSocketDeviceList = async (): Promise<DeviceFilterOption[]> => {
  try {
    const response = await axios.get(`${getApiSocketBaseUrl()}/device_list`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Accept: "application/json",
      },
    });

    return mapEVSSocketDeviceListOptions(response.data);
  } catch (error) {
    console.error("Error fetching EVS socket device list:", error);
    return [];
  }
};

export const useGetEVSSocketDeviceList = () =>
  useQuery({
    queryKey: ["evs-socket-device-list"],
    queryFn: getEVSSocketDeviceList,
    refetchOnWindowFocus: false,
    retry: 1,
  });
